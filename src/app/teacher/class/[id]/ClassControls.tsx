"use client";

import { useTransition } from "react";
import { setWeekAction, toggleFreeRoamAction } from "../../actions";

const WEEK_TITLES = [
  "Hello, Python!",
  "Variables",
  "Numbers & maths",
  "Making choices",
  "Loops",
  "Lists",
  "Functions",
  "Mini-project",
];

export function ClassControls({
  classId,
  week,
  freeRoam,
}: {
  classId: string;
  week: number;
  freeRoam: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <section className="mt-4 rounded-xl border p-4">
      <p className="text-sm font-semibold">Current lesson</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {WEEK_TITLES.map((title, i) => {
          const w = i + 1;
          return (
            <button
              key={w}
              disabled={pending}
              onClick={() => start(() => setWeekAction(classId, w))}
              title={title}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                w === week
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-sm opacity-70">
        Week {week}: {WEEK_TITLES[week - 1]}
      </p>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={freeRoam}
          disabled={pending}
          onChange={(e) =>
            start(() => toggleFreeRoamAction(classId, e.target.checked))
          }
        />
        Let students jump ahead to any week (free roam)
      </label>
    </section>
  );
}
