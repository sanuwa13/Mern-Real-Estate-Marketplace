// The 25 administrative districts of Sri Lanka (kept in step with api/utils/districts.js)
export const DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

// "Dehiwala, Colombo" — falls back to the street address for ads without a location yet
export const formatLocation = (listing) => {
  const parts = [listing?.city, listing?.district].filter(Boolean);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) return parts[0];
  return parts.length ? parts.join(", ") : listing?.address || "";
};

export const fetchLocations = async () => {
  const res = await fetch("/api/listing/locations");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};
