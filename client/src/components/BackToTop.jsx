import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center bg-ink text-white shadow-lg transition-all duration-300 hover:bg-neutral-800 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <FiArrowUp />
    </button>
  );
}
