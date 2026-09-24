import "server-only";
import { cookies } from "next/headers";
import { db } from "@/db";
import { students, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sign, unsign } from "./signing";

const COOKIE_NAME = "diggle_session";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function setSession(studentId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, sign(studentId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionStudentId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return unsign(raw);
}

export type CurrentStudent = {
  id: string;
  displayName: string;
  avatarKey: string;
  xp: number;
  level: number;
  streak: number;
  equippedCosmetic: string | null;
  classId: string;
  className: string;
  joinCode: string;
  currentLessonWeek: number;
  freeRoam: boolean;
  currentStepOrder: number;
  revealedStepOrder: number;
};

export async function getCurrentStudent(): Promise<CurrentStudent | null> {
  const id = await getSessionStudentId();
  if (!id) return null;
  const rows = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      avatarKey: students.avatarKey,
      xp: students.xp,
      level: students.level,
      streak: students.streak,
      equippedCosmetic: students.equippedCosmetic,
      classId: classes.id,
      className: classes.name,
      joinCode: classes.joinCode,
      currentLessonWeek: classes.currentLessonWeek,
      freeRoam: classes.freeRoam,
      currentStepOrder: classes.currentStepOrder,
      revealedStepOrder: classes.revealedStepOrder,
    })
    .from(students)
    .innerJoin(classes, eq(students.classId, classes.id))
    .where(eq(students.id, id))
    .limit(1);
  return rows[0] ?? null;
}
