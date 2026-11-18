import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css/bundle";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import ListingItem from "../components/ListingItem";
import ListingGridSkeleton from "../components/ListingGridSkeleton";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import { DISTRICTS } from "../utils/districts";

const SLIDE_MS = 7000;

const fetchJson = async (url) => {
  const res = await fetch(url);
  return res.json();
};
const fetchListings = async (query) => {
  const data = await fetchJson(`/api/listing/get?${query}`);
  return Array.isArray(data) ? data : [];
};

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const CATEGORIES = [
  {
    label: "Buy",
    text: "Homes, apartments and land available to own outright.",
    to: "/search?type=sale",
  },
  {
    label: "Rent",
    text: "Furnished and unfurnished places on monthly terms.",
    to: "/search?type=rent",
  },
  {
    label: "Offers",
    text: "Properties currently listed below their regular price.",
    to: "/search?offer=true",
  },
];

const MARQUEE_WORDS = ["Houses", "Apartments", "Land", "Buy", "Sell", "Rent", "Invest"];

const TABS = [
  { id: "offers", label: "Offers", to: "/search?offer=true" },
  { id: "rent", label: "For rent", to: "/search?type=rent" },
  { id: "sale", label: "For sale", to: "/search?type=sale" },
];

/* Hero: cross-fades between featured property photos with a slow zoom */
function Hero({ slides }) {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState({ searchTerm: "", type: "all", district: "" });

  useEffect(() => {
    if (slides.length < 2 || prefersReducedMotion()) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ searchTerm: search.searchTerm, type: search.type });
    if (search.district) params.set("district", search.district);
    navigate(`/search?${params.toString()}`);
  };

  const current = slides[active];

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {slides.map((slide, index) => (
        <img
          key={slide.image}
          src={slide.image}
          alt=""
          className={`absolute inset-0 -z-10 h-full w-full object-cover grayscale transition-opacity duration-[1500ms] ${
            index === active ? "hero-zoom opacity-50" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />

      <div className="page flex min-h-[min(92vh,820px)] flex-col justify-end pb-14 pt-36 sm:pb-16">
        <p className="eyebrow animate-rise text-neutral-300">Real estate across Sri Lanka</p>
        <h1
          className="heading animate-rise mt-5 max-w-4xl text-4xl text-white sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "120ms" }}
        >
          Find a place worth <span className="text-neutral-300">calling home.</span>
        </h1>
        <p
          className="animate-rise mt-6 max-w-xl text-base leading-relaxed text-neutral-300"
          style={{ animationDelay: "260ms" }}
        >
          Houses, apartments and land, carefully listed with clear prices and
          direct contact with the owner.
        </p>

        <form
          onSubmit={handleSearch}
          className="animate-rise mt-10 grid max-w-4xl grid-cols-1 gap-px bg-neutral-700 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]"
          style={{ animationDelay: "400ms" }}
        >
          <input
            type="text"
            placeholder="Search by property name"
            aria-label="Search by property name"
            className="h-14 border-0 bg-white px-5 text-base text-ink lg:text-sm placeholder:text-neutral-400 focus:outline-none"
            value={search.searchTerm}
            onChange={(e) => setSearch({ ...search, searchTerm: e.target.value })}
          />
          <select
            aria-label="Listing type"
            className="h-14 border-0 bg-white px-5 text-base text-ink lg:text-sm focus:outline-none"
            value={search.type}
            onChange={(e) => setSearch({ ...search, type: e.target.value })}
          >
            <option value="all">Buy or rent</option>
            <option value="sale">Buy</option>
            <option value="rent">Rent</option>
          </select>
          <select
            aria-label="District"
            className="h-14 border-0 bg-white px-5 text-base text-ink lg:text-sm focus:outline-none"
            value={search.district}
            onChange={(e) => setSearch({ ...search, district: e.target.value })}
          >
            <option value="">All of Sri Lanka</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <button className="btn h-14 bg-white text-ink hover:bg-neutral-200 lg:border-l lg:border-neutral-200">
            Search
          </button>
        </form>

        {/* the featured property for the photo on screen, with a progress bar per slide */}
        {current && (
          <div
            className="animate-rise mt-12 flex flex-col gap-4 border-t border-white/20 pt-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ animationDelay: "540ms" }}
          >
            <Link
              key={current.id}
              to={`/listing/${current.id}`}
              className="animate-rise -my-3 inline-flex w-fit items-center gap-2 py-3 text-xs uppercase tracking-label text-neutral-300 hover:text-white"
            >
              Featured: {current.name} <FiArrowUpRight />
            </Link>
            {slides.length > 1 && (
              <div className="flex gap-2" role="tablist" aria-label="Featured properties">
                {slides.map((slide, index) => (
                  <button
                    key={slide.image}
                    type="button"
                    role="tab"
                    aria-selected={index === active}
                    aria-label={`Show ${slide.name}`}
                    onClick={() => setActive(index)}
                    className="flex h-10 w-10 items-center"
                  >
                    <span className="block h-px w-full overflow-hidden bg-white/30">
                      {index === active && (
                        <span
                          key={active}
                          className="animate-grow block h-full w-full bg-white"
                          style={{ animationDuration: `${SLIDE_MS}ms` }}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* Endless band of large words, alternating solid and outline */
function Marquee() {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <section className="marquee overflow-hidden border-b border-neutral-200 py-6 sm:py-8" aria-hidden="true">
      <div className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((word, index) => (
              <span key={`${copy}-${index}`} className="flex items-center">
                <span
                  className={`font-display text-4xl font-semibold uppercase tracking-tight sm:text-6xl ${
                    index % 2 ? "text-outline" : "text-ink"
                  }`}
                >
                  {word}
                </span>
                <span className="mx-6 h-2 w-2 bg-ink sm:mx-10" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* Live counts from the database */
function Stats({ stats }) {
  const figures = [
    { label: "Properties listed", value: stats?.total },
    { label: "For sale", value: stats?.sale },
    { label: "For rent", value: stats?.rent },
    { label: "On special offer", value: stats?.offers },
  ];

  return (
    <section className="bg-ink text-white">
      <div className="page grid grid-cols-1 gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-end">
        <Reveal>
          <p className="eyebrow text-neutral-500">At a glance</p>
          <h2 className="heading mt-4 text-3xl text-white sm:text-4xl">
            Live from our listings.
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-px bg-neutral-800 sm:grid-cols-4">
          {figures.map((figure, index) => (
            <Reveal key={figure.label} delay={index * 120} className="bg-ink py-6 pr-4 sm:px-6">
              <p className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
                {figure.value === undefined ? "–" : <CountUp value={figure.value} />}
              </p>
              <p className="mt-3 text-xs uppercase tracking-label text-neutral-400">{figure.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Tabbed carousel: offers / rent / sale */
function ListingCarousel({ listingsByTab, loading }) {
  const [tab, setTab] = useState("offers");
  const activeTab = TABS.find((t) => t.id === tab);
  const listings = listingsByTab[tab] || [];

  return (
    <section className="page py-20 sm:py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-neutral-200">
        <div>
          <p className="eyebrow">Explore</p>
          <h2 className="heading mt-3 text-3xl sm:text-4xl">Latest properties</h2>
          <div className="mt-8 flex gap-8" role="tablist" aria-label="Property type">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`relative pb-4 text-sm transition-colors ${
                  tab === t.id ? "text-ink" : "text-neutral-400 hover:text-ink"
                }`}
              >
                {t.label}
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ink transition-transform duration-300 ${
                    tab === t.id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            className="listings-prev flex h-11 w-11 items-center justify-center border border-neutral-300 transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
            aria-label="Previous properties"
          >
            <FiArrowLeft />
          </button>
          <button
            type="button"
            className="listings-next flex h-11 w-11 items-center justify-center border border-neutral-300 transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-30"
            aria-label="Next properties"
          >
            <FiArrowRight />
          </button>
        </div>
      </Reveal>

      <div className="mt-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ListingGridSkeleton count={4} />
          </div>
        ) : listings.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">No properties here yet.</p>
        ) : (
          // re-mounting on tab change replays the fade-in
          <div key={tab} className="animate-rise" style={{ animationDuration: "0.6s" }}>
            <Swiper
              modules={[Navigation]}
              navigation={{ prevEl: ".listings-prev", nextEl: ".listings-next" }}
              spaceBetween={24}
              slidesPerView={1.15}
              breakpoints={{
                640: { slidesPerView: 2.2 },
                1024: { slidesPerView: 3.2 },
                1280: { slidesPerView: 4 },
              }}
              grabCursor
            >
              {listings.map((listing) => (
                <SwiperSlide key={listing._id}>
                  <ListingItem listing={listing} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <Link to={activeTab.to} className="btn-secondary">
          View all {activeTab.label.toLowerCase()} <FiArrowRight />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const [listingsByTab, setListingsByTab] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchListings("offer=true&limit=8"),
      fetchListings("type=rent&limit=8"),
      fetchListings("type=sale&limit=8"),
    ])
      .then(([offers, rent, sale]) => setListingsByTab({ offers, rent, sale }))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));

    fetchJson("/api/listing/stats")
      .then((data) => data.success !== false && setStats(data))
      .catch((error) => console.error(error));
  }, []);

  // up to four different cover photos for the hero, newest offers first
  const slides = [];
  for (const listing of [
    ...(listingsByTab.offers || []),
    ...(listingsByTab.sale || []),
    ...(listingsByTab.rent || []),
  ]) {
    const image = listing.imageUrls?.[0];
    if (image && !slides.some((s) => s.image === image)) {
      slides.push({ id: listing._id, name: listing.name, image });
    }
    if (slides.length === 4) break;
  }

  return (
    <div>
      <Hero slides={slides} />
      <Marquee />

      {/* Ways to browse */}
      <section className="border-b border-neutral-200">
        <div className="page grid grid-cols-1 divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {CATEGORIES.map((category, index) => (
            <Reveal
              key={category.label}
              delay={index * 120}
              className="md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <Link
                to={category.to}
                className="group flex items-start justify-between gap-6 py-10"
              >
                <div>
                  <h2 className="heading text-2xl">{category.label}</h2>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
                    {category.text}
                  </p>
                </div>
                <FiArrowUpRight className="mt-2 shrink-0 text-xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <ListingCarousel listingsByTab={listingsByTab} loading={loading} />

      <Stats stats={stats} />

      {/* Closing call to action */}
      <section className="bg-neutral-100">
        <div className="page grid grid-cols-1 gap-10 py-20 md:grid-cols-2 md:items-end">
          <Reveal>
            <p className="eyebrow">Selling or renting out?</p>
            <h2 className="heading mt-4 text-3xl sm:text-4xl">
              Let us present your property the way it deserves.
            </h2>
          </Reveal>
          <Reveal delay={150} className="flex flex-wrap gap-3 md:justify-end">
            <a href="tel:+94768574917" className="btn-primary">
              Call 076 857 4917
            </a>
            <Link to="/about" className="btn-secondary">
              About us
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
