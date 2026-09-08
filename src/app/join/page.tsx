import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/session";
import { JoinFlow } from "./JoinFlow";

export default async function JoinPage() {
  const student = await getCurrentStudent();
  if (student) redirect("/lesson");
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 p-6">
      <JoinFlow />
    </main>
  );
}
