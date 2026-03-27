export default function ExcelIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Document */}
      <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* Grid lines */}
      <line x1="8" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="26" x2="40" y2="26" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="36" x2="40" y2="36" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24" y1="16" x2="24" y2="44" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
