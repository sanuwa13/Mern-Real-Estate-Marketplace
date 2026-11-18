import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { fetchLocations } from "../utils/districts";

// one line in the location list: name, optional tick, count and arrow
function Row({ selected, onClick, children, count, chevron }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-100 ${
          selected ? "font-medium text-ink" : "text-neutral-700"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected && <FiCheck className="shrink-0" />}
          <span className="truncate">{children}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-neutral-400">
          {count !== undefined && count}
          {chevron && <FiChevronRight />}
        </span>
      </button>
    </li>
  );
}

// ikman-style location picker: all of Sri Lanka -> district -> town, with ad counts at each level.
// Choosing applies straight away through onSelect(district, city).
export default function LocationFilter({ district, city, onSelect }) {
  const [open, setOpen] = useState(false);
  const [browsing, setBrowsing] = useState(district || null);
  const [locations, setLocations] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch(() => setLocations([]));
  }, []);

  // close when clicking elsewhere or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) =>
      !wrapperRef.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (nextDistrict, nextCity = "") => {
    onSelect(nextDistrict, nextCity);
    setOpen(false);
  };

  const toggle = () => {
    setBrowsing(district || null);
    setOpen((value) => !value);
  };

  const current = (locations || []).find((l) => l.district === browsing);
  const label = city ? `${city}, ${district}` : district || "All of Sri Lanka";

  return (
    <div ref={wrapperRef} className="relative">
      <p className="label" id="location-label">
        Location
      </p>
      <div className="flex">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-labelledby="location-label"
          className={`input flex min-w-0 flex-1 items-center gap-3 text-left ${open ? "border-ink" : ""}`}
        >
          <FiMapPin className="shrink-0 text-neutral-500" />
          <span className="flex-1 truncate">{label}</span>
          <FiChevronDown
            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {district && (
          <button
            type="button"
            onClick={() => choose("", "")}
            className="flex w-12 shrink-0 items-center justify-center border border-l-0 border-neutral-300 hover:bg-neutral-100"
            aria-label="Clear location"
          >
            <FiX />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 border border-ink bg-white shadow-xl">
          {locations === null ? (
            <p className="px-4 py-6 text-sm text-neutral-500">
              Loading locations…
            </p>
          ) : !current ? (
            <>
              <p className="eyebrow border-b border-neutral-200 px-4 py-3">
                Choose a district
              </p>
              <ul className="max-h-80 overflow-y-auto">
                <Row
                  selected={!district}
                  onClick={() => choose("", "")}
                >
                  All of Sri Lanka
                </Row>
                {locations.map((l) => (
                  <Row
                    key={l.district}
                    selected={district === l.district}
                    onClick={() => setBrowsing(l.district)}
                    count={l.count}
                    chevron
                  >
                    {l.district}
                  </Row>
                ))}
                {locations.length === 0 && (
                  <li className="px-4 py-4 text-sm text-neutral-500">
                    No locations listed yet.
                  </li>
                )}
              </ul>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setBrowsing(null)}
                className="flex w-full items-center gap-2 border-b border-neutral-200 px-4 py-3 text-xs font-medium uppercase tracking-label text-neutral-600 hover:bg-neutral-100"
              >
                <FiArrowLeft /> All districts
              </button>
              <ul className="max-h-80 overflow-y-auto">
                <Row
                  selected={district === current.district && !city}
                  onClick={() => choose(current.district, "")}
                  count={current.count}
                >
                  All of {current.district}
                </Row>
                {current.cities.map((c) => (
                  <Row
                    key={c.city}
                    selected={
                      district === current.district &&
                      city.toLowerCase() === c.city.toLowerCase()
                    }
                    onClick={() => choose(current.district, c.city)}
                    count={c.count}
                  >
                    {c.city}
                  </Row>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
