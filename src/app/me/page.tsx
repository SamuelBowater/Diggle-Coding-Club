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

export const metadata = { title: "My Trophies · Diggle Coding Club" };

export default async function MePage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/join");

  const allBadges = await db.select().from(badges);
  const earned = await db
    .select({ badgeId: studentBadges.badgeId, awardedAt: studentBadges.awardedAt })
    .from(studentBadges)
    .where(eq(studentBadges.studentId, student.id));
  const earnedIds = new Set(earned.map((e) => e.badgeId));

  const weeks = await getWeekCompletion(student.id);
  const p = levelProgress(student.xp);
  const unlocked = unlockedCosmetics(student.level);
  const nextCosmetic = COSMETICS.find((c) => c.level > student.level);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-5">
      <Link href="/lesson" className="text-sm opacity-60 hover:opacity-100">
        ← Back to my lesson
      </Link>

      <div className="mt-3 flex items-center gap-4">
        <Avatar avatarKey={student.avatarKey} cosmetic={student.equippedCosmetic} size={56} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.displayName}</h1>
          <p className="opacity-70">
            Level {p.level} · {p.name} · {student.xp} XP
          </p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${p.pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs opacity-60">
            {p.needed - p.into} XP to level {p.level + 1}
          </p>
        </div>
      </div>

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
          unlocked={unlocked.map((c) => ({ key: c.key, emoji: c.emoji, name: c.name }))}
        />
        {nextCosmetic && (
          <p className="mt-2 text-xs opacity-60">
            Next: {nextCosmetic.emoji} {nextCosmetic.name} at level {nextCosmetic.level}
          </p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold">Weeks</h2>
        <ul className="mt-2 space-y-1.5">
          {weeks.map((w) => (
            <li key={w.week} className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 opacity-60">Week {w.week}</span>
              <span className="flex-1 truncate">{w.title}</span>
              <span className="shrink-0 tabular-nums">
                {w.total > 0 ? `${w.done}/${w.total}` : "—"}
              </span>
              <span className="w-5 text-right">
                {w.total > 0 && w.done >= w.total ? "✅" : ""}
              </span>
            </li>
          ))}
        </ul>
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
