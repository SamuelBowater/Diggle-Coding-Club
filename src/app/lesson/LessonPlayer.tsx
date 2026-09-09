"use client";

import { useCallback, useRef, useState } from "react";
import { PlayerBar } from "@/components/PlayerBar";
import { Markdown } from "@/components/Markdown";
import { PythonEditor } from "@/components/PythonEditor";
import { WeekPicker } from "./WeekPicker";
import { normalizeOutput } from "@/lib/steps/check";
import {
  playCorrect,
  playWrong,
  playLevelUp,
  playBadge,
} from "@/lib/sfx";
import type { Test } from "@/lib/steps/types";
import type { RunResult } from "@/lib/python/client";
import {
  submitStepAction,
  saveDraftAction,
  markHintUsedAction,
  type SubmitResult,
} from "./actions";

export type PlayerStep = {
  id: string;
  order: number;
  type: string;
  title: string;
  contentMd: string;
  starterCode: string | null;
  solutionCode: string | null;
  test: Test | null;
  hints: string[];
  xpReward: number;
  status: string;
  draftCode: string | null;
  challengeTier: "easy" | "hard" | null;
};

const LABELS = ["A", "B", "C", "D", "E"];

export function LessonPlayer({
  student,
  lesson,
  steps,
  challenges,
  weekNav,
}: {
  student: {
    displayName: string;
    avatarKey: string;
    cosmetic: string | null;
    xp: number;
  };
  lesson: { weekNo: number; title: string; introMd: string };
  steps: PlayerStep[];
  challenges: PlayerStep[];
  weekNav: { freeRoam: boolean; classWeek: number; availableWeeks: number[] };
}) {
  const hasChallenges = challenges.length > 0;
  const pageCount = steps.length + (hasChallenges ? 1 : 0);
  const coreComplete = steps.every((s) => s.status === "complete");

  const firstIncomplete = steps.findIndex((s) => s.status !== "complete");
  const [index, setIndex] = useState(
    firstIncomplete === -1
      ? hasChallenges
        ? steps.length // jump straight to the bonus challenges
        : steps.length - 1
      : firstIncomplete,
  );
  const [xp, setXp] = useState(student.xp);
  const [done, setDone] = useState<Set<string>>(
    () =>
      new Set(
        [...steps, ...challenges]
          .filter((s) => s.status === "complete")
          .map((s) => s.id),
      ),
  );
  const [celebration, setCelebration] = useState<SubmitResult | null>(null);

  const onChallengePage = hasChallenges && index === steps.length;
  const step = onChallengePage ? null : steps[index];
  const stepDone = step ? done.has(step.id) : false;
  const coreDoneCount = steps.filter((s) => done.has(s.id)).length;

  const handleComplete = useCallback(
    (res: SubmitResult, stepId: string) => {
      if (!res.correct) {
        playWrong();
        return;
      }
      if (res.totalXp > 0) setXp(res.totalXp);
      setDone((d) => {
        const next = new Set(d);
        next.add(stepId);
        return next;
      });
      if (res.leveledUp) playLevelUp();
      else if (res.newBadges.length > 0) playBadge();
      else playCorrect();
      if (res.awardedXp > 0 || res.leveledUp || res.newBadges.length > 0) {
        setCelebration(res);
      }
    },
    [],
  );

  return (
    <div className="flex flex-1 flex-col">
      <PlayerBar
        displayName={student.displayName}
        avatarKey={student.avatarKey}
        cosmetic={student.cosmetic}
        xp={xp}
      />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-4">
        {weekNav.freeRoam && weekNav.availableWeeks.length > 1 && (
          <WeekPicker
            current={lesson.weekNo}
            classWeek={weekNav.classWeek}
            weeks={weekNav.availableWeeks}
          />
        )}
        <div className="mb-3 flex items-center gap-1.5">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Step ${i + 1}`}
              className={`h-2.5 flex-1 rounded-full transition-colors ${
                done.has(s.id)
                  ? "bg-emerald-500"
                  : i === index
                    ? "bg-emerald-300"
                    : "bg-black/15 dark:bg-white/20"
              }`}
            />
          ))}
          {hasChallenges && (
            <button
              onClick={() => setIndex(steps.length)}
              aria-label="Bonus challenges"
              disabled={!coreComplete}
              title={coreComplete ? "Bonus challenges" : "Finish the lesson first"}
              className={`shrink-0 text-sm ${
                onChallengePage ? "" : "opacity-50"
              } disabled:opacity-25`}
            >
              ⭐
            </button>
          )}
        </div>

        {onChallengePage ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Week {lesson.weekNo} · Bonus challenges
            </p>
            <h1 className="mb-3 text-2xl font-bold">
              Finished early? Try these 🚀
            </h1>
            <div className="flex-1">
              <ChallengesPanel
                challenges={challenges}
                doneSet={done}
                onComplete={handleComplete}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Week {lesson.weekNo} · Step {index + 1} of {steps.length}
            </p>
            <h1 className="mb-3 text-2xl font-bold">{step!.title}</h1>
            <div className="flex-1">
              <StepView
                key={step!.id}
                step={step!}
                done={stepDone}
                onComplete={handleComplete}
              />
            </div>
          </>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 pb-4">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-xl border px-4 py-2 font-semibold disabled:opacity-40"
          >
            ← Back
          </button>
          <span className="text-sm opacity-60">
            {coreDoneCount}/{steps.length} done
          </span>
          <button
            onClick={() => setIndex((i) => Math.min(pageCount - 1, i + 1))}
            disabled={
              index >= pageCount - 1 ||
              (!onChallengePage && !stepDone && step!.type !== "teach")
            }
            className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      {celebration && (
        <Celebration
          result={celebration}
          onClose={() => {
            setCelebration(null);
            if (!onChallengePage) {
              setIndex((i) => Math.min(pageCount - 1, i + 1));
            }
          }}
        />
      )}
    </div>
  );
}

function StepView({
  step,
  done,
  onComplete,
}: {
  step: PlayerStep;
  done: boolean;
  onComplete: (r: SubmitResult, stepId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Markdown>{step.contentMd}</Markdown>
      {step.type === "teach" || step.type === "turtle" ? (
        <TeachStep step={step} done={done} onComplete={onComplete} />
      ) : step.test?.kind === "choice" ? (
        <QuizStep step={step} done={done} onComplete={onComplete} />
      ) : step.test?.kind === "text" ? (
        <PredictStep step={step} done={done} onComplete={onComplete} />
      ) : (
        <CodeStep step={step} done={done} onComplete={onComplete} />
      )}
    </div>
  );
}

function ChallengesPanel({
  challenges,
  doneSet,
  onComplete,
}: {
  challenges: PlayerStep[];
  doneSet: Set<string>;
  onComplete: (r: SubmitResult, stepId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="opacity-70">
        You&apos;ve finished this week&apos;s lesson — nice work! These are extra,
        so do them if you want a bigger challenge. They don&apos;t affect your
        Perfect Week.
      </p>
      {challenges.map((c) => {
        const isDone = doneSet.has(c.id);
        return (
          <div
            key={c.id}
            className="rounded-2xl border p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                  c.challengeTier === "hard"
                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                }`}
              >
                {c.challengeTier === "hard" ? "Hard" : "Easy"}
              </span>
              <span className="font-semibold">{c.title}</span>
              {isDone && <span className="ml-auto">✅</span>}
            </div>
            <div className="space-y-3">
              <Markdown>{c.contentMd}</Markdown>
              <CodeStep step={c} done={isDone} onComplete={onComplete} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DoneBanner() {
  return (
    <p className="rounded-xl bg-emerald-100 px-3 py-2 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
      ✅ Step complete — press Next.
    </p>
  );
}

function TeachStep({
  step,
  done,
  onComplete,
}: {
  step: PlayerStep;
  done: boolean;
  onComplete: (r: SubmitResult, stepId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  if (done) return <DoneBanner />;
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        onComplete(await submitStepAction({ stepId: step.id }), step.id);
        setBusy(false);
      }}
      className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
    >
      Got it ✓
    </button>
  );
}

function QuizStep({
  step,
  done,
  onComplete,
}: {
  step: PlayerStep;
  done: boolean;
  onComplete: (r: SubmitResult, stepId: string) => void;
}) {
  const choices = step.test?.kind === "choice" ? step.test.choices : [];
  const [picked, setPicked] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (done) return <DoneBanner />;

  return (
    <div className="space-y-2">
      {choices.map((c, i) => (
        <button
          key={i}
          onClick={() => setPicked(i)}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
            picked === i ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950" : ""
          }`}
        >
          <span className="font-bold">{LABELS[i]}</span>
          <code className="font-mono">{c}</code>
        </button>
      ))}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <button
        disabled={picked === null || busy}
        onClick={async () => {
          setBusy(true);
          const res = await submitStepAction({
            stepId: step.id,
            choiceLabel: LABELS[picked!],
          });
          setMsg(res.correct ? "" : res.message);
          onComplete(res, step.id);
          setBusy(false);
        }}
        className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
      >
        Check answer
      </button>
    </div>
  );
}

function PredictStep({
  step,
  done,
  onComplete,
}: {
  step: PlayerStep;
  done: boolean;
  onComplete: (r: SubmitResult, stepId: string) => void;
}) {
  const [guess, setGuess] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-2">
      <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-3 text-sm text-neutral-100">
        {step.solutionCode}
      </pre>
      {done ? (
        <DoneBanner />
      ) : (
        <>
          <textarea
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            rows={4}
            placeholder="Type exactly what you think it prints…"
            className="w-full rounded-xl border p-3 font-mono text-sm"
          />
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button
            disabled={busy || guess.trim() === ""}
            onClick={async () => {
              setBusy(true);
              const res = await submitStepAction({ stepId: step.id, text: guess });
              setMsg(res.correct ? "" : res.message);
              onComplete(res, step.id);
              setBusy(false);
            }}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            Check
          </button>
        </>
      )}
    </div>
  );
}

function CodeStep({
  step,
  done,
  onComplete,
}: {
  step: PlayerStep;
  done: boolean;
  onComplete: (r: SubmitResult, stepId: string) => void;
}) {
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<{ pass: boolean; text: string } | null>(
    null,
  );
  const [localDone, setLocalDone] = useState(done);
  const codeRef = useRef(step.draftCode ?? step.starterCode ?? "");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const test = step.test;

  const onResult = useCallback(
    async (r: RunResult) => {
      if (!test || test.kind !== "stdout") {
        // no auto-check: any run marks it done
        const res = await submitStepAction({
          stepId: step.id,
          code: codeRef.current,
          stdout: r.stdout,
        });
        setFeedback({ pass: res.correct, text: res.message });
        if (res.correct) setLocalDone(true);
        onComplete(res, step.id);
        return;
      }
      const want = normalizeOutput(test.equals ?? test.contains ?? "");
      const got = normalizeOutput(r.stdout);
      const pass =
        test.equals !== undefined
          ? got === want
          : got.includes(want);
      if (!pass) {
        setFeedback({
          pass: false,
          text: `Not yet. It printed:\n${got || "(nothing)"}`,
        });
        // record the attempt (no XP)
        submitStepAction({ stepId: step.id, code: codeRef.current, stdout: r.stdout });
        return;
      }
      const res = await submitStepAction({
        stepId: step.id,
        code: codeRef.current,
        stdout: r.stdout,
      });
      setFeedback({ pass: true, text: res.message });
      if (res.correct) setLocalDone(true);
      onComplete(res, step.id);
    },
    [step.id, test, onComplete],
  );

  return (
    <div className="space-y-3">
      <PythonEditor
        starter={step.draftCode ?? step.starterCode ?? ""}
        stdin={test?.kind === "stdout" ? test.stdin : undefined}
        onResult={onResult}
        onCodeChange={(code) => {
          codeRef.current = code;
          if (saveTimer.current) clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => {
            saveDraftAction(step.id, code);
          }, 2500);
        }}
        minHeight={200}
      />

      {feedback && (
        <p
          className={`whitespace-pre-wrap rounded-xl px-3 py-2 text-sm font-medium ${
            feedback.pass
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
              : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
          }`}
        >
          {feedback.pass ? "✅ " : "💡 "}
          {feedback.text}
        </p>
      )}

      {localDone && <DoneBanner />}

      {!localDone && step.hints.length > 0 && (
        <div className="space-y-2">
          {step.hints.slice(0, hintLevel).map((h, i) => (
            <p
              key={i}
              className="rounded-xl bg-black/5 px-3 py-2 text-sm dark:bg-white/10"
            >
              💡 {h}
            </p>
          ))}
          {hintLevel < step.hints.length && (
            <button
              onClick={() => {
                setHintLevel((n) => n + 1);
                markHintUsedAction(step.id);
              }}
              className="text-sm font-semibold text-emerald-700 underline dark:text-emerald-400"
            >
              {hintLevel === 0 ? "Stuck? Show a hint" : "Show another hint"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Celebration({
  result,
  onClose,
}: {
  result: SubmitResult;
  onClose: () => void;
}) {
  return (
    <button
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center text-white"
    >
      {result.leveledUp ? (
        <>
          <div className="text-6xl">🎉</div>
          <div className="text-3xl font-extrabold">Level {result.level}!</div>
        </>
      ) : (
        <div className="text-6xl">⭐</div>
      )}
      {result.awardedXp > 0 && (
        <div className="text-2xl font-bold">+{result.awardedXp} XP</div>
      )}
      {result.newBadges.map((b) => (
        <div key={b.key} className="text-lg">
          {b.icon} Badge unlocked: <b>{b.name}</b>
        </div>
      ))}
      <div className="mt-2 text-sm opacity-70">tap to carry on</div>
    </button>
  );
}
