"use client";

import { useEffect, useState } from "react";
import { avatarEmoji } from "@/lib/avatars";
import type { LiveSnapshot, LiveStudent } from "@/lib/live";

const STATUS_STYLE: Record<LiveStudent["status"], string> = {
  done: "bg-emerald-500 text-white",
  working: "bg-amber-300 text-amber-950",
  stuck: "bg-red-500 text-white",
  idle: "bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50",
  "not-started": "bg-black/5 text-black/40 dark:bg-white/5 dark:text-white/40",
};

const STATUS_LABEL: Record<LiveStudent["status"], string> = {
  done: "Finished",
  working: "Working",
  stuck: "Stuck",
  idle: "Idle",
  "not-started": "Not started",
};

export function LiveDashboard({ classId }: { classId: string }) {
  const [snap, setSnap] = useState<LiveSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/class/${classId}/live`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as LiveSnapshot;
        if (alive) {
          setSnap(data);
          setError(null);
        }
      } catch {
        if (alive) setError("Can't reach the server");
      }
    };
    tick();
    const iv = setInterval(tick, 4000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [classId]);

  if (!snap) {
    return (
      <p className="mt-2 text-sm opacity-60">
        {error ?? "Loading live view…"}
      </p>
    );
  }

  const counts = snap.students.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mt-2">
      <div className="mb-2 flex flex-wrap gap-3 text-xs">
        {(Object.keys(STATUS_LABEL) as LiveStudent["status"][]).map((k) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded ${STATUS_STYLE[k]}`} />
            {STATUS_LABEL[k]} {counts[k] ? `(${counts[k]})` : ""}
          </span>
        ))}
        {error && <span className="text-red-600">· {error}</span>}
      </div>

      {snap.students.length === 0 ? (
        <p className="text-sm opacity-60">No students have joined yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {snap.students.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl p-2 text-sm ${STATUS_STYLE[s.status]}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{avatarEmoji(s.avatarKey)}</span>
                <span className="truncate font-medium">{s.displayName}</span>
              </div>
              <div className="mt-1 text-xs opacity-90">
                Step {s.activeStep}/{snap.totalSteps} · {s.completed} done
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
