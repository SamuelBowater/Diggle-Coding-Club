import { db } from "./index";
import { classes, lessons, steps, badges } from "./schema";
import { sql, eq, gt, and } from "drizzle-orm";
import { LESSONS, type SeedLesson } from "../content/lessons";

const BADGES = [
  { key: "first-program", name: "First Program", description: "Ran your very first Python program that worked.", icon: "\u{1F423}" },
  { key: "bug-squasher", name: "Bug Squasher", description: "Fixed a broken program.", icon: "\u{1F41B}" },
  { key: "speed-demon", name: "Speed Demon", description: "Finished a step first try with no hints.", icon: "⚡" },
  { key: "helper", name: "Helper", description: "Helped a classmate (awarded by your teacher).", icon: "\u{1F91D}" },
  { key: "perfect-week", name: "Perfect Week", description: "Completed every step in a lesson.", icon: "⭐" },
  { key: "challenge-champ", name: "Challenge Champ", description: "Solved a hard bonus challenge.", icon: "\u{1F9E0}" },
  { key: "streak-7", name: "On Fire", description: "Showed up and coded every week.", icon: "\u{1F525}" },
];

async function seedLesson(l: SeedLesson) {
  const [lesson] = await db
    .insert(lessons)
    .values({ slug: l.slug, weekNo: l.weekNo, title: l.title, introMd: l.introMd })
    .onConflictDoUpdate({
      target: lessons.weekNo,
      set: { slug: l.slug, title: l.title, introMd: l.introMd },
    })
    .returning();

  for (const s of l.steps) {
    const values = {
      lessonId: lesson.id,
      order: s.order,
      type: s.type,
      title: s.title,
      contentMd: s.contentMd,
      starterCode: s.starterCode ?? null,
      solutionCode: s.solutionCode ?? null,
      testsJson: s.testsJson ?? null,
      hintsJson: s.hintsJson ?? [],
      xpReward: s.xpReward,
      challengeTier: s.challengeTier ?? null,
    };
    await db
      .insert(steps)
      .values(values)
      .onConflictDoUpdate({
        target: [steps.lessonId, steps.order],
        set: {
          type: values.type,
          title: values.title,
          contentMd: values.contentMd,
          starterCode: values.starterCode,
          solutionCode: values.solutionCode,
          testsJson: values.testsJson,
          hintsJson: values.hintsJson,
          xpReward: values.xpReward,
          challengeTier: values.challengeTier,
        },
      });
  }

  const maxOrder = Math.max(...l.steps.map((s) => s.order));
  await db
    .delete(steps)
    .where(and(eq(steps.lessonId, lesson.id), gt(steps.order, maxOrder)));
}

async function main() {
  console.log("Seeding badges...");
  for (const b of BADGES) {
    await db.insert(badges).values(b).onConflictDoNothing({ target: badges.key });
  }

  for (const lesson of LESSONS) {
    console.log(`Seeding Week ${lesson.weekNo}: ${lesson.title}`);
    await seedLesson(lesson);
  }

  console.log("Seeding demo class...");
  await db
    .insert(classes)
    .values({ name: "Demo Class", joinCode: "blue-otter-lamp-7" })
    .onConflictDoNothing({ target: classes.joinCode });

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(steps);
  console.log(`Done. ${count} steps across ${LESSONS.length} weeks.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
