import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "./Logo";

const EXPLORE_LINKS = [
  { label: "All properties", to: "/search" },
  { label: "For sale", to: "/search?type=sale" },
  { label: "For rent", to: "/search?type=rent" },
  { label: "Special offers", to: "/search?offer=true" },
  { label: "With parking", to: "/search?parking=true" },
];

export default function Footer() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <footer className="bg-ink text-white">
      <div className="page grid grid-cols-1 gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo inverted className="h-16 sm:h-20" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-400">
            Houses, apartments and land across Sri Lanka, presented honestly
            and sold with care.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow text-neutral-500">Explore</p>
          <ul className="mt-5 space-y-3 text-sm">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-neutral-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/about" className="text-neutral-300 transition-colors hover:text-white">
                About us
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow text-neutral-500">Contact</p>
          <address className="mt-5 space-y-3 text-sm not-italic text-neutral-300">
            <p>123 Main Street, Colombo, Sri Lanka</p>
            <p>
              <a href="tel:+94771234567" className="transition-colors hover:text-white">
                +94 77 123 4567
              </a>
            </p>
            <p>
              <a href="mailto:support@ownproperty.com" className="transition-colors hover:text-white">
                support@ownproperty.com
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="page flex flex-col gap-3 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Own Property. All rights reserved.</p>
          {/* only the owner can sign in, so this stays small and out of the way */}
          <div className="flex gap-6">
            {currentUser && (
              <Link to="/create-listing" className="inline-block py-2 transition-colors hover:text-white">
                List a property
              </Link>
            )}
            <Link
              to={currentUser ? "/profile" : "/sign-in"}
              className="inline-block py-2 transition-colors hover:text-white"
            >
              {currentUser ? "Owner dashboard" : "Owner login"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
