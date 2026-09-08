import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { classes, students, lessons, steps, progress } from "@/db/schema";

export type LiveStudent = {
  id: string;
  displayName: string;
  avatarKey: string;
  xp: number;
  level: number;
  lastSeen: string | null;
  completed: number;
  activeStep: number; // 1-based order of the step they're on
  status: "not-started" | "working" | "stuck" | "done" | "idle";
};

export type LiveSnapshot = {
  className: string;
  week: number;
  lessonTitle: string | null;
  totalSteps: number;
  stepTitles: string[];
  classXp: number;
  students: LiveStudent[];
  generatedAt: string;
};

const IDLE_MS = 5 * 60 * 1000;

export async function getLiveSnapshot(classId: string): Promise<LiveSnapshot | null> {
  const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1);
  if (!cls) return null;

  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.weekNo, cls.currentLessonWeek))
    .limit(1);

  const lessonSteps = lesson
    ? await db
        .select({ id: steps.id, order: steps.order, title: steps.title })
        .from(steps)
        .where(eq(steps.lessonId, lesson.id))
        .orderBy(steps.order)
    : [];
  const stepIds = lessonSteps.map((s) => s.id);
  const orderById = new Map(lessonSteps.map((s) => [s.id, s.order]));

  const roster = await db
    .select()
    .from(students)
    .where(eq(students.classId, classId))
    .orderBy(students.displayName);

  const prog = stepIds.length
    ? await db
        .select({
          studentId: progress.studentId,
          stepId: progress.stepId,
          status: progress.status,
          attempts: progress.attempts,
        })
        .from(progress)
        .where(
          and(
            inArray(
              progress.studentId,
              roster.map((r) => r.id),
            ),
            inArray(progress.stepId, stepIds),
          ),
        )
    : [];

  const byStudent = new Map<string, typeof prog>();
  for (const p of prog) {
    const arr = byStudent.get(p.studentId) ?? [];
    arr.push(p);
    byStudent.set(p.studentId, arr);
  }

  const now = Date.now();
  const liveStudents: LiveStudent[] = roster.map((s) => {
    const rows = byStudent.get(s.id) ?? [];
    const completeOrders = new Set(
      rows
        .filter((r) => r.status === "complete")
        .map((r) => orderById.get(r.stepId)!),
    );
    const completed = completeOrders.size;

    let activeStep = 1;
    for (const ls of lessonSteps) {
      if (!completeOrders.has(ls.order)) {
        activeStep = ls.order;
        break;
      }
      activeStep = ls.order;
    }

    const activeRow = rows.find(
      (r) => orderById.get(r.stepId) === activeStep,
    );
    const idle = !s.lastSeen || now - new Date(s.lastSeen).getTime() > IDLE_MS;

    let status: LiveStudent["status"];
    if (lessonSteps.length > 0 && completed >= lessonSteps.length) status = "done";
    else if (idle) status = "idle";
    else if (activeRow && activeRow.status === "attempted" && activeRow.attempts >= 3)
      status = "stuck";
    else if (completed === 0 && rows.length === 0) status = "not-started";
    else status = "working";

    return {
      id: s.id,
      displayName: s.displayName,
      avatarKey: s.avatarKey,
      xp: s.xp,
      level: s.level,
      lastSeen: s.lastSeen ? new Date(s.lastSeen).toISOString() : null,
      completed,
      activeStep,
      status,
    };
  });

  return {
    className: cls.name,
    week: cls.currentLessonWeek,
    lessonTitle: lesson?.title ?? null,
    totalSteps: lessonSteps.length,
    stepTitles: lessonSteps.map((s) => s.title),
    classXp: roster.reduce((sum, s) => sum + s.xp, 0),
    students: liveStudents,
    generatedAt: new Date().toISOString(),
  };
}
