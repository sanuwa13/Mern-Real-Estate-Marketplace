import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import ListingItem from "../components/ListingItem";
import ListingGridSkeleton from "../components/ListingGridSkeleton";

const fetchListings = async (query) => {
  const res = await fetch(`/api/listing/get?${query}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

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

function ListingSection({ eyebrow, title, to, listings, loading }) {
  if (!loading && listings.length === 0) return null;

  return (
    <section className="page">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="heading mt-3 text-4xl sm:text-5xl">{title}</h2>
        </div>
        <Link to={to} className="btn-link">
          View all <FiArrowRight />
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <ListingGridSkeleton count={4} />
        ) : (
          listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} />
          ))
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ searchTerm: "", type: "all" });

  useEffect(() => {
    Promise.all([
      fetchListings("offer=true&limit=4"),
      fetchListings("type=rent&limit=4"),
      fetchListings("type=sale&limit=4"),
    ])
      .then(([offers, rent, sale]) => {
        setOfferListings(offers);
        setRentListings(rent);
        setSaleListings(sale);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const heroListing = offerListings[0] || saleListings[0] || rentListings[0];
  const heroImage = heroListing?.imageUrls?.[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      searchTerm: search.searchTerm,
      type: search.type,
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero: the newest featured property, in black and white */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50 grayscale"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />

        <div className="page flex min-h-[min(80vh,760px)] flex-col justify-end pb-16 pt-32 sm:pb-20">
          <p className="eyebrow text-neutral-300">
            Real estate across Sri Lanka
          </p>
          <h1 className="heading mt-5 max-w-4xl text-5xl text-white sm:text-7xl lg:text-8xl">
            Find a place worth <em>calling home.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300">
            Houses, apartments and land, carefully listed with clear prices and
            direct contact with the owner.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-10 grid grid-cols-1 max-w-3xl gap-px bg-neutral-700 sm:grid-cols-[1fr_auto_auto]"
          >
            <input
              type="text"
              placeholder="Search by property name"
              aria-label="Search by property name"
              className="h-14 border-0 bg-white px-5 text-sm text-ink placeholder:text-neutral-400 focus:outline-none"
              value={search.searchTerm}
              onChange={(e) =>
                setSearch({ ...search, searchTerm: e.target.value })
              }
            />
            <select
              aria-label="Listing type"
              className="h-14 border-0 bg-white px-5 text-sm text-ink focus:outline-none"
              value={search.type}
              onChange={(e) => setSearch({ ...search, type: e.target.value })}
            >
              <option value="all">Buy or rent</option>
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <button className="btn h-14 bg-white text-ink hover:bg-neutral-200 sm:border-l sm:border-neutral-200">
              Search
            </button>
          </form>

          {heroListing && (
            <Link
              to={`/listing/${heroListing._id}`}
              className="mt-10 inline-flex w-fit items-center gap-2 text-xs uppercase tracking-label text-neutral-300 hover:text-white"
            >
              Featured: {heroListing.name} <FiArrowUpRight />
            </Link>
          )}
        </div>
      </section>

      {/* Ways to browse */}
      <section className="border-b border-neutral-200">
        <div className="page grid grid-cols-1 divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {CATEGORIES.map((category) => (
            <Link
              key={category.label}
              to={category.to}
              className="group flex items-start justify-between gap-6 py-10 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <div>
                <h2 className="heading text-3xl">{category.label}</h2>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
                  {category.text}
                </p>
              </div>
              <FiArrowUpRight className="mt-2 shrink-0 text-xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-20 py-16 sm:space-y-24 sm:py-20">
        <ListingSection
          eyebrow="Reduced prices"
          title="Current offers"
          to="/search?offer=true"
          listings={offerListings}
          loading={loading}
        />
        <ListingSection
          eyebrow="Monthly terms"
          title="Recently listed for rent"
          to="/search?type=rent"
          listings={rentListings}
          loading={loading}
        />
        <ListingSection
          eyebrow="To own"
          title="Recently listed for sale"
          to="/search?type=sale"
          listings={saleListings}
          loading={loading}
        />
      </div>

      {/* Closing call to action */}
      <section className="bg-neutral-100">
        <div className="page grid grid-cols-1 gap-10 py-20 md:grid-cols-2 md:items-end">
          <div>
            <p className="eyebrow">Selling or renting out?</p>
            <h2 className="heading mt-4 text-4xl sm:text-5xl">
              Let us present your property the way it deserves.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a href="tel:+94771234567" className="btn-primary">
              Call +94 77 123 4567
            </a>
            <Link to="/about" className="btn-secondary">
              About us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
