/**
 * A short numeric PIN, like Kahoot/Zoom — the iPad's number pad pops up
 * automatically, there's no shift key or spelling to worry about, and
 * it's quick to read off a projector.
 */
export function generateJoinCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000)); // 5 digits
}
