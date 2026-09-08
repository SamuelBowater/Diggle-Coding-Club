import { avatarEmoji } from "@/lib/avatars";
import { cosmeticEmoji } from "@/lib/cosmetics";

export function Avatar({
  avatarKey,
  cosmetic,
  size = 32,
}: {
  avatarKey: string;
  cosmetic?: string | null;
  size?: number;
}) {
  const acc = cosmeticEmoji(cosmetic);
  return (
    <span
      className="relative inline-block leading-none"
      style={{ fontSize: size, width: size, height: size }}
      aria-hidden
    >
      <span>{avatarEmoji(avatarKey)}</span>
      {acc && (
        <span
          className="absolute -right-1 -top-1 leading-none"
          style={{ fontSize: size * 0.55 }}
        >
          {acc}
        </span>
      )}
    </span>
  );
}
