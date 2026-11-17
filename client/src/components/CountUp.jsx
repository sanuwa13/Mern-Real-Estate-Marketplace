import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// Counts from 0 to `value` once the number scrolls into view.
export default function CountUp({ value = 0, duration = 1600 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame;

    const run = () => {
      if (prefersReducedMotion()) {
        setShown(value);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        setShown(Math.round(eased * value));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} aria-label={String(value)}>
      {shown.toLocaleString("en-US")}
    </span>
  );
}
