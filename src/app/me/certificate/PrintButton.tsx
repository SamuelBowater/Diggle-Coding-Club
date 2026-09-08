"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
    >
      Print / Save as PDF
    </button>
  );
}
