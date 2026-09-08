"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="bg-amber-500 px-3 py-1 text-center text-sm font-semibold text-amber-950">
      📡 You&apos;re offline — you can keep coding, but progress won&apos;t save
      until you reconnect.
    </div>
  );
}
