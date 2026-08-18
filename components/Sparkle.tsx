export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0c.7 4.9 2.1 8.2 4.4 10.1 2.3 1.9 5.4 2.9 9.6 2.9-4.2 0-7.3 1-9.6 2.9-2.3 1.9-3.7 5.2-4.4 10.1-.7-4.9-2.1-8.2-4.4-10.1C5.3 13.9 2.2 12.9-2 12.9c4.2 0 7.3-1 9.6-2.9C9.9 8.2 11.3 4.9 12 0z" />
    </svg>
  );
}
