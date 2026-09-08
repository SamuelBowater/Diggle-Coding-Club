"use client";

import { useEffect } from "react";
import { preloadPython } from "@/lib/python/client";

/** Invisible: starts downloading Pyodide in the background. */
export function PreloadPython() {
  useEffect(() => {
    const t = setTimeout(preloadPython, 400);
    return () => clearTimeout(t);
  }, []);
  return null;
}
