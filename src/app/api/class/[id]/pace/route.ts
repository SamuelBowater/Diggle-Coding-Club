import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classes, students } from "@/db/schema";
import { getSessionStudentId } from "@/lib/session";
import { isTeacher } from "@/lib/teacher";

/**
 * Lightweight polling endpoint so a student's lesson page knows what step
 * the teacher's projector is currently on. Deliberately returns only the
 * pace fields — never the roster, unlike /live which is teacher-only.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  if (!(await isTeacher())) {
    const studentId = await getSessionStudentId();
    if (!studentId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const [s] = await db
      .select({ classId: students.classId })
      .from(students)
      .where(eq(students.id, studentId))
      .limit(1);
    if (!s || s.classId !== id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const [cls] = await db
    .select({
      pacedByTeacher: classes.pacedByTeacher,
      currentStepOrder: classes.currentStepOrder,
      currentLessonWeek: classes.currentLessonWeek,
    })
    .from(classes)
    .where(eq(classes.id, id))
    .limit(1);

  if (!cls) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(cls, { headers: { "Cache-Control": "no-store" } });
}
