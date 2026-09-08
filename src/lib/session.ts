import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "@/db";
import { students, classes } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "diggle_session";
const PENDING_CLASS_COOKIE = "diggle_pending_class";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(value: string) {
  const mac = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function unsign(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return null;
  const value = signed.slice(0, idx);
  const expected = sign(value);
  // constant-time compare
  const a = Buffer.from(signed);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export async function setSession(studentId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, sign(studentId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  jar.delete(PENDING_CLASS_COOKIE);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSessionStudentId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return unsign(raw);
}

export type CurrentStudent = {
  id: string;
  displayName: string;
  avatarKey: string;
  xp: number;
  level: number;
  streak: number;
  classId: string;
  className: string;
  joinCode: string;
  currentLessonWeek: number;
  freeRoam: boolean;
};

export async function getCurrentStudent(): Promise<CurrentStudent | null> {
  const id = await getSessionStudentId();
  if (!id) return null;
  const rows = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      avatarKey: students.avatarKey,
      xp: students.xp,
      level: students.level,
      streak: students.streak,
      classId: classes.id,
      className: classes.name,
      joinCode: classes.joinCode,
      currentLessonWeek: classes.currentLessonWeek,
      freeRoam: classes.freeRoam,
    })
    .from(students)
    .innerJoin(classes, eq(students.classId, classes.id))
    .where(eq(students.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// --- pending class (between entering a code and choosing a name) ---

export async function setPendingClass(classId: string) {
  const jar = await cookies();
  jar.set(PENDING_CLASS_COOKIE, sign(classId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30, // 30 minutes
  });
}

export async function getPendingClassId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(PENDING_CLASS_COOKIE)?.value;
  if (!raw) return null;
  return unsign(raw);
}
