import { NextResponse } from "next/server";
import { isTeacher } from "@/lib/teacher";
import { getLiveSnapshot } from "@/lib/live";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const snapshot = await getLiveSnapshot(id);
  if (!snapshot) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}
