export type StepKind =
  | "teach"
  | "quiz"
  | "code"
  | "predict"
  | "debug"
  | "turtle";

export type StdoutTest = {
  kind: "stdout";
  equals?: string;
  contains?: string;
  /** Lines fed to input() when the student's program runs. */
  stdin?: string[];
};

export type ChoiceTest = {
  kind: "choice";
  answer: string; // e.g. "B"
  choices: string[]; // display order; label is A, B, C, ...
};

export type TextTest = {
  kind: "text";
  equals: string; // e.g. predicted output
};

export type Test = StdoutTest | ChoiceTest | TextTest;

export function firstTest(tests: unknown): Test | null {
  if (Array.isArray(tests) && tests.length > 0) return tests[0] as Test;
  return null;
}
