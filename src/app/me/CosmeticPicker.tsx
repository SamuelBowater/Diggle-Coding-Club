"use client";

import { useTransition } from "react";
import { equipCosmeticAction } from "./actions";

export function CosmeticPicker({
  equipped,
  unlocked,
}: {
  equipped: string | null;
  unlocked: { key: string; emoji: string; name: string }[];
}) {
  const [pending, start] = useTransition();

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button
        disabled={pending}
        onClick={() => start(() => equipCosmeticAction(null))}
        className={`rounded-xl border px-3 py-2 text-sm ${
          equipped === null ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950" : ""
        }`}
      >
        None
      </button>
      {unlocked.map((c) => (
        <button
          key={c.key}
          disabled={pending}
          onClick={() => start(() => equipCosmeticAction(c.key))}
          title={c.name}
          className={`rounded-xl border px-3 py-2 text-xl active:scale-95 ${
            equipped === c.key
              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950"
              : ""
          }`}
        >
          {c.emoji}
        </button>
      ))}
      {unlocked.length === 0 && (
        <p className="text-sm opacity-60">
          Nothing unlocked yet — reach level 2!
        </p>
      )}
    </div>
  );
}
