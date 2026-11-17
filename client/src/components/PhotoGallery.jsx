import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css/bundle";
import { FiGrid, FiImage } from "react-icons/fi";
import PhotoLightbox from "./PhotoLightbox";

// Tile positions on the desktop grid (4 columns x 2 rows), by number of photos shown.
// The first photo is always the large cover image.
const LAYOUTS = {
  1: ["col-span-4 row-span-2"],
  2: ["col-span-2 row-span-2", "col-span-2 row-span-2"],
  3: ["col-span-2 row-span-2", "col-span-2", "col-span-2"],
  4: ["col-span-2 row-span-2", "col-span-2", "", ""],
  5: ["col-span-2 row-span-2", "", "", "", ""],
};
const MAX_TILES = 5;

function Photo({ src, alt, className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.visibility = "hidden";
      }}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export default function PhotoGallery({ images, title }) {
  const [openAt, setOpenAt] = useState(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] max-h-[28rem] w-full flex-col items-center justify-center gap-3 bg-neutral-100 text-neutral-500 md:aspect-auto md:h-[28rem]">
        <FiImage className="text-3xl" />
        <p className="text-xs uppercase tracking-label">No photos yet</p>
      </div>
    );
  }

  const tiles = images.slice(0, MAX_TILES);
  const layout = LAYOUTS[tiles.length];
  const hiddenCount = images.length - tiles.length;

  return (
    <>
      {/* Phones: swipe through the photos, tap to open full screen */}
      <div className="-mx-4 sm:-mx-6 md:hidden">
        <Swiper modules={[Pagination]} pagination={{ type: "fraction" }} className="photo-swiper aspect-[4/3] bg-neutral-100">
          {images.map((url, index) => (
            <SwiperSlide key={url}>
              <button
                type="button"
                className="block h-full w-full"
                onClick={() => setOpenAt(index)}
                aria-label={`Open photo ${index + 1} of ${images.length} full screen`}
              >
                <Photo src={url} alt={`${title}, photo ${index + 1}`} />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Larger screens: cover photo with the next ones beside it */}
      <div className="relative hidden h-[28rem] grid-cols-4 grid-rows-2 gap-2 md:grid lg:h-[34rem]">
        {tiles.map((url, index) => {
          const isLast = index === tiles.length - 1;
          return (
            <button
              key={url}
              type="button"
              onClick={() => setOpenAt(index)}
              className={`group relative overflow-hidden bg-neutral-100 ${layout[index]}`}
              aria-label={`Open photo ${index + 1} of ${images.length} full screen`}
            >
              <Photo
                src={url}
                alt={`${title}, photo ${index + 1}`}
                className="transition duration-500 group-hover:scale-[1.02] group-hover:brightness-90"
              />
              {isLast && hiddenCount > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-medium uppercase tracking-label text-white">
                  +{hiddenCount} more
                </span>
              )}
            </button>
          );
        })}

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => setOpenAt(0)}
            className="btn absolute bottom-4 right-4 h-10 bg-white px-4 text-ink shadow-sm hover:bg-neutral-100"
          >
            <FiGrid /> View all {images.length} photos
          </button>
        )}
      </div>

      {openAt !== null && (
        <PhotoLightbox
          images={images}
          title={title}
          startIndex={openAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
