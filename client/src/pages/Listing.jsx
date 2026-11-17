import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css/bundle";
import { FiArrowLeft, FiCheck, FiLink, FiMapPin, FiPhone } from "react-icons/fi";
import { formatPrice, listingPrices, plural } from "../utils/format";

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();

        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="animate-pulse" aria-label="Loading property">
        <div className="h-[48vh] bg-neutral-100 sm:h-[65vh]" />
        <div className="page py-12">
          <div className="h-12 w-2/3 bg-neutral-100" />
          <div className="mt-4 h-5 w-1/3 bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <section className="page py-32">
        <p className="eyebrow">Unavailable</p>
        <h1 className="heading mt-4 text-5xl">This property could not be found.</h1>
        <p className="mt-6 max-w-md text-neutral-600">
          It may have been sold, rented or removed by the owner.
        </p>
        <Link to="/search" className="btn-primary mt-10">
          Browse properties
        </Link>
      </section>
    );
  }

  const listingImages = listing.imageUrls || listing.imagesUrls || [];
  const { regular: regularPrice, discount: discountPrice, hasDiscount, price } = listingPrices(listing);

  const facts = [
    { label: "Bedrooms", value: listing.bedrooms },
    { label: "Bathrooms", value: listing.bathrooms },
    { label: "Parking", value: listing.parking ? "Yes" : "No" },
    { label: "Furnished", value: listing.furnished ? "Yes" : "No" },
  ];

  return (
    <article>
      {/* Photos */}
      <div className="bg-ink">
        {listingImages.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation
            keyboard
            pagination={{ type: "fraction" }}
            className="h-[48vh] sm:h-[65vh]"
          >
            {listingImages.map((url, index) => (
              <SwiperSlide key={url || index}>
                <img
                  src={url}
                  alt={`${listing.name}, photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="flex h-[40vh] items-center justify-center text-sm uppercase tracking-label text-neutral-500">
            No photos available
          </div>
        )}
      </div>

      <div className="page py-10 sm:py-14">
        <Link to="/search" className="btn-link text-neutral-500">
          <FiArrowLeft /> All properties
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="border border-ink px-3 py-1 text-[10px] font-medium uppercase tracking-label">
                {listing.type === "rent" ? "For rent" : "For sale"}
              </span>
              {listing.offer && (
                <span className="bg-ink px-3 py-1 text-[10px] font-medium uppercase tracking-label text-white">
                  Offer
                </span>
              )}
            </div>

            <h1 className="heading mt-6 text-4xl sm:text-6xl">{listing.name}</h1>
            <p className="mt-4 flex items-start gap-2 text-neutral-600">
              <FiMapPin className="mt-1 shrink-0" />
              {listing.address}
            </p>

            {/* hairline grid: the 1px gaps show the background colour as dividers */}
            <dl className="mt-10 grid grid-cols-2 gap-px border-y border-neutral-200 bg-neutral-200 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-white py-6 pr-4 sm:px-6 sm:first:pl-0">
                  <dt className="eyebrow">{fact.label}</dt>
                  <dd className="mt-2 font-serif text-3xl">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <section className="mt-12">
              <h2 className="eyebrow">About this property</h2>
              <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-relaxed text-neutral-700">
                {listing.description}
              </p>
            </section>
          </div>

          {/* Price and contact */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-neutral-200 p-6 sm:p-8">
              <p className="eyebrow">{listing.type === "rent" ? "Monthly rent" : "Asking price"}</p>
              <p className="mt-3 font-serif text-4xl leading-none">
                {formatPrice(price)}
                {listing.type === "rent" && (
                  <span className="font-sans text-base text-neutral-500"> / month</span>
                )}
              </p>
              {hasDiscount && (
                <p className="mt-3 text-sm text-neutral-500">
                  <span className="line-through">{formatPrice(regularPrice)}</span>
                  <span className="ml-2 text-ink">Save {formatPrice(regularPrice - discountPrice)}</span>
                </p>
              )}

              <p className="mt-6 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
                {plural(listing.bedrooms, "bedroom")} · {plural(listing.bathrooms, "bathroom")}
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {listing.phone &&
                  (showPhone ? (
                    <a href={`tel:${listing.phone}`} className="btn-primary w-full">
                      <FiPhone /> {listing.phone}
                    </a>
                  ) : (
                    <button onClick={() => setShowPhone(true)} className="btn-primary w-full">
                      <FiPhone /> Show phone number
                    </button>
                  ))}
                <button onClick={copyLink} className="btn-secondary w-full">
                  {copied ? (
                    <>
                      <FiCheck /> Link copied
                    </>
                  ) : (
                    <>
                      <FiLink /> Copy link
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
