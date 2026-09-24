"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { classes, students, badges, studentBadges, progress, events } from "@/db/schema";
import { requireTeacher } from "@/lib/teacher";
import { generateJoinCode } from "@/lib/joincode";

export async function createClassAction(formData: FormData) {
  await requireTeacher();
  const name = String(formData.get("name") ?? "").trim().slice(0, 60) || "My Class";

  let joinCode = generateJoinCode();
  for (let i = 0; i < 5; i++) {
    const clash = await db
      .select({ id: classes.id })
      .from(classes)
      .where(eq(classes.joinCode, joinCode))
      .limit(1);
    if (!clash[0]) break;
    joinCode = generateJoinCode();
  }

  const [created] = await db
    .insert(classes)
    .values({ name, joinCode })
    .returning({ id: classes.id });
  redirect(`/teacher/class/${created.id}`);
}

export async function setWeekAction(classId: string, week: number) {
  await requireTeacher();
  await db
    .update(classes)
    .set({
      currentLessonWeek: Math.max(1, Math.min(8, week)),
      currentStepOrder: 1,
      revealedStepOrder: 0,
    })
    .where(eq(classes.id, classId));
  revalidatePath(`/teacher/class/${classId}`);
}

export async function toggleFreeRoamAction(classId: string, value: boolean) {
  await requireTeacher();
  await db.update(classes).set({ freeRoam: value }).where(eq(classes.id, classId));
  revalidatePath(`/teacher/class/${classId}`);
}

/**
 * Called from the projector as the teacher steps through the lesson, or
 * from its "unlock next step early" button. Students can never move past
 * whatever this is currently set to (bonus challenges are exempt).
 */
export async function setCurrentStepOrderAction(classId: string, order: number) {
  await requireTeacher();
  await db
    .update(classes)
    .set({ currentStepOrder: Math.max(1, order) })
    .where(eq(classes.id, classId));
}

/**
 * Called when the teacher clicks "reveal" on a teach step's explanation.
 * One-way — a student's copy of that step shows the explanation for good
 * once revealed, even if the teacher later toggles their own view back to
 * hidden (that toggle only affects the projector's own screen).
 */
export async function revealStepOrderAction(classId: string, order: number) {
  await requireTeacher();
  await db
    .update(classes)
    .set({ revealedStepOrder: sql`greatest(${classes.revealedStepOrder}, ${order})` })
    .where(eq(classes.id, classId));
}

export async function renameStudentAction(
  classId: string,
  studentId: string,
  name: string,
) {
  await requireTeacher();
  const clean = name.trim().slice(0, 24);
  if (clean.length < 2) return;
  await db
    .update(students)
    .set({ displayName: clean })
    .where(and(eq(students.id, studentId), eq(students.classId, classId)));
  revalidatePath(`/teacher/class/${classId}`);
}

export async function deleteStudentAction(classId: string, studentId: string) {
  await requireTeacher();
  await db
    .delete(students)
    .where(and(eq(students.id, studentId), eq(students.classId, classId)));
  revalidatePath(`/teacher/class/${classId}`);
}

export async function awardHelperBadgeAction(classId: string, studentId: string) {
  await requireTeacher();
  const [b] = await db
    .select()
    .from(badges)
    .where(eq(badges.key, "helper"))
    .limit(1);
  if (!b) return;
  const res = await db
    .insert(studentBadges)
    .values({ studentId, badgeId: b.id })
    .onConflictDoNothing()
    .returning({ badgeId: studentBadges.badgeId });
  if (res.length > 0) {
    await db.insert(events).values({
      classId,
      studentId,
      type: "badge_awarded",
      payloadJson: { key: "helper", by: "teacher" },
    });
  }
  revalidatePath(`/teacher/class/${classId}`);
}

export async function resetStudentProgressAction(
  classId: string,
  studentId: string,
) {
  await requireTeacher();
  await db.delete(progress).where(eq(progress.studentId, studentId));
  await db
    .update(students)
    .set({ xp: 0, level: 1 })
    .where(and(eq(students.id, studentId), eq(students.classId, classId)));
  revalidatePath(`/teacher/class/${classId}`);
}
