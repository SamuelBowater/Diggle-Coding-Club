"use client";

import { useEffect, useState } from "react";
import { Markdown } from "@/components/Markdown";
import type { LiveSnapshot } from "@/lib/live";

type PStep = {
  id: string;
  order: number;
  type: string;
  title: string;
  contentMd: string;
  solutionCode: string | null;
  choices: string[] | null;
};

const LETTERS = ["A", "B", "C", "D", "E"];

export function Projector({
  classId,
  className,
  joinCode,
  joinUrl,
  qrSvg,
  week,
  lessonTitle,
  steps,
}: {
  classId: string;
  className: string;
  joinCode: string;
  joinUrl: string;
  qrSvg: string;
  week: number;
  lessonTitle: string;
  steps: PStep[];
}) {
  const [i, setI] = useState(0);
  const [snap, setSnap] = useState<LiveSnapshot | null>(null);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown")
        setI((n) => Math.min(steps.length - 1, n + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp")
        setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  const step = steps[i];
  const total = snap?.students.length ?? 0;
  const onThisStep = step
    ? (snap?.students.filter((s) => s.activeStep === step.order).length ?? 0)
    : 0;
  const goalXp = Math.max(200, total * 100);
  const xpPct = snap ? Math.min(100, Math.round((snap.classXp / goalXp) * 100)) : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-white p-[3vmin] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[1.6vmin] font-semibold uppercase tracking-widest text-emerald-600">
            {className} · Week {week}
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

      <main className="flex flex-1 flex-col justify-center py-[3vmin]">
        {step ? (
          <div className="text-[2.4vmin] leading-relaxed">
            <p className="text-[1.6vmin] font-semibold uppercase tracking-widest text-emerald-600">
              Step {i + 1} of {steps.length} · {step.type}
            </p>
            <h2 className="mb-[2vmin] text-[4vmin] font-extrabold">{step.title}</h2>
            <Markdown>{step.contentMd}</Markdown>
            {step.choices && (
              <ul className="mt-[2vmin] space-y-[1vmin]">
                {step.choices.map((c, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl border p-[1.5vmin] font-mono"
                  >
                    <b className="mr-3">{LETTERS[idx]}</b>
                    {c}
                  </li>
                ))}
              </ul>
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

      <footer className="space-y-[1.4vmin]">
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
          <span>
            {onThisStep} of {total} students on this step
          </span>
          <span>← / → to move through the lesson</span>
          <div className="flex gap-2">
            <button
              onClick={() => setI((n) => Math.max(0, n - 1))}
              className="rounded-lg border px-3 py-1"
            >
              ←
            </button>
            <button
              onClick={() => setI((n) => Math.min(steps.length - 1, n + 1))}
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
