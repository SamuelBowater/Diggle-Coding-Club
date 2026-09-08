"use client";

export type RunResult = {
  stdout: string;
  stderr: string;
  ok: boolean;
  error?: string;
};

type Listener = (r: RunResult) => void;

type WorkerMsg =
  | { type: "status"; text: string }
  | { type: "ready" }
  | { type: "stdout"; id: number; text: string }
  | { type: "stderr"; id: number; text: string }
  | { type: "result"; id: number; ok: boolean; error?: string };

let worker: Worker | null = null;
let ready = false;
let statusText = "Not started";
let nextId = 1;

const readyWaiters: (() => void)[] = [];
const statusListeners = new Set<(s: { ready: boolean; text: string }) => void>();
const pending = new Map<
  number,
  { stdout: string; stderr: string; onChunk?: Listener; resolve: (r: RunResult) => void }
>();

function emitStatus() {
  for (const l of statusListeners) l({ ready, text: statusText });
}

function handle(msg: WorkerMsg) {
  switch (msg.type) {
    case "status":
      statusText = msg.text;
      emitStatus();
      break;
    case "ready":
      ready = true;
      statusText = "Ready";
      emitStatus();
      readyWaiters.splice(0).forEach((fn) => fn());
      break;
    case "stdout":
    case "stderr": {
      const p = pending.get(msg.id);
      if (!p) return;
      if (msg.type === "stdout") p.stdout += msg.text;
      else p.stderr += msg.text;
      p.onChunk?.({ stdout: p.stdout, stderr: p.stderr, ok: true });
      break;
    }
    case "result": {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      p.resolve({ stdout: p.stdout, stderr: p.stderr, ok: msg.ok, error: msg.error });
      break;
    }
  }
}

export function getPythonWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/pyodide-worker.js", { type: "module" });
  worker.onmessage = (e: MessageEvent<WorkerMsg>) => handle(e.data);
  worker.onerror = (e) => {
    statusText = `Python failed to load: ${e.message ?? "unknown error"}`;
    emitStatus();
  };
  worker.postMessage({ type: "init", id: 0 });
  statusText = "Downloading Python…";
  emitStatus();
  return worker;
}

/** Kick off the Pyodide download early (e.g. on the join screen). */
export function preloadPython() {
  if (typeof window === "undefined") return;
  getPythonWorker();
}

export function onPythonStatus(
  cb: (s: { ready: boolean; text: string }) => void,
): () => void {
  statusListeners.add(cb);
  cb({ ready, text: statusText });
  return () => statusListeners.delete(cb);
}

export function runPython(
  code: string,
  opts?: { stdin?: string[]; onChunk?: Listener },
): Promise<RunResult> {
  const w = getPythonWorker();
  const id = nextId++;
  return new Promise<RunResult>((resolve) => {
    pending.set(id, { stdout: "", stderr: "", onChunk: opts?.onChunk, resolve });
    w.postMessage({ type: "run", id, code, stdin: opts?.stdin ?? [] });
  });
}
