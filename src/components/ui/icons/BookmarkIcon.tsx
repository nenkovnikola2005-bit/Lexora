// Ikonica čuvanja objave — preuzeta iz Figma dizajna. Popunjena varijanta za sačuvano stanje.
export function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M11.875 13.4375L7.5 10.3125L3.125 13.4375V3.125C3.125 2.79348 3.2567 2.47554 3.49112 2.24112C3.72554 2.0067 4.04348 1.875 4.375 1.875H10.625C10.9565 1.875 11.2745 2.0067 11.5089 2.24112C11.7433 2.47554 11.875 2.79348 11.875 3.125V13.4375Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
