import { avatarEmoji } from "@/lib/avatars";
import { levelProgress } from "@/lib/xp";
import { switchPlayerAction } from "@/app/lesson/actions";

export function PlayerBar({
  displayName,
  avatarKey,
  xp,
}: {
  displayName: string;
  avatarKey: string;
  xp: number;
}) {
  const p = levelProgress(xp);
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/90 px-4 py-2 backdrop-blur">
      <span className="text-3xl">{avatarEmoji(avatarKey)}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="truncate font-semibold">{displayName}</span>
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
