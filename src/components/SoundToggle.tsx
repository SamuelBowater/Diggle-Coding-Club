"use client";

import { useEffect, useState } from "react";
import { soundEnabled, setSoundEnabled } from "@/lib/sfx";

export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(soundEnabled()), []);
  return (
    <button
      type="button"
      aria-label={on ? "Mute sound" : "Turn sound on"}
      onClick={() => {
        const next = !on;
        setOn(next);
        setSoundEnabled(next);
      }}
      className="rounded-lg border px-2 py-1 text-xs opacity-70 hover:opacity-100"
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}
