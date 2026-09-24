import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { classes, students, studentBadges } from "@/db/schema";
import { requireTeacher } from "@/lib/teacher";
import { qrSvg } from "@/lib/qr";
import { levelName } from "@/lib/xp";
import { ClassControls } from "./ClassControls";
import { StudentAdmin } from "./StudentAdmin";
import { LiveDashboard } from "./LiveDashboard";

export const metadata = { title: "Class · Diggle Coding Club" };

export default async function ClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTeacher();
  const { id } = await params;

  const [cls] = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
  if (!cls) notFound();

  const roster = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      avatarKey: students.avatarKey,
      xp: students.xp,
      level: students.level,
      lastSeen: students.lastSeen,
      badges: sql<number>`count(${studentBadges.badgeId})`,
    })
    .from(students)
    .leftJoin(studentBadges, eq(studentBadges.studentId, students.id))
    .where(eq(students.classId, id))
    .groupBy(students.id)
    .orderBy(desc(students.xp));

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const joinUrl = `${proto}://${host}/join`;
  const svg = await qrSvg(joinUrl);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link href="/teacher" className="text-sm opacity-60 hover:opacity-100">
        ← All classes
      </Link>
      <h1 className="mt-1 text-2xl font-bold">{cls.name}</h1>

      <section className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border p-4">
          <p className="text-sm opacity-60">Class join code</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wide">
            {cls.joinCode}
          </p>
          <p className="mt-2 text-sm opacity-70">
            Students open <span className="font-mono">{joinUrl}</span>, tap “join
            my class”, and type this code.
          </p>
          <Link
            href={`/teacher/class/${id}/project`}
            className="mt-3 inline-block rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white"
          >
            Open projector view →
          </Link>
        </div>
        <div
          className="h-32 w-32 self-center [&_svg]:h-full [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
          aria-hidden
        />
      </section>

      <ClassControls
        classId={id}
        week={cls.currentLessonWeek}
        freeRoam={cls.freeRoam}
      />

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-bold">Live now</h2>
        <a
          href={`/api/class/${id}/export`}
          className="text-sm font-semibold text-emerald-700 underline dark:text-emerald-400"
        >
          Export progress CSV
        </a>
      </div>
      <LiveDashboard classId={id} />

      <h2 className="mt-8 text-lg font-bold">Students</h2>
      <div className="mt-2 space-y-2">
        {roster.map((s) => (
          <StudentAdmin
            key={s.id}
            classId={id}
            student={{
              id: s.id,
              displayName: s.displayName,
              avatarKey: s.avatarKey,
              xp: s.xp,
              level: s.level,
              levelName: levelName(s.level),
              badges: Number(s.badges),
              lastSeen: s.lastSeen ? new Date(s.lastSeen).toISOString() : null,
            }}
          />
        ))}
        {roster.length === 0 && (
          <p className="opacity-60">No students have joined yet.</p>
        )}
      </div>
    </main>
  );
}
