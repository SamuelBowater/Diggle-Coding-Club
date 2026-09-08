import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { db } from "./index";
import { classes, lessons, steps, badges } from "./schema";
import { sql } from "drizzle-orm";

const BADGES = [
  { key: "first-program", name: "First Program", description: "Ran your very first line of Python.", icon: "\u{1F423}" },
  { key: "bug-squasher", name: "Bug Squasher", description: "Fixed a broken program.", icon: "\u{1F41B}" },
  { key: "speed-demon", name: "Speed Demon", description: "Finished a lesson quickly with no hints.", icon: "⚡" },
  { key: "helper", name: "Helper", description: "Helped a classmate (awarded by your teacher).", icon: "\u{1F91D}" },
  { key: "perfect-week", name: "Perfect Week", description: "Completed every step in a lesson.", icon: "⭐" },
  { key: "streak-7", name: "On Fire", description: "Showed up and coded every week.", icon: "\u{1F525}" },
];

async function main() {
  console.log("Seeding badges...");
  for (const b of BADGES) {
    await db.insert(badges).values(b).onConflictDoNothing({ target: badges.key });
  }

  console.log("Seeding lesson 1...");
  const [lesson1] = await db
    .insert(lessons)
    .values({
      slug: "week-1-hello-python",
      weekNo: 1,
      title: "Hello, Python!",
      introMd:
        "This week we make the computer talk to us with `print()`.",
    })
    .onConflictDoUpdate({
      target: lessons.weekNo,
      set: { title: "Hello, Python!" },
    })
    .returning();

  const week1Steps = [
    {
      order: 1,
      type: "teach" as const,
      title: "What is code?",
      contentMd:
        "Code is a set of instructions we give a computer. Python reads them from top to bottom.",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code" as const,
      title: "Make the computer say hello",
      contentMd: "Type `print(\"Hello!\")` and press Run.",
      starterCode: "# Type your code below\n",
      solutionCode: 'print("Hello!")',
      testsJson: [{ kind: "stdout", equals: "Hello!" }],
      hintsJson: [
        "Use the print command.",
        "Put your message inside quotation marks.",
        'The full line is: print("Hello!")',
      ],
      xpReward: 30,
    },
    {
      order: 3,
      type: "quiz" as const,
      title: "Quick check",
      contentMd:
        "Which line prints the word cat?\n\nA) `print(cat)`\nB) `print(\"cat\")`\nC) `say cat`",
      testsJson: [{ kind: "choice", answer: "B" }],
      xpReward: 20,
    },
  ];

  for (const s of week1Steps) {
    await db
      .insert(steps)
      .values({ ...s, lessonId: lesson1.id })
      .onConflictDoUpdate({
        target: [steps.lessonId, steps.order],
        set: { title: s.title, contentMd: s.contentMd },
      });
  }

  console.log("Seeding demo class...");
  await db
    .insert(classes)
    .values({ name: "Demo Class", joinCode: "blue-otter-lamp-7" })
    .onConflictDoNothing({ target: classes.joinCode });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(steps);
  console.log(`Done. ${count} steps in the database.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
