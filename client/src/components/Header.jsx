import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import Logo from "./Logo";

const NAV_LINKS = [
  { label: "Buy", to: "/search?type=sale" },
  { label: "Rent", to: "/search?type=rent" },
  { label: "Offers", to: "/search?offer=true" },
  { label: "About", to: "/about" },
];

const DEFAULT_AVATAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcPVY5FK0TbQhg_WSDUKRuOEWDHwfvaHFCjA&s";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const searchFromUrl = () => new URLSearchParams(location.search).get("searchTerm") || "";
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [menuOpen, setMenuOpen] = useState(false);

  // on every navigation: show the current search in the box and close the mobile menu
  const routeKey = location.pathname + location.search;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  if (routeKey !== lastRouteKey) {
    setLastRouteKey(routeKey);
    setSearchTerm(searchFromUrl());
    setMenuOpen(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.pathname === "/search" ? location.search : "");
    urlParams.set("searchTerm", searchTerm);
    navigate(`/search?${urlParams.toString()}`);
  };

  // a nav link with a query string is active only when its filter is the one applied
  const isActive = (to) => {
    const [path, query] = to.split("?");
    if (location.pathname !== path) return false;
    if (!query) return true;
    const current = new URLSearchParams(location.search);
    return [...new URLSearchParams(query)].every(([key, value]) => current.get(key) === value);
  };

  const searchForm = (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        type="text"
        placeholder="Search by name"
        aria-label="Search properties"
        className="input h-11 pl-11"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="page flex h-20 items-center gap-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={`text-sm transition-colors hover:text-ink ${
                isActive(link.to) ? "text-ink underline underline-offset-[10px]" : "text-neutral-500"
              }`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden w-72 md:block">{searchForm}</div>

        {currentUser && (
          <Link
            to="/profile"
            className="hidden items-center gap-3 md:flex"
            title="Owner dashboard"
          >
            <img
              src={currentUser.avatar || DEFAULT_AVATAR}
              alt=""
              className="h-9 w-9 object-cover grayscale"
            />
          </Link>
        )}

        <button
          type="button"
          className="ml-auto flex h-11 w-11 items-center justify-center border border-neutral-300 md:ml-0 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-200 bg-white lg:hidden">
          <div className="page flex flex-col gap-6 py-6">
            <div className="md:hidden">{searchForm}</div>
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="border-b border-neutral-100 py-4 font-serif text-2xl"
                >
                  {link.label}
                </Link>
              ))}
              {currentUser && (
                <Link to="/profile" className="py-4 font-serif text-2xl">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
