"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { classes, students, events } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { isValidAvatar } from "@/lib/avatars";
import { setSession, setPendingClass, getPendingClassId } from "@/lib/session";

export type ClassRoster = {
  classId: string;
  className: string;
  students: { id: string; displayName: string; avatarKey: string }[];
};

export type LookupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; roster: ClassRoster };

function normalizeCode(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadRoster(classId: string): Promise<ClassRoster | null> {
  const cls = await db
    .select({ id: classes.id, name: classes.name })
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);
  if (!cls[0]) return null;
  const roster = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      avatarKey: students.avatarKey,
    })
    .from(students)
    .where(eq(students.classId, classId))
    .orderBy(students.displayName);
  return { classId, className: cls[0].name, students: roster };
}

export async function lookupClassAction(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const code = normalizeCode(String(formData.get("code") ?? ""));
  if (!code) return { status: "error", message: "Type your class code." };

  const cls = await db
    .select({ id: classes.id })
    .from(classes)
    .where(eq(classes.joinCode, code))
    .limit(1);

  if (!cls[0]) {
    return {
      status: "error",
      message: "That code didn't match a class. Check the spelling with your teacher.",
    };
  }

  await setPendingClass(cls[0].id);
  const roster = await loadRoster(cls[0].id);
  if (!roster) return { status: "error", message: "Something went wrong. Try again." };
  return { status: "ok", roster };
}

export async function signInAction(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "");
  const pendingClassId = await getPendingClassId();
  if (!pendingClassId) redirect("/join");

  const row = await db
    .select({ id: students.id, classId: students.classId })
    .from(students)
    .where(and(eq(students.id, studentId), eq(students.classId, pendingClassId)))
    .limit(1);

  if (!row[0]) redirect("/join");

  await db
    .update(students)
    .set({ lastSeen: new Date() })
    .where(eq(students.id, studentId));
  await setSession(studentId);
  redirect("/me");
}

export type RegisterState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const pendingClassId = await getPendingClassId();
  if (!pendingClassId) return { status: "error", message: "Enter your class code again." };

  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 24);
  const avatarKey = String(formData.get("avatarKey") ?? "");

  if (displayName.length < 2) {
    return { status: "error", message: "Type a name with at least 2 letters." };
  }
  if (!isValidAvatar(avatarKey)) {
    return { status: "error", message: "Pick an avatar." };
  }

  const clash = await db
    .select({ id: students.id })
    .from(students)
    .where(
      and(
        eq(students.classId, pendingClassId),
        eq(students.displayName, displayName),
      ),
    )
    .limit(1);
  if (clash[0]) {
    return {
      status: "error",
      message: "Someone in your class already has that name. Try adding your initial.",
    };
  }

  const [created] = await db
    .insert(students)
    .values({
      classId: pendingClassId,
      displayName,
      avatarKey,
      lastSeen: new Date(),
    })
    .returning({ id: students.id });

  await db.insert(events).values({
    classId: pendingClassId,
    studentId: created.id,
    type: "student_joined",
    payloadJson: { displayName },
  });

  await setSession(created.id);
  redirect("/me");
}
