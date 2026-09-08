/* Pyodide runs here, off the main thread. Module worker (Pyodide 0.28+ requirement). */
/* eslint-disable */

// Self-hosted: files are copied into /public/pyodide by scripts/copy-pyodide.mjs.
// Same-origin means no CDN dependency and it keeps working offline once cached.
const PYODIDE_URL = "/pyodide/";

let pyodide = null;
let loadingPromise = null;

function post(msg) {
  self.postMessage(msg);
}

async function ensurePyodide() {
  if (pyodide) return pyodide;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    post({ type: "status", text: "Downloading Python…" });
    const { loadPyodide } = await import(PYODIDE_URL + "pyodide.mjs");
    post({ type: "status", text: "Starting Python…" });
    pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
    post({ type: "ready" });
    return pyodide;
  })();

  return loadingPromise;
}

const PREAMBLE = `
import sys, builtins

class _Out:
    def __init__(self, kind): self._kind = kind
    def write(self, s):
        if s:
            _emit(self._kind, s)
        return len(s)
    def flush(self): pass

sys.stdout = _Out("stdout")
sys.stderr = _Out("stderr")

def _make_input(lines):
    it = iter(lines)
    def _input(prompt=""):
        if prompt:
            print(prompt, end="")
        try:
            return next(it)
        except StopIteration:
            return ""
    return _input
`;

async function run(id, code, stdinLines) {
  const py = await ensurePyodide();

  // Bridge Python stdout/stderr (see PREAMBLE's _Out class) to worker messages.
  py.globals.set("_emit", (kind, text) => post({ type: kind, id, text }));

  try {
    py.runPython(PREAMBLE);
    py.runPython(`builtins.input = _make_input(${JSON.stringify(stdinLines || [])})`);
    await py.runPythonAsync(code);
    post({ type: "result", id, ok: true });
  } catch (err) {
    post({
      type: "result",
      id,
      ok: false,
      error: String(err && err.message ? err.message : err),
    });
  }
}

self.onmessage = async (e) => {
  const msg = e.data || {};
  if (msg.type === "init") {
    ensurePyodide().catch((err) =>
      post({ type: "status", text: "Python failed to load: " + String(err) }),
    );
  } else if (msg.type === "run") {
    run(msg.id, msg.code, msg.stdin);
  }
};
