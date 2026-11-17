import { Link } from "react-router-dom";

// logo-dark.png / logo-light.png are cropped from propertyavatar.jpeg with a transparent background
export default function Logo({ inverted = false, className = "h-12 sm:h-14" }) {
  return (
    <Link to="/" className="shrink-0" aria-label="Own Property home">
      <img
        src={inverted ? "/logo-light.png" : "/logo-dark.png"}
        alt="Own Property"
        className={`w-auto ${className}`}
      />
    </Link>
  );
}
