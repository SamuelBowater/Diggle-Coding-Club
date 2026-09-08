import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/session";
import {
  getLessonByWeek,
  getProgressForStudent,
  type LessonStep,
  type StepProgress,
} from "@/lib/lessons";
import { PlayerBar } from "@/components/PlayerBar";

const STEP_ICON: Record<string, string> = {
  teach: "\u{1F4D6}",
  quiz: "\u{2753}",
  code: "\u{1F4BB}",
  predict: "\u{1F52E}",
  debug: "\u{1F41B}",
  turtle: "\u{1F422}",
};

export default async function LessonPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/join");

  const data = await getLessonByWeek(student.currentLessonWeek);

  return (
    <div className="flex flex-1 flex-col">
      <PlayerBar
        displayName={student.displayName}
        avatarKey={student.avatarKey}
        xp={student.xp}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 p-5">
        {!data ? (
          <p className="mt-10 text-center opacity-70">
            Week {student.currentLessonWeek} isn&apos;t ready yet. Sit tight!
          </p>
        ) : (
          <LessonBody
            title={data.lesson.title}
            week={data.lesson.weekNo}
            intro={data.lesson.introMd}
            steps={data.steps}
            progressMap={await getProgressForStudent(student.id, data.lesson.id)}
          />
        )}
      </main>
    </div>
  );
}

function LessonBody({
  title,
  week,
  intro,
  steps,
  progressMap,
}: {
  title: string;
  week: number;
  intro: string;
  steps: LessonStep[];
  progressMap: Map<string, StepProgress>;
}) {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
        Week {week}
      </p>
      <h1 className="mt-1 text-3xl font-bold">{title}</h1>
      {intro && <p className="mt-2 opacity-80">{intro}</p>}

      <ol className="mt-6 space-y-2">
        {steps.map((s, i) => {
          const done = progressMap.get(s.id)?.status === "complete";
          return (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <span className="text-2xl">{STEP_ICON[s.type] ?? "\u{2728}"}</span>
              <span className="flex-1">
                <span className="font-medium">
                  {i + 1}. {s.title}
                </span>
              </span>
              <span className="whitespace-nowrap text-sm opacity-60">
                +{s.xpReward} XP
              </span>
              <span className="text-lg">{done ? "\u{2705}" : "\u{2B55}"}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-center text-sm opacity-50">
        Phase 5 will make each step interactive with a Python editor.
      </p>
    </>
  );
}
