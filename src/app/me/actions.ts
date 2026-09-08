"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { students } from "@/db/schema";
import { getSessionStudentId } from "@/lib/session";
import { isCosmeticUnlocked } from "@/lib/cosmetics";

export async function equipCosmeticAction(key: string | null) {
  const studentId = await getSessionStudentId();
  if (!studentId) return;

  const [s] = await db
    .select({ level: students.level })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  if (!s) return;

  if (key !== null && !isCosmeticUnlocked(key, s.level)) return;

  await db
    .update(students)
    .set({ equippedCosmetic: key })
    .where(eq(students.id, studentId));
  revalidatePath("/me");
  revalidatePath("/lesson");
}
