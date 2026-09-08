import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { classes, students } from "@/db/schema";
import { requireTeacher } from "@/lib/teacher";
import { createClassAction } from "./actions";
import { logoutAction } from "./login/actions";

export const metadata = { title: "Teacher · Diggle Coding Club" };

export default async function TeacherHome() {
  await requireTeacher();

  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      joinCode: classes.joinCode,
      week: classes.currentLessonWeek,
      count: sql<number>`count(${students.id})`,
    })
    .from(classes)
    .leftJoin(students, eq(students.classId, classes.id))
    .groupBy(classes.id)
    .orderBy(desc(classes.createdAt));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your classes</h1>
        <form action={logoutAction}>
          <button className="text-sm opacity-60 hover:opacity-100">Sign out</button>
        </form>
      </div>

      <ul className="mt-4 space-y-2">
        {rows.map((c) => (
          <li key={c.id}>
            <Link
              href={`/teacher/class/${c.id}`}
              className="flex items-center justify-between rounded-xl border p-4 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span>
                <span className="font-semibold">{c.name}</span>
                <span className="ml-2 text-sm opacity-60">
                  {Number(c.count)} students · Week {c.week}
                </span>
              </span>
              <code className="text-sm opacity-70">{c.joinCode}</code>
            </Link>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-xl border border-dashed p-4 text-center opacity-60">
            No classes yet — make one below.
          </li>
        )}
      </ul>

      <form action={createClassAction} className="mt-6 flex gap-2">
        <input
          name="name"
          placeholder="New class name (e.g. Tuesday Club)"
          className="flex-1 rounded-xl border px-4 py-2"
        />
        <button className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white">
          Create
        </button>
      </form>
    </main>
  );
}
