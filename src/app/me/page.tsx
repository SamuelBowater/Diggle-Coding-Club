import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { badges, studentBadges } from "@/db/schema";
import { getCurrentStudent } from "@/lib/session";
import { getWeekCompletion } from "@/lib/lessons";
import { levelProgress } from "@/lib/xp";
import { COSMETICS, unlockedCosmetics } from "@/lib/cosmetics";
import { Avatar } from "@/components/Avatar";
import { CosmeticPicker } from "./CosmeticPicker";
import { switchPlayerAction } from "@/app/lesson/actions";

export const metadata = { title: "My Dashboard · Diggle Coding Club" };

export default async function MePage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/join");

  const allBadges = await db.select().from(badges);
  const earned = await db
    .select({ badgeId: studentBadges.badgeId })
    .from(studentBadges)
    .where(eq(studentBadges.studentId, student.id));
  const earnedIds = new Set(earned.map((e) => e.badgeId));

  const weeks = await getWeekCompletion(student.id);
  const p = levelProgress(student.xp);
  const unlocked = unlockedCosmetics(student.level);
  const nextCosmetic = COSMETICS.find((c) => c.level > student.level);

  const activeWeek = student.currentLessonWeek;
  const active = weeks.find((w) => w.week === activeWeek);

  const isOpen = (week: number) => student.freeRoam || week === activeWeek;

  const cta = (done: number, total: number) => {
    if (total === 0) return "Coming soon";
    if (done === 0) return "Start lesson →";
    if (done >= total) return "Review lesson →";
    return "Carry on →";
  };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            avatarKey={student.avatarKey}
            cosmetic={student.equippedCosmetic}
            size={56}
          />
          <div>
            <h1 className="text-2xl font-bold">{student.displayName}</h1>
            <p className="opacity-70">
              Level {p.level} · {p.name} · {student.xp} XP
            </p>
          </div>
        </div>
        <form action={switchPlayerAction}>
          <button className="rounded-lg border px-2 py-1 text-xs opacity-60 hover:opacity-100">
            Switch player
          </button>
        </form>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${p.pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs opacity-60">
        {p.needed - p.into} XP to level {p.level + 1}
      </p>

      {/* This week's lesson */}
      <section className="mt-6">
        <h2 className="text-lg font-bold">This week&apos;s lesson</h2>
        {active && active.total > 0 ? (
          <Link
            href="/lesson"
            className="mt-2 flex items-center justify-between gap-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900"
          >
            <span>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                Week {active.week}
              </span>
              <span className="block text-lg font-bold">{active.title}</span>
              <span className="text-sm opacity-70">
                {active.done}/{active.total} steps done
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">
              {cta(active.done, active.total)}
            </span>
          </Link>
        ) : (
          <p className="mt-2 opacity-60">
            Week {activeWeek} isn&apos;t ready yet — sit tight!
          </p>
        )}
      </section>

      {/* All weeks */}
      <section className="mt-6">
        <h2 className="text-lg font-bold">All weeks</h2>
        <ul className="mt-2 space-y-1.5">
          {weeks.map((w) => {
            const open = isOpen(w.week) && w.total > 0;
            const complete = w.total > 0 && w.done >= w.total;
            const inner = (
              <>
                <span className="w-14 shrink-0 opacity-60">Week {w.week}</span>
                <span className="flex-1 truncate">{w.title}</span>
                <span className="shrink-0 tabular-nums opacity-70">
                  {w.total > 0 ? `${w.done}/${w.total}` : "—"}
                </span>
                <span className="w-5 text-right">
                  {complete ? "✅" : open ? "▶️" : "🔒"}
                </span>
              </>
            );
            const cls =
              "flex items-center gap-3 rounded-xl border p-3 text-sm";
            return (
              <li key={w.week}>
                {open ? (
                  <Link
                    href={
                      w.week === activeWeek ? "/lesson" : `/lesson?week=${w.week}`
                    }
                    className={`${cls} hover:bg-black/5 dark:hover:bg-white/10 ${
                      w.week === activeWeek ? "border-emerald-500" : ""
                    }`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={`${cls} opacity-45`}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
        {!student.freeRoam && (
          <p className="mt-2 text-xs opacity-50">
            🔒 Locked weeks open up as the club moves along.
          </p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Badges</h2>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {allBadges.map((b) => {
            const has = earnedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-xl border p-3 text-center ${
                  has ? "" : "opacity-35 grayscale"
                }`}
                title={b.description}
              >
                <div className="text-3xl">{b.icon}</div>
                <div className="mt-1 text-xs font-medium">{b.name}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Look</h2>
        <p className="text-sm opacity-60">
          Unlock a new accessory every couple of levels.
        </p>
        <CosmeticPicker
          equipped={student.equippedCosmetic}
          unlocked={unlocked.map((c) => ({
            key: c.key,
            emoji: c.emoji,
            name: c.name,
          }))}
        />
        {nextCosmetic && (
          <p className="mt-2 text-xs opacity-60">
            Next: {nextCosmetic.emoji} {nextCosmetic.name} at level{" "}
            {nextCosmetic.level}
          </p>
        )}
      </section>

      <div className="mt-8 text-center">
        <Link
          href="/me/certificate"
          className="inline-block rounded-xl border px-5 py-2 font-semibold hover:bg-black/5 dark:hover:bg-white/10"
        >
          🏅 View my certificate
        </Link>
      </div>
    </main>
  );
}
