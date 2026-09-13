// Ikonica "sviđa mi se" — preuzeta iz Figma dizajna. Popunjena varijanta za aktivno stanje.
export function LikeIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path
        d="M4.95833 15.5833V7.4375L8.5 1.41667C8.74049 1.26529 9.02094 1.18973 9.30492 1.1998C9.58891 1.20988 9.8633 1.30513 10.0925 1.47317C10.3216 1.64122 10.4949 1.87429 10.5899 2.14211C10.6849 2.40994 10.6971 2.70013 10.625 2.975L9.91667 6.375H13.6C13.8125 6.3707 14.0232 6.41425 14.2165 6.50244C14.4099 6.59063 14.5809 6.72119 14.717 6.88445C14.853 7.04771 14.9506 7.23949 15.0025 7.44558C15.0544 7.65166 15.0592 7.86678 15.0167 8.075L13.8833 13.8833C13.9259 14.0915 13.921 14.3067 13.8692 14.5128C13.8173 14.7188 13.7197 14.9106 13.5837 15.0739C13.4476 15.2371 13.2766 15.3677 13.0832 15.4559C12.8899 15.5441 12.6791 15.5876 12.4667 15.5833H4.95833Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.95833 7.4375H2.125V15.5833H4.95833"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
