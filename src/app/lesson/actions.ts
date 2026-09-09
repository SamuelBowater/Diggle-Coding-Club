"use server";

import { redirect } from "next/navigation";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { students, steps, progress, badges, studentBadges, events } from "@/db/schema";
import { clearSession, getSessionStudentId } from "@/lib/session";
import { levelForXp } from "@/lib/xp";
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

  // --- award XP + level ---
  const awardedXp = xpFor(step.xpReward, usedHint, attempts);
  const totalXp = student.xp + awardedXp;
  const level = levelForXp(totalXp);
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
  const newBadges = await awardBadges(studentId, student.classId, step);

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

async function awardBadges(
  studentId: string,
  classId: string,
  step: typeof steps.$inferSelect,
) {
  const toGrant: string[] = [];

  if (step.type === "code" || step.type === "debug") {
    toGrant.push("first-program");
  }
  if (step.type === "debug") {
    toGrant.push("bug-squasher");
  }
  if (step.challengeTier === "hard") {
    toGrant.push("challenge-champ");
  }

  // perfect week: every *core* step in this lesson now complete
  // (bonus challenges don't count).
  const lessonSteps = await db
    .select({ id: steps.id })
    .from(steps)
    .where(
      and(eq(steps.lessonId, step.lessonId), isNull(steps.challengeTier)),
    );
  const done = await db
    .select({ id: progress.stepId })
    .from(progress)
    .where(
      and(
        eq(progress.studentId, studentId),
        eq(progress.status, "complete"),
        inArray(
          progress.stepId,
          lessonSteps.map((s) => s.id),
        ),
      ),
    );
  if (lessonSteps.length > 0 && done.length >= lessonSteps.length) {
    toGrant.push("perfect-week");
  }

  if (toGrant.length === 0) return [];

  const rows = await db
    .select()
    .from(badges)
    .where(inArray(badges.key, toGrant));

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
