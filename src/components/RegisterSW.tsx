"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    const t = setTimeout(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, []);
  return null;
}
