"use client";

import { useRouter } from "next/navigation";

export function WeekPicker({
  current,
  classWeek,
  weeks,
}: {
  current: number;
  classWeek: number;
  weeks: number[];
}) {
  const router = useRouter();
  return (
    <div className="mb-3 flex items-center gap-2 text-sm">
      <span className="opacity-60">Week</span>
      <select
        value={current}
        onChange={(e) => {
          const w = Number(e.target.value);
          router.push(w === classWeek ? "/lesson" : `/lesson?week=${w}`);
        }}
        className="rounded-lg border px-2 py-1"
      >
        {weeks.map((w) => (
          <option key={w} value={w}>
            Week {w}
            {w === classWeek ? " (class is here)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
