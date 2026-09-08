"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import {
  onPythonStatus,
  runPython,
  preloadPython,
  type RunResult,
} from "@/lib/python/client";

const SYMBOLS = ["(", ")", '"', ":", "_", "#", "=", "[", "]", ".", ",", "+"];

export function PythonEditor({
  starter = "",
  stdin,
  onResult,
  minHeight = 180,
}: {
  starter?: string;
  stdin?: string[];
  onResult?: (r: RunResult) => void;
  minHeight?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [status, setStatus] = useState({ ready: false, text: "Loading…" });
  const [running, setRunning] = useState(false);
  const [out, setOut] = useState<RunResult | null>(null);

  useEffect(() => preloadPython(), []);
  useEffect(() => onPythonStatus(setStatus), []);

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: starter,
        extensions: [
          basicSetup,
          python(),
          indentUnit.of("    "),
          keymap.of([indentWithTab]),
          EditorView.theme({
            "&": { fontSize: "15px" },
            ".cm-content": { fontFamily: "var(--font-mono, monospace)" },
            "&.cm-focused": { outline: "2px solid rgb(16 185 129)" },
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insert = useCallback((text: string) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch(view.state.replaceSelection(text));
    view.focus();
  }, []);

  const run = useCallback(async () => {
    const view = viewRef.current;
    if (!view || running) return;
    setRunning(true);
    setOut({ stdout: "", stderr: "", ok: true });
    const result = await runPython(view.state.doc.toString(), {
      stdin,
      onChunk: (partial) => setOut({ ...partial, ok: true }),
    });
    setOut(result);
    setRunning(false);
    onResult?.(result);
  }, [running, stdin, onResult]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={hostRef}
        className="overflow-hidden rounded-xl border"
        style={{ minHeight }}
      />

      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {SYMBOLS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => insert(s)}
            className="min-w-9 shrink-0 rounded-lg border bg-black/5 px-3 py-2 font-mono text-base active:scale-95 dark:bg-white/10"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={running || !status.ready}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {running ? "Running…" : "▶ Run"}
        </button>
        {!status.ready && (
          <span className="text-sm opacity-60">{status.text}</span>
        )}
      </div>

      {out && (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-neutral-950 p-3 text-sm text-neutral-100">
          {out.stdout}
          {out.stderr && (
            <span className="text-red-400">{out.stderr}</span>
          )}
          {out.error && !out.stderr && (
            <span className="text-red-400">{out.error}</span>
          )}
          {!out.stdout && !out.stderr && !out.error && !running && (
            <span className="opacity-50">(no output)</span>
          )}
        </pre>
      )}
    </div>
  );
}
