import "./Avatar.scss";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps {
  initials: string;
  size?: AvatarSize;
}

const PALETTE = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-danger)",
  "var(--color-primary-strong)",
  "var(--color-slate-700)",
];

// Deterministički hash niska slova -> uvek ista boja za iste inicijale.
function pickBackground(initials: string): string {
  let hash = 0;
  for (let i = 0; i < initials.length; i += 1) {
    hash = (hash << 5) - hash + initials.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// Kružni avatar sa inicijalima na obojenoj pozadini.
export function Avatar({ initials, size = "md" }: AvatarProps) {
  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ backgroundColor: pickBackground(initials) }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );
}
