import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Diggle Coding Club schema.
 * See PLAN.md section 3 for the design rationale.
 */

export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  joinCode: text("join_code").notNull().unique(),
  currentLessonWeek: integer("current_lesson_week").notNull().default(1),
  // When false, students can only view up to currentLessonWeek.
  freeRoam: boolean("free_roam").notNull().default(false),
  namesLocked: boolean("names_locked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    avatarKey: text("avatar_key").notNull(),
    xp: integer("xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    streak: integer("streak").notNull().default(0),
    lastSeen: timestamp("last_seen", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("students_class_idx").on(t.classId),
    uniqueIndex("students_class_name_idx").on(t.classId, t.displayName),
  ],
);

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  weekNo: integer("week_no").notNull().unique(),
  title: text("title").notNull(),
  introMd: text("intro_md").notNull().default(""),
});

export type StepType = "teach" | "quiz" | "code" | "predict" | "debug" | "turtle";

export const steps = pgTable(
  "steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
    type: text("type").$type<StepType>().notNull(),
    title: text("title").notNull(),
    contentMd: text("content_md").notNull().default(""),
    starterCode: text("starter_code"),
    solutionCode: text("solution_code"),
    // tests_json: array of { kind: 'stdout' | 'assert', ... }
    testsJson: jsonb("tests_json").$type<unknown[]>(),
    hintsJson: jsonb("hints_json").$type<string[]>().default([]),
    xpReward: integer("xp_reward").notNull().default(10),
  },
  (t) => [uniqueIndex("steps_lesson_order_idx").on(t.lessonId, t.order)],
);

export type ProgressStatus = "locked" | "seen" | "attempted" | "complete";

export const progress = pgTable(
  "progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    stepId: uuid("step_id")
      .notNull()
      .references(() => steps.id, { onDelete: "cascade" }),
    status: text("status").$type<ProgressStatus>().notNull().default("seen"),
    attempts: integer("attempts").notNull().default(0),
    codeSubmitted: text("code_submitted"),
    usedHint: boolean("used_hint").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("progress_student_step_idx").on(t.studentId, t.stepId)],
);

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const studentBadges = pgTable(
  "student_badges",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.badgeId] })],
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").references(() => students.id, {
      onDelete: "cascade",
    }),
    type: text("type").notNull(),
    payloadJson: jsonb("payload_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_class_created_idx").on(t.classId, t.createdAt)],
);
