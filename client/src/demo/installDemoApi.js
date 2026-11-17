// Demo mode for hosting the frontend without a backend (e.g. a Vercel preview).
// Only loaded when VITE_DEMO_SNAPSHOT=true (see main.jsx); local development never uses it.
// Property requests are answered from a frozen snapshot of the listings, following the same
// rules as api/controllers/listing.controller.js. Everything else (sign-in, saving) is refused.
import snapshot from "./listings.json";

const MAX_LIMIT = 50;
const SORT_FIELDS = ["createdAt", "regularPrice"];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getListings = (params) => {
  const limit = Math.min(parseInt(params.get("limit")) || 9, MAX_LIMIT);
  const startIndex = Math.max(parseInt(params.get("startIndex")) || 0, 0);
  const search = new RegExp(escapeRegex(params.get("searchTerm") || ""), "i");
  const type = params.get("type");
  const sort = SORT_FIELDS.includes(params.get("sort")) ? params.get("sort") : "createdAt";
  const direction = params.get("order") === "asc" ? 1 : -1;

  return snapshot
    .filter(
      (l) =>
        search.test(l.name) &&
        (!["rent", "sale"].includes(type) || l.type === type) &&
        ["offer", "parking", "furnished"].every((f) => params.get(f) !== "true" || l[f]),
    )
    .sort((a, b) => {
      const x = sort === "createdAt" ? Date.parse(a.createdAt) : a[sort];
      const y = sort === "createdAt" ? Date.parse(b.createdAt) : b[sort];
      return (x - y) * direction;
    })
    .slice(startIndex, startIndex + limit)
    // like the real backend, search results leave out the phone number
    .map((listing) => {
      const copy = { ...listing };
      delete copy.phone;
      return copy;
    });
};

const handle = (url, method) => {
  const path = url.pathname;
  if (method === "GET" && path === "/api/listing/get") return json(getListings(url.searchParams));
  if (method === "GET" && path.startsWith("/api/listing/get/")) {
    const listing = snapshot.find((l) => l._id === path.split("/").pop());
    return listing
      ? json(listing)
      : json({ success: false, statusCode: 404, message: "Listing not found!" }, 404);
  }
  if (method === "GET" && path === "/api/listing/stats") {
    return json({
      total: snapshot.length,
      sale: snapshot.filter((l) => l.type === "sale").length,
      rent: snapshot.filter((l) => l.type === "rent").length,
      offers: snapshot.filter((l) => l.offer).length,
    });
  }
  return json(
    { success: false, statusCode: 503, message: "This is a preview. Signing in and saving are turned off." },
    503,
  );
};

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url, window.location.origin);
  if (url.origin === window.location.origin && url.pathname.startsWith("/api/")) {
    return handle(url, (init.method || "GET").toUpperCase());
  }
  return realFetch(input, init);
};

console.info(`Demo mode: showing a snapshot of ${snapshot.length} listings.`);
