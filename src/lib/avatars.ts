export type Avatar = { key: string; emoji: string; label: string };

export const AVATARS: Avatar[] = [
  { key: "fox", emoji: "\u{1F98A}", label: "Fox" },
  { key: "cat", emoji: "\u{1F431}", label: "Cat" },
  { key: "dog", emoji: "\u{1F436}", label: "Dog" },
  { key: "panda", emoji: "\u{1F43C}", label: "Panda" },
  { key: "koala", emoji: "\u{1F428}", label: "Koala" },
  { key: "tiger", emoji: "\u{1F42F}", label: "Tiger" },
  { key: "frog", emoji: "\u{1F438}", label: "Frog" },
  { key: "penguin", emoji: "\u{1F427}", label: "Penguin" },
  { key: "owl", emoji: "\u{1F989}", label: "Owl" },
  { key: "unicorn", emoji: "\u{1F984}", label: "Unicorn" },
  { key: "dragon", emoji: "\u{1F432}", label: "Dragon" },
  { key: "monkey", emoji: "\u{1F435}", label: "Monkey" },
  { key: "octopus", emoji: "\u{1F419}", label: "Octopus" },
  { key: "robot", emoji: "\u{1F916}", label: "Robot" },
  { key: "alien", emoji: "\u{1F47D}", label: "Alien" },
  { key: "ghost", emoji: "\u{1F47B}", label: "Ghost" },
  { key: "bee", emoji: "\u{1F41D}", label: "Bee" },
  { key: "turtle", emoji: "\u{1F422}", label: "Turtle" },
  { key: "rocket", emoji: "\u{1F680}", label: "Rocket" },
  { key: "star", emoji: "⭐", label: "Star" },
];

const byKey = new Map(AVATARS.map((a) => [a.key, a]));

export function avatarEmoji(key: string): string {
  return byKey.get(key)?.emoji ?? "\u{1F423}";
}

export function isValidAvatar(key: string): boolean {
  return byKey.has(key);
}
