import Link from "next/link";
import { getCurrentStudent } from "@/lib/session";
import { PythonEditor } from "@/components/PythonEditor";
import { PlayerBar } from "@/components/PlayerBar";

export const metadata = { title: "Free Play · Diggle Coding Club" };

const STARTER = `# Try me! Press Run.
print("Hello from Python!")

name = "coder"
print("Nice to meet you,", name)

for i in range(1, 4):
    print(i, "cheers!")
`;

export default async function PlaygroundPage() {
  const student = await getCurrentStudent();

  return (
    <div className="flex flex-1 flex-col">
      {student && (
        <PlayerBar
          displayName={student.displayName}
          avatarKey={student.avatarKey}
          cosmetic={student.equippedCosmetic}
          xp={student.xp}
        />
      )}
      <main className="mx-auto w-full max-w-2xl flex-1 p-5">
        {student && (
          <Link href="/me" className="text-sm opacity-60 hover:opacity-100">
            ← Back to my dashboard
          </Link>
        )}
        <h1 className="mb-1 mt-1 text-2xl font-bold">🎨 Free Play</h1>
        <p className="mb-4 text-sm opacity-70">
          A scratch space for trying things out — no lesson, no checking, no
          XP. Nothing here is saved, so if you write something brilliant,
          screenshot it!
        </p>
        <PythonEditor starter={STARTER} minHeight={260} />
      </main>
    </div>
  );
}
