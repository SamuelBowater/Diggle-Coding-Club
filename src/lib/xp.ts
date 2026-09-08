export const LEVEL_NAMES = [
  "Byte",
  "Sprout",
  "Explorer",
  "Tinkerer",
  "Word Wrangler",
  "Number Ninja",
  "Decider",
  "Loop Wizard",
  "List Keeper",
  "Function Maker",
  "Bug Hunter",
  "Code Captain",
  "Algorithm Ace",
  "Debug Master",
  "Python Pro",
  "Code Wizard",
  "Grandmaster",
];

/** Total XP needed to have reached the start of `level`. Level 1 = 0. */
export function cumulativeXpForLevel(level: number): number {
  const l = Math.max(1, level);
  return 100 * (l - 1) + 25 * (l - 1) * (l - 2);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (cumulativeXpForLevel(level + 1) <= xp) level++;
  return level;
}

export function levelName(level: number): string {
  return LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1] ?? "Legend";
}

export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const floor = cumulativeXpForLevel(level);
  const ceil = cumulativeXpForLevel(level + 1);
  return {
    level,
    name: levelName(level),
    into: xp - floor,
    needed: ceil - floor,
    pct: Math.round(((xp - floor) / (ceil - floor)) * 100),
  };
}
