"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/session";

export async function switchPlayerAction() {
  await clearSession();
  redirect("/join");
}
