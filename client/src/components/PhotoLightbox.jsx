import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Navigation, Thumbs } from "swiper/modules";
import "swiper/css/bundle";
import { FiX } from "react-icons/fi";

export default function PhotoLightbox({ images, title, startIndex, onClose }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [current, setCurrent] = useState(startIndex);
  const closeRef = useRef(null);

  // while open: Escape closes, the page behind doesn't scroll, and focus starts on the close button
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      className="fixed inset-0 z-50 flex flex-col bg-ink text-white"
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
        <p className="text-sm text-neutral-400">
          <span className="text-white">{current + 1}</span> / {images.length}
          <span className="ml-4 hidden text-neutral-500 sm:inline">{title}</span>
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center border border-neutral-700 hover:border-white"
          aria-label="Close photos"
        >
          <FiX />
        </button>
      </div>

      <Swiper
        modules={[Keyboard, Navigation, Thumbs]}
        initialSlide={startIndex}
        keyboard
        navigation
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        onSlideChange={(swiper) => setCurrent(swiper.activeIndex)}
        className="min-h-0 w-full flex-1"
      >
        {images.map((url, index) => (
          <SwiperSlide key={url} className="!flex items-center justify-center px-4 sm:px-16">
            <img
              src={url}
              alt={`${title}, photo ${index + 1}`}
              className="h-full w-full object-contain"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {images.length > 1 && (
        <div className="shrink-0 px-4 py-4 sm:px-6">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            slidesPerView="auto"
            spaceBetween={8}
            watchSlidesProgress
            className="lightbox-thumbs mx-auto max-w-3xl !p-1"
          >
            {images.map((url, index) => (
              <SwiperSlide key={url} className="!h-14 !w-20 cursor-pointer sm:!h-16 sm:!w-24">
                <img
                  src={url}
                  alt={`Show photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>,
    document.body,
  );
}
