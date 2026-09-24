"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { avatarEmoji } from "@/lib/avatars";
import type { LiveSnapshot, LiveStudent } from "@/lib/live";
import { setCurrentStepOrderAction, revealStepOrderAction } from "../../../actions";

type PStep = {
  id: string;
  order: number;
  type: string;
  title: string;
  contentMd: string;
  solutionCode: string | null;
  choices: string[] | null;
  correctAnswer: string | null;
  predictAnswer: string | null;
  challengeTier: "easy" | "hard" | null;
};

const LETTERS = ["A", "B", "C", "D", "E"];

const STATUS_STYLE: Record<LiveStudent["status"], string> = {
  done: "bg-emerald-500 text-white",
  working: "bg-amber-300 text-amber-950",
  stuck: "bg-red-500 text-white",
  idle: "bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50",
  "not-started": "bg-black/5 text-black/40 dark:bg-white/5 dark:text-white/40",
};

// Float the students who need attention to the front of the roster.
const STATUS_PRIORITY: Record<LiveStudent["status"], number> = {
  stuck: 0,
  working: 1,
  "not-started": 2,
  idle: 3,
  done: 4,
};

export function Projector({
  classId,
  className,
  joinCode,
  joinUrl,
  qrSvg,
  week,
  lessonTitle,
  steps,
  challenges,
  initialIndex,
  initialUnlockedOrder,
}: {
  classId: string;
  className: string;
  joinCode: string;
  joinUrl: string;
  qrSvg: string;
  week: number;
  lessonTitle: string;
  steps: PStep[];
  challenges: PStep[];
  initialIndex: number;
  initialUnlockedOrder: number;
}) {
  // The core lesson, then any bonus challenges trailing after it — one
  // deck of slides so ←/→ walks through both, but only the core steps
  // are paced/unlocked for students; challenges are always free to show.
  const slides = useMemo(() => [...steps, ...challenges], [steps, challenges]);

  const [i, setI] = useState(initialIndex);
  const [unlockedOrder, setUnlockedOrder] = useState(initialUnlockedOrder);
  const [snap, setSnap] = useState<LiveSnapshot | null>(null);
  const [revealed, setRevealed] = useState(false);
  const mounted = useRef(false);
  const iRef = useRef(i);
  const unlockedOrderRef = useRef(unlockedOrder);

  useEffect(() => {
    iRef.current = i;
  }, [i]);
  useEffect(() => {
    unlockedOrderRef.current = unlockedOrder;
  }, [unlockedOrder]);

  // Ask the class first — hide the answer again whenever the slide changes.
  useEffect(() => {
    setRevealed(false);
  }, [i]);

  const isChallengeSlide = i >= steps.length;

  // Moving the displayed slide forward also releases students up to that
  // step. Moving back (to recap something) never re-locks what's already
  // unlocked. Bonus-challenge slides never touch the unlock cursor at all
  // — they're not part of the paced lesson.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (isChallengeSlide) return;
    const step = steps[i];
    if (step && step.order > unlockedOrder) {
      setUnlockedOrder(step.order);
      setCurrentStepOrderAction(classId, step.order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/class/${classId}/live`, { cache: "no-store" });
        if (res.ok && alive) setSnap((await res.json()) as LiveSnapshot);
      } catch {
        /* ignore */
      }
    };
    tick();
    const iv = setInterval(tick, 5000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [classId]);

  // If another open projector (a second laptop, a TA's screen) moves the
  // class further forward, follow along here too. Never moves this screen
  // backward — reviewing a past step in one tab doesn't yank another tab
  // back with it.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/class/${classId}/pace`, { cache: "no-store" });
        if (!res.ok || !alive) return;
        const data = await res.json();
        if (
          typeof data.currentStepOrder === "number" &&
          data.currentStepOrder > unlockedOrderRef.current
        ) {
          const idx = steps.findIndex((s) => s.order === data.currentStepOrder);
          if (idx >= 0) setI(idx);
          setUnlockedOrder(data.currentStepOrder);
        }
        // Catch up on a reveal made elsewhere too (self-heals within a
        // couple of ticks even if a same-tick navigation briefly re-hides
        // it — never forces hidden->shown the other way round).
        const curStep = slides[iRef.current];
        if (
          curStep &&
          typeof data.revealedStepOrder === "number" &&
          data.revealedStepOrder >= curStep.order
        ) {
          setRevealed(true);
        }
      } catch {
        /* ignore */
      }
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [classId, steps, slides]);

  const unlockedIndex = steps.findIndex((s) => s.order === unlockedOrder);
  const canUnlockMore = unlockedIndex >= 0 && unlockedIndex < steps.length - 1;

  function unlockNextEarly() {
    const next = steps[unlockedIndex + 1];
    if (!next) return;
    setUnlockedOrder(next.order);
    setCurrentStepOrderAction(classId, next.order);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown")
        setI((n) => Math.min(slides.length - 1, n + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp")
        setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  const step = slides[i];
  const total = snap?.students.length ?? 0;
  const onThisStep = step
    ? (snap?.students.filter((s) => s.activeStep === step.order).length ?? 0)
    : 0;
  const goalXp = Math.max(200, total * 100);
  const xpPct = snap ? Math.min(100, Math.round((snap.classXp / goalXp) * 100)) : 0;

  const roster = useMemo(() => {
    const list = snap?.students ?? [];
    return [...list].sort((a, b) => {
      const p = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      return p !== 0 ? p : a.displayName.localeCompare(b.displayName);
    });
  }, [snap]);

  function toggleReveal() {
    setRevealed((r) => {
      const next = !r;
      if (next && step && (step.type === "teach" || step.type === "turtle")) {
        // Persist so students see the explanation too, right away.
        revealStepOrderAction(classId, step.order);
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white p-[3vmin] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex items-center justify-between">
        <div>
          <Link
            href={`/teacher/class/${classId}`}
            className="mb-[0.4vmin] inline-block text-[1.3vmin] opacity-50 hover:opacity-90"
          >
            ← Back to class
          </Link>
          <p className="text-[1.6vmin] font-semibold uppercase tracking-widest text-emerald-600">
            {className} · Week {week}
            <span className="ml-[1.5vmin] rounded-full bg-emerald-600 px-[1.2vmin] py-[0.2vmin] text-[1.3vmin] text-white">
              🔒 Unlocked up to step {unlockedIndex + 1}
            </span>
          </p>
          <h1 className="text-[3vmin] font-bold">{lessonTitle}</h1>
        </div>
        <div className="flex items-center gap-[2vmin]">
          <div className="text-right">
            <p className="text-[1.4vmin] opacity-60">Join at {joinUrl}</p>
            <p className="font-mono text-[2.6vmin] font-bold">{joinCode}</p>
          </div>
          <div
            className="h-[12vmin] w-[12vmin] [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
            aria-hidden
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-[2vmin]">
        {step ? (
          <div className="text-[2.4vmin] leading-relaxed">
            <p
              className={`text-[1.6vmin] font-semibold uppercase tracking-widest ${
                isChallengeSlide ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              Step {i + 1} of {slides.length} ·{" "}
              {isChallengeSlide
                ? `🌟 Bonus challenge (${step.challengeTier === "hard" ? "Hard" : "Easy"})`
                : step.type}
            </p>
            <h2 className="mb-[2vmin] text-[4vmin] font-extrabold">{step.title}</h2>
            {isChallengeSlide && (
              <p className="mb-[1.5vmin] text-[1.8vmin] italic opacity-60">
                For anyone who finishes the lesson early — everyone else, carry
                on with your own screen.
              </p>
            )}

            {(step.type !== "teach" && step.type !== "turtle") || revealed ? (
              <Markdown>{step.contentMd}</Markdown>
            ) : (
              <p className="italic opacity-50">
                (Explanation hidden — ask the class first, then reveal.)
              </p>
            )}

            {step.type === "predict" && step.solutionCode && (
              <pre className="mt-[2vmin] overflow-x-auto rounded-xl bg-neutral-900 p-[2vmin] text-neutral-100">
                {step.solutionCode}
              </pre>
            )}

            {step.choices && (
              <ul className="mt-[2vmin] space-y-[1vmin]">
                {step.choices.map((c, idx) => {
                  const letter = LETTERS[idx];
                  const isAnswer = revealed && letter === step.correctAnswer;
                  return (
                    <li
                      key={idx}
                      className={`rounded-xl border p-[1.5vmin] font-mono ${
                        isAnswer
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                          : ""
                      }`}
                    >
                      <b className="mr-3">{letter}</b>
                      {c}
                      {isAnswer && <span className="ml-[1vmin]">✅</span>}
                    </li>
                  );
                })}
              </ul>
            )}

            {step.type === "predict" && step.predictAnswer && revealed && (
              <div className="mt-[2vmin]">
                <p className="text-[1.4vmin] font-semibold uppercase tracking-widest text-emerald-600">
                  Answer
                </p>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded-xl bg-neutral-900 p-[2vmin] text-neutral-100">
                  {step.predictAnswer}
                </pre>
              </div>
            )}

            {(step.type === "teach" ||
              step.type === "turtle" ||
              step.choices ||
              (step.type === "predict" && step.predictAnswer)) && (
              <button
                onClick={toggleReveal}
                className="mt-[2vmin] rounded-xl border px-[2vmin] py-[1vmin] text-[1.8vmin] font-semibold hover:bg-black/5 dark:hover:bg-white/10"
              >
                {step.type === "teach" || step.type === "turtle"
                  ? revealed
                    ? "🙈 Hide explanation"
                    : "👁 Discuss, then reveal explanation"
                  : revealed
                    ? "🙈 Hide answer"
                    : "👁 Ask the class, then reveal answer"}
              </button>
            )}

            {step.solutionCode && step.type !== "predict" && (
              <details className="mt-[2vmin] text-[1.8vmin]">
                <summary className="cursor-pointer opacity-60">
                  Show example answer
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-neutral-900 p-[2vmin] text-neutral-100">
                  {step.solutionCode}
                </pre>
              </details>
            )}
          </div>
        ) : (
          <p className="text-center text-[3vmin] opacity-60">
            This lesson has no steps yet.
          </p>
        )}
      </main>

      <section className="border-t pt-[1.2vmin]">
        <div className="mb-[0.7vmin] flex items-center justify-between text-[1.4vmin] font-semibold uppercase tracking-widest opacity-60">
          <span>Class progress</span>
          <span>
            {isChallengeSlide
              ? `${onThisStep} of ${total} on this challenge`
              : `${onThisStep} of ${total} on step ${i + 1}`}
          </span>
        </div>
        <div className="flex max-h-[16vmin] flex-wrap gap-[0.6vmin] overflow-y-auto">
          {roster.length === 0 && (
            <p className="text-[1.5vmin] opacity-50">No students have joined yet.</p>
          )}
          {roster.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-[0.5vmin] rounded-lg px-[1vmin] py-[0.5vmin] text-[1.4vmin] ${STATUS_STYLE[s.status]}`}
            >
              <span className="text-[2vmin] leading-none">{avatarEmoji(s.avatarKey)}</span>
              <span className="max-w-[10vmin] truncate font-semibold">{s.displayName}</span>
              <span className="opacity-80">
                {s.completed}/{snap?.totalSteps ?? steps.length}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-[1.2vmin] space-y-[1.2vmin]">
        <div className="flex items-center gap-[2vmin] text-[1.8vmin]">
          <span className="font-semibold">Class XP</span>
          <div className="h-[2.4vmin] flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-1000"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <span className="tabular-nums">
            {snap?.classXp ?? 0} / {goalXp}
          </span>
        </div>
        <div className="flex items-center justify-between text-[1.6vmin] opacity-70">
          <span>← / → to move through the lesson</span>
          <div className="flex items-center gap-[1vmin]">
            <button
              onClick={unlockNextEarly}
              disabled={!canUnlockMore}
              title="Release the next step for everyone without changing what's on screen"
              className="rounded-lg border px-3 py-1 disabled:opacity-30"
            >
              🔓 Unlock next step early
            </button>
            <button
              onClick={() => setI((n) => Math.max(0, n - 1))}
              className="rounded-lg border px-3 py-1"
            >
              ←
            </button>
            <button
              onClick={() => setI((n) => Math.min(slides.length - 1, n + 1))}
              className="rounded-lg border px-3 py-1"
            >
              →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
