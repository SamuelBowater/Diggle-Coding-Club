"use server";

import { redirect } from "next/navigation";
import { checkTeacherPassword, setTeacherSession, clearTeacherSession } from "@/lib/teacher";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkTeacherPassword(password)) {
    return { error: "Wrong password." };
  }
  await setTeacherSession();
  redirect("/teacher");
}

export async function logoutAction() {
  await clearTeacherSession();
  redirect("/teacher/login");
}
