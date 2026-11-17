import { Link } from "react-router-dom";
import { formatPrice, plural } from "../utils/format";

const FALLBACK_IMAGE =
  "https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.png";

export default function ListingItem({ listing }) {
  const coverImage = listing?.imageUrls?.[0] || listing?.imagesUrls?.[0] || FALLBACK_IMAGE;
  const price = listing.offer
    ? Number(listing?.discountPrice ?? listing?.discountedPrice ?? 0)
    : Number(listing?.regularPrice || 0);

  return (
    <Link to={`/listing/${listing._id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={coverImage}
          alt={listing.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-label text-ink">
            {listing.type === "rent" ? "For rent" : "For sale"}
          </span>
          {listing.offer && (
            <span className="bg-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-label text-white">
              Offer
            </span>
          )}
        </div>
      </div>

      <div className="pt-4">
        <p className="text-lg font-medium tracking-tight">
          {formatPrice(price)}
          {listing.type === "rent" && (
            <span className="text-sm font-normal text-neutral-500"> / month</span>
          )}
        </p>
        <h3 className="mt-1 truncate text-sm text-ink group-hover:underline group-hover:underline-offset-4">
          {listing.name}
        </h3>
        <p className="mt-1 truncate text-sm text-neutral-500">{listing.address}</p>
        <p className="mt-3 border-t border-neutral-200 pt-3 text-xs uppercase tracking-label text-neutral-600">
          {plural(listing.bedrooms, "bed")}
          <span className="mx-2 text-neutral-300">/</span>
          {plural(listing.bathrooms, "bath")}
        </p>
      </div>
    </Link>
  );
}
