import Link from "next/link";
import { levelProgress } from "@/lib/xp";
import { switchPlayerAction } from "@/app/lesson/actions";
import { Avatar } from "./Avatar";
import { SoundToggle } from "./SoundToggle";

export function PlayerBar({
  displayName,
  avatarKey,
  cosmetic,
  xp,
}: {
  displayName: string;
  avatarKey: string;
  cosmetic?: string | null;
  xp: number;
}) {
  const p = levelProgress(xp);
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/90 px-4 py-2 backdrop-blur">
      <Link href="/me" aria-label="My trophies">
        <Avatar avatarKey={avatarKey} cosmetic={cosmetic} size={32} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <Link href="/me" className="truncate font-semibold hover:underline">
            {displayName}
          </Link>
          <span className="whitespace-nowrap opacity-70">
            Lv {p.level} · {p.name}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
            style={{ width: `${p.pct}%` }}
          />
        </div>
      </div>
      <SoundToggle />
      <form action={switchPlayerAction}>
        <button
          type="submit"
          className="rounded-lg border px-2 py-1 text-xs opacity-70 hover:opacity-100"
        >
          Switch
        </button>
      </form>
    </header>
  );
}
