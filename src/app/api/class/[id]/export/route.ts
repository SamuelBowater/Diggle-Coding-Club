import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, students, progress, steps, lessons } from "@/db/schema";
import { isTeacher } from "@/lib/teacher";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isTeacher())) {
    return new Response("unauthorized", { status: 401 });
  }
  const { id } = await ctx.params;

  const [cls] = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
  if (!cls) return new Response("not found", { status: 404 });

  const roster = await db
    .select()
    .from(students)
    .where(eq(students.classId, id))
    .orderBy(students.displayName);

  const rows = await db
    .select({
      studentId: progress.studentId,
      status: progress.status,
      week: lessons.weekNo,
      stepTitle: steps.title,
      attempts: progress.attempts,
      usedHint: progress.usedHint,
      completedAt: progress.completedAt,
    })
    .from(progress)
    .innerJoin(steps, eq(progress.stepId, steps.id))
    .innerJoin(lessons, eq(steps.lessonId, lessons.id));

  const byStudent = new Map<string, typeof rows>();
  for (const r of rows) {
    const arr = byStudent.get(r.studentId) ?? [];
    arr.push(r);
    byStudent.set(r.studentId, arr);
  }

  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [
    "student,xp,level,week,step,status,attempts,used_hint,completed_at",
  ];
  for (const s of roster) {
    const prog = (byStudent.get(s.id) ?? []).filter(
      (r) => r.status === "complete" || r.status === "attempted",
    );
    if (prog.length === 0) {
      lines.push([esc(s.displayName), s.xp, s.level, "", "", "no activity", "", "", ""].join(","));
      continue;
    }
    for (const r of prog) {
      lines.push(
        [
          esc(s.displayName),
          s.xp,
          s.level,
          r.week,
          esc(r.stepTitle),
          r.status,
          r.attempts,
          r.usedHint ? "yes" : "no",
          r.completedAt ? new Date(r.completedAt).toISOString() : "",
        ].join(","),
      );
    }
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${cls.name.replace(/[^a-z0-9]+/gi, "-")}-progress.csv"`,
    },
  });
}
