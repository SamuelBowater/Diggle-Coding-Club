import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { sign, unsign } from "./signing";

const COOKIE_NAME = "diggle_teacher";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export function checkTeacherPassword(input: string): boolean {
  const expected = process.env.TEACHER_PASSWORD;
  if (!expected) throw new Error("TEACHER_PASSWORD is not set");
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function setTeacherSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, sign("teacher"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearTeacherSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isTeacher(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  return !!raw && unsign(raw) === "teacher";
}

export async function requireTeacher(): Promise<void> {
  const { redirect } = await import("next/navigation");
  if (!(await isTeacher())) redirect("/teacher/login");
}
