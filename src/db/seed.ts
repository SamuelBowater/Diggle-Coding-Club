import { db } from "./index";
import { classes, lessons, steps, badges } from "./schema";
import { sql, eq, gt, and } from "drizzle-orm";

const BADGES = [
  { key: "first-program", name: "First Program", description: "Ran your very first Python program that worked.", icon: "\u{1F423}" },
  { key: "bug-squasher", name: "Bug Squasher", description: "Fixed a broken program.", icon: "\u{1F41B}" },
  { key: "speed-demon", name: "Speed Demon", description: "Finished a step first try with no hints.", icon: "⚡" },
  { key: "helper", name: "Helper", description: "Helped a classmate (awarded by your teacher).", icon: "\u{1F91D}" },
  { key: "perfect-week", name: "Perfect Week", description: "Completed every step in a lesson.", icon: "⭐" },
  { key: "streak-7", name: "On Fire", description: "Showed up and coded every week.", icon: "\u{1F525}" },
];

type SeedStep = {
  order: number;
  type: "teach" | "quiz" | "code" | "predict" | "debug" | "turtle";
  title: string;
  contentMd: string;
  starterCode?: string;
  solutionCode?: string;
  testsJson?: unknown[];
  hintsJson?: string[];
  xpReward: number;
};

const WEEK_1: { slug: string; title: string; introMd: string; steps: SeedStep[] } = {
  slug: "week-1-hello-python",
  title: "Hello, Python!",
  introMd:
    "Code is a list of instructions for a computer. Python reads them from the top down. This week we make the computer **talk** using `print()`.",
  steps: [
    {
      order: 1,
      type: "teach",
      title: "What is print?",
      contentMd:
        "`print()` shows a message on the screen.\n\n```python\nprint(\"Hello!\")\n```\n\nThe words go **inside the brackets** and **inside quotes**. When you press Run, the computer says `Hello!` back to you.",
      xpReward: 5,
    },
    {
      order: 2,
      type: "code",
      title: "Make the computer say hello",
      contentMd:
        "Write a line that prints the word **Hello!** exactly.\n\nUse the symbol buttons under the editor for `(` `)` and `\"`.",
      starterCode: "# type your code here\n",
      solutionCode: 'print("Hello!")',
      testsJson: [{ kind: "stdout", equals: "Hello!" }],
      hintsJson: [
        "Start with the word print.",
        "Put ( ) after print, and \" \" around your message.",
        'The whole line is: print("Hello!")',
      ],
      xpReward: 30,
    },
    {
      order: 3,
      type: "quiz",
      title: "Which line is right?",
      contentMd: "Which line prints the word **cat**?",
      testsJson: [
        {
          kind: "choice",
          answer: "B",
          choices: ["print(cat)", 'print("cat")', "say cat"],
        },
      ],
      xpReward: 20,
    },
    {
      order: 4,
      type: "predict",
      title: "Read it in your head",
      contentMd:
        "Look at this program. What will it print? Type your answer exactly.",
      solutionCode: 'print("3")\nprint("2")\nprint("1")\nprint("Go!")',
      testsJson: [{ kind: "text", equals: "3\n2\n1\nGo!" }],
      hintsJson: ["Each print() goes on its own new line."],
      xpReward: 15,
    },
    {
      order: 5,
      type: "debug",
      title: "Fix the broken line",
      contentMd:
        "This program should print **I love code** but it has a mistake. Fix it so it runs.",
      starterCode: 'print(I love code)',
      solutionCode: 'print("I love code")',
      testsJson: [{ kind: "stdout", equals: "I love code" }],
      hintsJson: [
        "Words the computer should show need quotes around them.",
        'Add \" before I and after code.',
      ],
      xpReward: 25,
    },
  ],
};

async function seedLesson(l: typeof WEEK_1, weekNo: number) {
  const [lesson] = await db
    .insert(lessons)
    .values({ slug: l.slug, weekNo, title: l.title, introMd: l.introMd })
    .onConflictDoUpdate({
      target: lessons.weekNo,
      set: { slug: l.slug, title: l.title, introMd: l.introMd },
    })
    .returning();

  for (const s of l.steps) {
    await db
      .insert(steps)
      .values({
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
      })
      .onConflictDoUpdate({
        target: [steps.lessonId, steps.order],
        set: {
          type: s.type,
          title: s.title,
          contentMd: s.contentMd,
          starterCode: s.starterCode ?? null,
          solutionCode: s.solutionCode ?? null,
          testsJson: s.testsJson ?? null,
          hintsJson: s.hintsJson ?? [],
          xpReward: s.xpReward,
        },
      });
  }

  // Drop any stale steps beyond what we just seeded.
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

  console.log("Seeding Week 1...");
  await seedLesson(WEEK_1, 1);

  console.log("Seeding demo class...");
  await db
    .insert(classes)
    .values({ name: "Demo Class", joinCode: "blue-otter-lamp-7" })
    .onConflictDoNothing({ target: classes.joinCode });

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(steps);
  console.log(`Done. ${count} steps in the database.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
