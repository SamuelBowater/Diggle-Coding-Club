// Copies the runtime files Pyodide needs from node_modules into public/pyodide,
// so the browser loads them same-origin (no CDN, works offline on classroom wifi).
import { mkdir, copyFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "node_modules", "pyodide");
const DEST = path.join(process.cwd(), "public", "pyodide");

// Everything except source maps, type defs and the demo HTML pages.
const SKIP = new Set([
  "pyodide.js.map",
  "pyodide.mjs.map",
  "pyodide.asm.mjs.map",
  "pyodide.d.ts",
  "ffi.d.ts",
  "console.html",
  "console-v2.html",
  "README.md",
]);

async function main() {
  if (!existsSync(SRC)) {
    console.error("pyodide package not found in node_modules — run `npm install`.");
    process.exit(1);
  }
  await mkdir(DEST, { recursive: true });
  const entries = await readdir(SRC);
  let n = 0;
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const s = await stat(path.join(SRC, name));
    if (!s.isFile()) continue;
    await copyFile(path.join(SRC, name), path.join(DEST, name));
    n++;
  }
  console.log(`Copied ${n} Pyodide files to public/pyodide/`);
}

main();
