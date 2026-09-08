import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold sm:text-5xl">🐍 Diggle Coding Club</h1>
        <p className="text-lg opacity-80">
          Learn Python. Solve puzzles. Level up.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/join"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-500"
        >
          I&apos;m a student — join my class
        </Link>
        <Link
          href="/teacher"
          className="rounded-xl border px-6 py-3 text-lg font-semibold hover:bg-black/5 dark:hover:bg-white/10"
        >
          I&apos;m the teacher
        </Link>
      </div>

      <p className="text-sm opacity-50">
        Phase 1 scaffold — screens are stubbed. See PLAN.md.
      </p>
    </main>
  );
}
