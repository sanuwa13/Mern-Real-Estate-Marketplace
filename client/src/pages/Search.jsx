import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import ListingGridSkeleton from "../components/ListingGridSkeleton";

const PAGE_SIZE = 9;

const TYPE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "sale", label: "Buy" },
  { id: "rent", label: "Rent" },
];

const FEATURE_OPTIONS = [
  { id: "offer", label: "Special offer" },
  { id: "parking", label: "Parking" },
  { id: "furnished", label: "Furnished" },
];

const filtersFromUrl = (search) => {
  const urlParams = new URLSearchParams(search);
  return {
    searchTerm: urlParams.get("searchTerm") || "",
    type: urlParams.get("type") || "all",
    parking: urlParams.get("parking") === "true",
    furnished: urlParams.get("furnished") === "true",
    offer: urlParams.get("offer") === "true",
    sort: urlParams.get("sort") || "createdAt",
    order: urlParams.get("order") || "desc",
  };
};

const pageTitle = ({ type, offer }) => {
  if (offer) return "Special offers";
  if (type === "sale") return "Properties for sale";
  if (type === "rent") return "Properties for rent";
  return "All properties";
};

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebardata, setSidebardata] = useState(() => filtersFromUrl(location.search));
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  // keep the filter panel in step with the address bar (header search, back button, links)
  const [lastSearch, setLastSearch] = useState(location.search);
  if (location.search !== lastSearch) {
    setLastSearch(location.search);
    setSidebardata(filtersFromUrl(location.search));
  }

  useEffect(() => {
    let cancelled = false;
    const fetchListings = async () => {
      setLoading(true);
      const res = await fetch(`/api/listing/get?${new URLSearchParams(location.search)}`);
      const data = await res.json();
      if (cancelled) return;
      setListings(Array.isArray(data) ? data : []);
      setShowMore(Array.isArray(data) && data.length >= PAGE_SIZE);
      setLoading(false);
    };
    fetchListings();
    return () => {
      cancelled = true;
    };
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.name === "type") {
      setSidebardata({ ...sidebardata, type: e.target.value });
    }

    if (e.target.id === "searchTerm") {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (e.target.id === "parking" || e.target.id === "furnished" || e.target.id === "offer") {
      setSidebardata({ ...sidebardata, [e.target.id]: e.target.checked });
    }

    if (e.target.id === "sort_order") {
      const [sort, order] = e.target.value.split("_");
      setSidebardata({
        ...sidebardata,
        sort: sort || "createdAt",
        order: order || "desc",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sidebardata.searchTerm);
    urlParams.set("type", sidebardata.type);
    urlParams.set("parking", sidebardata.parking);
    urlParams.set("furnished", sidebardata.furnished);
    urlParams.set("offer", sidebardata.offer);
    urlParams.set("sort", sidebardata.sort);
    urlParams.set("order", sidebardata.order);
    navigate(`/search?${urlParams.toString()}`);
  };

  const onShowMoreClick = async () => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", listings.length);
    const res = await fetch(`/api/listing/get?${urlParams.toString()}`);
    const data = await res.json();
    setShowMore(data.length >= PAGE_SIZE);
    setListings((prevListings) => [...prevListings, ...data]);
  };

  return (
    <div>
      <section className="border-b border-neutral-200">
        <div className="page py-12 sm:py-16">
          <p className="eyebrow">Search</p>
          <h1 className="heading mt-3 text-4xl sm:text-5xl">{pageTitle(filtersFromUrl(location.search))}</h1>
        </div>
      </section>

      <div className="page grid grid-cols-1 gap-12 py-12 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 lg:sticky lg:top-28">
            <div>
              <label htmlFor="searchTerm" className="label">
                Keyword
              </label>
              <input
                type="text"
                id="searchTerm"
                placeholder="e.g. villa, Kandy"
                className="input"
                value={sidebardata.searchTerm}
                onChange={handleChange}
              />
            </div>

            <fieldset>
              <legend className="label">Listing type</legend>
              <div className="grid grid-cols-3 border border-neutral-300">
                {TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`cursor-pointer py-3 text-center text-xs uppercase tracking-label transition-colors ${
                      sidebardata.type === option.id ? "bg-ink text-white" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={option.id}
                      className="sr-only"
                      checked={sidebardata.type === option.id}
                      onChange={handleChange}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">Features</legend>
              <div className="flex flex-col gap-3">
                {FEATURE_OPTIONS.map((option) => (
                  <label key={option.id} className="flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      id={option.id}
                      className="checkbox"
                      checked={sidebardata[option.id]}
                      onChange={handleChange}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="sort_order" className="label">
                Sort by
              </label>
              <select
                id="sort_order"
                className="input"
                value={`${sidebardata.sort}_${sidebardata.order}`}
                onChange={handleChange}
              >
                <option value="createdAt_desc">Newest first</option>
                <option value="createdAt_asc">Oldest first</option>
                <option value="regularPrice_desc">Price: high to low</option>
                <option value="regularPrice_asc">Price: low to high</option>
              </select>
            </div>

            <button className="btn-primary w-full">Apply filters</button>
          </form>
        </aside>

        <section aria-live="polite">
          <p className="border-b border-neutral-200 pb-4 text-sm text-neutral-500">
            {loading
              ? "Loading properties…"
              : `${listings.length}${showMore ? "+" : ""} ${listings.length === 1 ? "property" : "properties"}`}
          </p>

          {!loading && listings.length === 0 && (
            <div className="py-24 text-center">
              <h2 className="heading text-2xl">No properties match these filters.</h2>
              <p className="mt-3 text-sm text-neutral-500">
                Try removing a filter or searching for a different keyword.
              </p>
              <Link to="/search" className="btn-secondary mt-8">
                Clear filters
              </Link>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <ListingGridSkeleton count={6} />
            ) : (
              listings.map((listing) => <ListingItem key={listing._id} listing={listing} />)
            )}
          </div>

          {showMore && !loading && (
            <div className="mt-16 flex justify-center">
              <button onClick={onShowMoreClick} className="btn-secondary">
                Load more properties
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
