import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/session";
import { getLessonByWeek, getProgressForStudent } from "@/lib/lessons";
import { firstTest } from "@/lib/steps/types";
import { LessonPlayer, type PlayerStep } from "./LessonPlayer";

export const metadata = { title: "Lesson · Diggle Coding Club" };

export default async function LessonPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/join");

  const data = await getLessonByWeek(student.currentLessonWeek);
  if (!data) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-center opacity-70">
        Week {student.currentLessonWeek} isn&apos;t ready yet. Sit tight!
      </main>
    );
  }

  const progressMap = await getProgressForStudent(student.id, data.lesson.id);

  const steps: PlayerStep[] = data.steps.map((s) => {
    const p = progressMap.get(s.id);
    return {
      id: s.id,
      order: s.order,
      type: s.type,
      title: s.title,
      contentMd: s.contentMd,
      starterCode: s.starterCode,
      solutionCode: s.solutionCode,
      test: firstTest(s.testsJson),
      hints: (s.hintsJson as string[]) ?? [],
      xpReward: s.xpReward,
      status: p?.status ?? "seen",
      draftCode: p?.codeSubmitted ?? null,
    };
  });

  return (
    <LessonPlayer
      student={{
        displayName: student.displayName,
        avatarKey: student.avatarKey,
        xp: student.xp,
      }}
      lesson={{
        weekNo: data.lesson.weekNo,
        title: data.lesson.title,
        introMd: data.lesson.introMd,
      }}
      steps={steps}
    />
  );
}
