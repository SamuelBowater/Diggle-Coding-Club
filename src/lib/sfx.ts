"use client";

// Tiny synth sound effects — no audio files. Respects a localStorage mute flag.

const KEY = "diggle_sound";
let ctx: AudioContext | null = null;

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

function tone(freq: number, start: number, dur: number, gain = 0.15) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

function ensureCtx() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AC) ctx = new AC();
  }
  ctx?.resume().catch(() => {});
}

export function playCorrect() {
  if (!soundEnabled()) return;
  ensureCtx();
  tone(660, 0, 0.12);
  tone(880, 0.1, 0.16);
}

export function playWrong() {
  if (!soundEnabled()) return;
  ensureCtx();
  tone(300, 0, 0.18, 0.12);
  tone(220, 0.12, 0.22, 0.12);
}

export function playLevelUp() {
  if (!soundEnabled()) return;
  ensureCtx();
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2));
}

export function playBadge() {
  if (!soundEnabled()) return;
  ensureCtx();
  [784, 988, 1319].forEach((f, i) => tone(f, i * 0.08, 0.18));
}
