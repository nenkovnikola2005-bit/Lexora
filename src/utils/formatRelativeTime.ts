import { pluralizeSr } from "./pluralizeSr";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// Pretvara ISO datum u relativni opis na srpskom (npr. "pre 3 sata").
export function formatRelativeTime(isoDate: string): string {
  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000),
  );

  if (diffSeconds < MINUTE) return "upravo sada";

  if (diffSeconds < HOUR) {
    const minutes = Math.floor(diffSeconds / MINUTE);
    return `pre ${minutes} ${pluralizeSr(minutes, "minut", "minuta", "minuta")}`;
  }

  if (diffSeconds < DAY) {
    const hours = Math.floor(diffSeconds / HOUR);
    return `pre ${hours} ${pluralizeSr(hours, "sat", "sata", "sati")}`;
  }

  if (diffSeconds < WEEK) {
    const days = Math.floor(diffSeconds / DAY);
    return `pre ${days} ${pluralizeSr(days, "dan", "dana", "dana")}`;
  }

  const weeks = Math.floor(diffSeconds / WEEK);
  if (weeks < 5) {
    return `pre ${weeks} ${pluralizeSr(weeks, "nedelju", "nedelje", "nedelja")}`;
  }

  return new Date(isoDate).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
