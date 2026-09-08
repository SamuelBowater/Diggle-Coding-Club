import "server-only";
import { db } from "@/db";
import { lessons, steps, progress } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

export type Lesson = typeof lessons.$inferSelect;
export type LessonStep = typeof steps.$inferSelect;
export type StepProgress = {
  stepId: string;
  status: string;
  attempts: number;
  usedHint: boolean;
};

export async function getLessonByWeek(weekNo: number) {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.weekNo, weekNo))
    .limit(1);
  if (!lesson) return null;

  const lessonSteps = await db
    .select()
    .from(steps)
    .where(eq(steps.lessonId, lesson.id))
    .orderBy(asc(steps.order));

  return { lesson, steps: lessonSteps };
}

export async function getProgressForStudent(studentId: string, lessonId: string) {
  const rows = await db
    .select({
      stepId: progress.stepId,
      status: progress.status,
      attempts: progress.attempts,
      usedHint: progress.usedHint,
    })
    .from(progress)
    .innerJoin(steps, eq(progress.stepId, steps.id))
    .where(
      and(eq(steps.lessonId, lessonId), eq(progress.studentId, studentId)),
    );

  return new Map(
    rows
      .filter((r) => r.stepId)
      .map((r) => [r.stepId, r]),
  );
}
