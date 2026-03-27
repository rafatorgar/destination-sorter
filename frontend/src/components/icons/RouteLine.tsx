export default function RouteLine({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M0 20 C50 5, 80 35, 120 15 S170 30, 200 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
      />
    </svg>
  );
}
