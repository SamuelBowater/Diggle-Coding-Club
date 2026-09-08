import type { Test } from "./types";

/** Loose comparison for kid-written output: trim each line, trim ends, unify newlines. */
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "")
    .trim();
}

export type CheckResult = { pass: boolean; message: string };

export function checkStdout(stdout: string, test: Test): CheckResult {
  if (test.kind !== "stdout") return { pass: false, message: "" };
  const got = normalizeOutput(stdout);
  if (test.equals !== undefined) {
    const want = normalizeOutput(test.equals);
    return got === want
      ? { pass: true, message: "That's exactly right!" }
      : {
          pass: false,
          message: `Not quite. Your program printed:\n${got || "(nothing)"}`,
        };
  }
  if (test.contains !== undefined) {
    return got.includes(normalizeOutput(test.contains))
      ? { pass: true, message: "Nice — that's what we wanted to see." }
      : { pass: false, message: "Close! Check the exact words and spelling." };
  }
  return { pass: true, message: "Done." };
}

export function checkChoice(choiceLabel: string, test: Test): CheckResult {
  if (test.kind !== "choice") return { pass: false, message: "" };
  return choiceLabel === test.answer
    ? { pass: true, message: "Correct!" }
    : { pass: false, message: "Not that one — have another look." };
}

export function checkText(text: string, test: Test): CheckResult {
  if (test.kind !== "text") return { pass: false, message: "" };
  return normalizeOutput(text) === normalizeOutput(test.equals)
    ? { pass: true, message: "Spot on!" }
    : { pass: false, message: "Not quite what it prints. Try running it in your head again." };
}
