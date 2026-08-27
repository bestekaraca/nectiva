export default function BoltIcon({ size = 28, id = "bolt" }) {
  const gradId = `nexivra-bolt-gradient-${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_0_8px_rgba(139,92,246,0.45)]"
    >
      <defs>
        <linearGradient id={gradId} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="55%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
        fill={`url(#${gradId})`}
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
