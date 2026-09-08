import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { requireTeacher } from "@/lib/teacher";
import { getLessonByWeek } from "@/lib/lessons";
import { firstTest } from "@/lib/steps/types";
import { qrSvg } from "@/lib/qr";
import { Projector } from "./Projector";

export const metadata = { title: "Projector · Diggle Coding Club" };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTeacher();
  const { id } = await params;

  const [cls] = await db.select().from(classes).where(eq(classes.id, id)).limit(1);
  if (!cls) notFound();

  const data = await getLessonByWeek(cls.currentLessonWeek);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const joinUrl = `${proto}://${host}/join`;
  const svg = await qrSvg(joinUrl);

  return (
    <Projector
      classId={id}
      className={cls.name}
      joinCode={cls.joinCode}
      joinUrl={joinUrl}
      qrSvg={svg}
      week={cls.currentLessonWeek}
      lessonTitle={data?.lesson.title ?? "Lesson coming soon"}
      steps={
        data?.steps.map((s) => {
          const t = firstTest(s.testsJson);
          return {
            id: s.id,
            order: s.order,
            type: s.type,
            title: s.title,
            contentMd: s.contentMd,
            solutionCode: s.solutionCode,
            choices: t?.kind === "choice" ? t.choices : null,
          };
        }) ?? []
      }
    />
  );
}
