const ADJECTIVES = [
  "blue", "red", "gold", "green", "swift", "brave", "calm", "bright",
  "happy", "lucky", "cosmic", "clever", "sunny", "mighty", "cool", "wild",
];
const NOUNS = [
  "otter", "fox", "panda", "robot", "comet", "tiger", "owl", "whale",
  "dragon", "lion", "koala", "falcon", "shark", "bear", "wolf", "gecko",
];
const THINGS = [
  "lamp", "moon", "key", "star", "bolt", "leaf", "drum", "cube",
  "map", "kite", "wave", "flame", "pixel", "prism", "gear", "spark",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** e.g. "blue-otter-lamp-7" — easy to read off a screen and type on an iPad. */
export function generateJoinCode(): string {
  const n = Math.floor(Math.random() * 90) + 10;
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${pick(THINGS)}-${n}`;
}
