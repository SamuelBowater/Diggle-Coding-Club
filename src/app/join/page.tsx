import { getCurrentStudent } from "@/lib/session";
import { loadRoster } from "./actions";
import { JoinFlow } from "./JoinFlow";
import { PreloadPython } from "@/components/PreloadPython";

export default async function JoinPage() {
  // Always land here first and require an explicit tap — the device may
  // get handed to a different kid next time, so a lingering session
  // cookie should never silently sign someone in as whoever used it last.
  const student = await getCurrentStudent();
  const initialRoster = student ? await loadRoster(student.classId) : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 p-6">
      <JoinFlow initialRoster={initialRoster} />
      <PreloadPython />
    </main>
  );
}
