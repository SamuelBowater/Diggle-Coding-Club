import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { badges, studentBadges } from "@/db/schema";
import { getCurrentStudent } from "@/lib/session";
import { getWeekCompletion } from "@/lib/lessons";
import { levelName } from "@/lib/xp";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Certificate · Diggle Coding Club" };

export default async function CertificatePage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/join");

  const earned = await db
    .select({ name: badges.name, icon: badges.icon })
    .from(studentBadges)
    .innerJoin(badges, eq(badges.id, studentBadges.badgeId))
    .where(eq(studentBadges.studentId, student.id));

  const weeks = await getWeekCompletion(student.id);
  const weeksDone = weeks.filter((w) => w.total > 0 && w.done >= w.total).length;
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-5">
      <div className="flex items-center justify-between print:hidden">
        <a href="/me" className="text-sm opacity-60 hover:opacity-100">
          ← Back
        </a>
        <PrintButton />
      </div>

      <article className="mx-auto mt-4 rounded-2xl border-4 border-emerald-600 bg-white p-10 text-center text-neutral-900 print:border-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
          Diggle Coding Club
        </p>
        <h1 className="mt-6 text-2xl font-bold">Certificate of Achievement</h1>
        <p className="mt-6 text-sm opacity-70">This certifies that</p>
        <p className="mt-2 text-4xl font-extrabold">{student.displayName}</p>
        <p className="mx-auto mt-6 max-w-md text-lg">
          has learned to program in <b>Python</b> — completing{" "}
          <b>{weeksDone}</b> {weeksDone === 1 ? "week" : "weeks"} of lessons and
          reaching <b>Level {student.level}</b>, {levelName(student.level)}, with{" "}
          <b>{student.xp} XP</b>.
        </p>

        {earned.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest opacity-60">
              Badges earned
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-lg">
              {earned.map((b, i) => (
                <span key={i}>
                  {b.icon} {b.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-end justify-between text-sm">
          <div className="text-left">
            <div className="w-40 border-t border-neutral-400 pt-1">Teacher</div>
          </div>
          <div className="text-right">
            <div className="w-40 border-t border-neutral-400 pt-1">{today}</div>
          </div>
        </div>
      </article>
    </main>
  );
}
