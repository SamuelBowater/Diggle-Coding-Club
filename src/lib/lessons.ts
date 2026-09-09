import "server-only";
import { db } from "@/db";
import { lessons, steps, progress } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";

export type Lesson = typeof lessons.$inferSelect;
export type LessonStep = typeof steps.$inferSelect;
export type StepProgress = {
  stepId: string;
  status: string;
  attempts: number;
  usedHint: boolean;
  codeSubmitted: string | null;
};

export async function listLessonWeeks(): Promise<number[]> {
  const rows = await db
    .select({ weekNo: lessons.weekNo })
    .from(lessons)
    .orderBy(asc(lessons.weekNo));
  return rows.map((r) => r.weekNo);
}

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

  return {
    lesson,
    steps: lessonSteps.filter((s) => !s.challengeTier),
    challenges: lessonSteps.filter((s) => s.challengeTier),
  };
}

export async function getWeekCompletion(studentId: string) {
  const allLessons = await db
    .select({ id: lessons.id, weekNo: lessons.weekNo, title: lessons.title })
    .from(lessons)
    .orderBy(asc(lessons.weekNo));

  const rows = await db
    .select({
      lessonId: steps.lessonId,
      stepId: steps.id,
      status: progress.status,
    })
    .from(steps)
    .leftJoin(
      progress,
      and(
        eq(progress.stepId, steps.id),
        eq(progress.studentId, studentId),
      ),
    )
    .where(isNull(steps.challengeTier));

  return allLessons.map((l) => {
    const forLesson = rows.filter((r) => r.lessonId === l.id);
    return {
      week: l.weekNo,
      title: l.title,
      total: forLesson.length,
      done: forLesson.filter((r) => r.status === "complete").length,
    };
  });
}

export async function getProgressForStudent(studentId: string, lessonId: string) {
  const rows = await db
    .select({
      stepId: progress.stepId,
      status: progress.status,
      attempts: progress.attempts,
      usedHint: progress.usedHint,
      codeSubmitted: progress.codeSubmitted,
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
