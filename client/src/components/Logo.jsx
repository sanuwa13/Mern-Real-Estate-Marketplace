import { Link } from "react-router-dom";

export default function Logo({ inverted = false }) {
  const tone = inverted ? "text-white" : "text-ink";
  return (
    <Link to="/" className={`flex items-center gap-3 ${tone}`} aria-label="Own Property home">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" fill="currentColor" />
        <path
          d="M8 23V14l8-6 8 6v9M14 23v-5h4v5"
          fill="none"
          stroke={inverted ? "#0a0a0a" : "#fff"}
          strokeWidth="2"
        />
      </svg>
      <span className="font-serif text-2xl leading-none tracking-tight">Own Property</span>
    </Link>
  );
}
