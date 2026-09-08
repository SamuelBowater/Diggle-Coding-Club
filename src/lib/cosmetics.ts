export type Cosmetic = {
  key: string;
  emoji: string;
  name: string;
  level: number; // level at which it unlocks
};

/** Cosmetic accessories, layered on the bottom-right of the avatar. */
export const COSMETICS: Cosmetic[] = [
  { key: "cap", emoji: "\u{1F9E2}", name: "Cap", level: 2 },
  { key: "star", emoji: "⭐", name: "Gold Star", level: 3 },
  { key: "bowtie", emoji: "\u{1F380}", name: "Bow", level: 4 },
  { key: "tophat", emoji: "\u{1F3A9}", name: "Top Hat", level: 5 },
  { key: "sparkles", emoji: "✨", name: "Sparkles", level: 6 },
  { key: "fire", emoji: "\u{1F525}", name: "On Fire", level: 7 },
  { key: "crown", emoji: "\u{1F451}", name: "Crown", level: 8 },
  { key: "rainbow", emoji: "\u{1F308}", name: "Rainbow", level: 10 },
  { key: "rocket", emoji: "\u{1F680}", name: "Rocket Boost", level: 12 },
];

const byKey = new Map(COSMETICS.map((c) => [c.key, c]));

export function cosmeticEmoji(key: string | null | undefined): string | null {
  if (!key) return null;
  return byKey.get(key)?.emoji ?? null;
}

export function unlockedCosmetics(level: number): Cosmetic[] {
  return COSMETICS.filter((c) => c.level <= level);
}

export function isCosmeticUnlocked(key: string, level: number): boolean {
  const c = byKey.get(key);
  return !!c && c.level <= level;
}
