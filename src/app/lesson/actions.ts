"use server";

import { redirect } from "next/navigation";
import { and, eq, inArray, isNull, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  students,
  steps,
  progress,
  badges,
  studentBadges,
  events,
  type StepType,
} from "@/db/schema";
import { clearSession, getSessionStudentId } from "@/lib/session";
import { levelForXp, cumulativeXpForLevel } from "@/lib/xp";
import { getWeekCompletion } from "@/lib/lessons";
import { firstTest } from "@/lib/steps/types";
import { checkChoice, checkStdout, checkText } from "@/lib/steps/check";

export async function switchPlayerAction() {
  await clearSession();
  redirect("/join");
}

type SubmitInput = {
  stepId: string;
  choiceLabel?: string;
  text?: string;
  code?: string;
  stdout?: string;
};

export type SubmitResult = {
  ok: boolean;
  correct: boolean;
  message: string;
  awardedXp: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  newBadges: { key: string; name: string; icon: string }[];
  alreadyComplete: boolean;
};

function xpFor(reward: number, usedHint: boolean, attempts: number): number {
  if (usedHint) return Math.max(5, Math.ceil(reward / 2));
  if (attempts <= 1) return reward;
  return Math.max(5, Math.ceil(reward * 0.75));
}

export async function submitStepAction(input: SubmitInput): Promise<SubmitResult> {
  const studentId = await getSessionStudentId();
  if (!studentId) redirect("/join");

  const [step] = await db.select().from(steps).where(eq(steps.id, input.stepId)).limit(1);
  if (!step) return fail("That step no longer exists.");

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!student) redirect("/join");

  const [existing] = await db
    .select()
    .from(progress)
    .where(and(eq(progress.studentId, studentId), eq(progress.stepId, step.id)))
    .limit(1);

  const alreadyComplete = existing?.status === "complete";
  const usedHint = existing?.usedHint ?? false;
  const attempts = (existing?.attempts ?? 0) + 1;

  // --- decide correctness ---
  const test = firstTest(step.testsJson);
  let correct = false;
  let message = "";

  if (step.type === "teach" || step.type === "turtle") {
    correct = true;
    message = "Nice.";
  } else if (test?.kind === "choice") {
    const r = checkChoice(input.choiceLabel ?? "", test);
    correct = r.pass;
    message = r.message;
  } else if (test?.kind === "text") {
    const r = checkText(input.text ?? "", test);
    correct = r.pass;
    message = r.message;
  } else if (test?.kind === "stdout") {
    const r = checkStdout(input.stdout ?? "", test);
    correct = r.pass;
    message = r.message;
  } else {
    // code step with no test: any successful run counts
    correct = (input.stdout ?? "").length >= 0 && input.code !== undefined;
    message = "Great, that ran!";
  }

  const codeToStore = input.code ?? existing?.codeSubmitted ?? null;

  // --- persist progress ---
  await db
    .insert(progress)
    .values({
      studentId,
      stepId: step.id,
      status: correct ? "complete" : "attempted",
      attempts,
      codeSubmitted: codeToStore,
      usedHint,
      completedAt: correct ? new Date() : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [progress.studentId, progress.stepId],
      set: {
        status: alreadyComplete ? "complete" : correct ? "complete" : "attempted",
        attempts,
        codeSubmitted: codeToStore,
        completedAt: alreadyComplete
          ? existing!.completedAt
          : correct
            ? new Date()
            : null,
        updatedAt: new Date(),
      },
    });

  if (!correct) {
    return {
      ok: true,
      correct: false,
      message,
      awardedXp: 0,
      totalXp: student.xp,
      level: student.level,
      leveledUp: false,
      newBadges: [],
      alreadyComplete,
    };
  }

  if (alreadyComplete) {
    return {
      ok: true,
      correct: true,
      message: "You've already finished this one.",
      awardedXp: 0,
      totalXp: student.xp,
      level: student.level,
      leveledUp: false,
      newBadges: [],
      alreadyComplete: true,
    };
  }

  // --- has this step's completion just finished the whole (core) lesson? ---
  let lessonJustCompleted = false;
  if (!step.challengeTier) {
    const lessonCoreSteps = await db
      .select({ id: steps.id })
      .from(steps)
      .where(and(eq(steps.lessonId, step.lessonId), isNull(steps.challengeTier)));
    const coreDone = await db
      .select({ id: progress.stepId })
      .from(progress)
      .where(
        and(
          eq(progress.studentId, studentId),
          eq(progress.status, "complete"),
          inArray(
            progress.stepId,
            lessonCoreSteps.map((s) => s.id),
          ),
        ),
      );
    lessonJustCompleted =
      lessonCoreSteps.length > 0 && coreDone.length >= lessonCoreSteps.length;
  }

  // --- award XP + level ---
  const awardedXp = xpFor(step.xpReward, usedHint, attempts);
  let totalXp = student.xp + awardedXp;
  let level = levelForXp(totalXp);

  // Guarantee: finishing every step of a week's lesson always nets at
  // least one level up, even if hints/extra attempts ate into the XP
  // along the way. Top up to exactly the next threshold — never lets a
  // full lesson pass without a level up, never rewards more than that.
  if (lessonJustCompleted && level <= student.level) {
    totalXp = Math.max(totalXp, cumulativeXpForLevel(student.level + 1));
    level = levelForXp(totalXp);
  }

  const leveledUp = level > student.level;

  await db
    .update(students)
    .set({ xp: totalXp, level, lastSeen: new Date() })
    .where(eq(students.id, studentId));

  await db.insert(events).values({
    classId: student.classId,
    studentId,
    type: "step_complete",
    payloadJson: { stepId: step.id, title: step.title, awardedXp },
  });

  // --- badges ---
  const newBadges = await awardBadges(studentId, student.classId, step, {
    lessonJustCompleted,
    xpBefore: student.xp,
    xpAfter: totalXp,
    firstTryNoHint: attempts === 1 && !usedHint,
  });

  return {
    ok: true,
    correct: true,
    message: message || "Correct!",
    awardedXp,
    totalXp,
    level,
    leveledUp,
    newBadges,
    alreadyComplete: false,
  };
}

const XP_MILESTONES: { key: string; xp: number }[] = [
  { key: "century-club", xp: 100 },
  { key: "high-roller", xp: 500 },
  { key: "xp-legend", xp: 1000 },
];

async function awardBadges(
  studentId: string,
  classId: string,
  step: typeof steps.$inferSelect,
  ctx: {
    lessonJustCompleted: boolean;
    xpBefore: number;
    xpAfter: number;
    firstTryNoHint: boolean;
  },
) {
  const toGrant: string[] = [];

  if (step.type === "code" || step.type === "debug") {
    toGrant.push("first-program");
    if (ctx.firstTryNoHint) toGrant.push("speed-demon");
  }
  if (step.type === "debug") {
    toGrant.push("bug-squasher");
  }
  if (step.challengeTier === "hard") {
    toGrant.push("challenge-champ");
  }

  // XP milestones, crossed for the first time on this award.
  for (const m of XP_MILESTONES) {
    if (ctx.xpBefore < m.xp && ctx.xpAfter >= m.xp) toGrant.push(m.key);
  }

  // Doing 5 quizzes / 5 predictions (all time, across every week).
  if (step.type === "quiz" || step.type === "predict") {
    const count = await countCompletedByType(studentId, step.type);
    if (count >= 5) toGrant.push(step.type === "quiz" ? "quiz-whiz" : "predictor");
  }

  // Both the easy and hard bonus challenge for one week.
  if (step.challengeTier) {
    const lessonChallenges = await db
      .select({ id: steps.id })
      .from(steps)
      .where(and(eq(steps.lessonId, step.lessonId), isNotNull(steps.challengeTier)));
    if (lessonChallenges.length >= 2) {
      const done = await db
        .select({ id: progress.stepId })
        .from(progress)
        .where(
          and(
            eq(progress.studentId, studentId),
            eq(progress.status, "complete"),
            inArray(
              progress.stepId,
              lessonChallenges.map((s) => s.id),
            ),
          ),
        );
      if (done.length >= lessonChallenges.length) toGrant.push("double-trouble");
    }
  }

  if (ctx.lessonJustCompleted) {
    toGrant.push("perfect-week");

    const weeks = await getWeekCompletion(studentId);
    const weeksDone = weeks.filter((w) => w.total > 0 && w.done >= w.total).length;
    if (weeksDone >= 4) toGrant.push("halfway-hero");
    if (weeksDone >= 8) toGrant.push("code-graduate");
  }

  if (toGrant.length === 0) return [];

  const rows = await db
    .select()
    .from(badges)
    .where(inArray(badges.key, [...new Set(toGrant)]));

  const granted: { key: string; name: string; icon: string }[] = [];
  for (const b of rows) {
    const res = await db
      .insert(studentBadges)
      .values({ studentId, badgeId: b.id })
      .onConflictDoNothing()
      .returning({ badgeId: studentBadges.badgeId });
    if (res.length > 0) {
      granted.push({ key: b.key, name: b.name, icon: b.icon });
      await db.insert(events).values({
        classId,
        studentId,
        type: "badge_awarded",
        payloadJson: { key: b.key },
      });
    }
  }
  return granted;
}

async function countCompletedByType(studentId: string, type: StepType) {
  const rows = await db
    .select({ id: progress.stepId })
    .from(progress)
    .innerJoin(steps, eq(progress.stepId, steps.id))
    .where(
      and(
        eq(progress.studentId, studentId),
        eq(progress.status, "complete"),
        eq(steps.type, type),
        isNull(steps.challengeTier),
      ),
    );
  return rows.length;
}

export async function saveDraftAction(stepId: string, code: string) {
  const studentId = await getSessionStudentId();
  if (!studentId) return;
  await db
    .insert(progress)
    .values({
      studentId,
      stepId,
      status: "attempted",
      codeSubmitted: code,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [progress.studentId, progress.stepId],
      set: { codeSubmitted: code, updatedAt: new Date() },
    });
}

export async function markHintUsedAction(stepId: string) {
  const studentId = await getSessionStudentId();
  if (!studentId) return;
  await db
    .insert(progress)
    .values({ studentId, stepId, status: "attempted", usedHint: true, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [progress.studentId, progress.stepId],
      set: { usedHint: true, updatedAt: new Date() },
    });
}

function fail(message: string): SubmitResult {
  return {
    ok: false,
    correct: false,
    message,
    awardedXp: 0,
    totalXp: 0,
    level: 1,
    leveledUp: false,
    newBadges: [],
    alreadyComplete: false,
  };
}
