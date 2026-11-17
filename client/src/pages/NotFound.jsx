import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page flex flex-col items-start py-32">
      <p className="eyebrow">Error 404</p>
      <h1 className="heading mt-4 text-5xl sm:text-6xl">This page doesn’t exist.</h1>
      <p className="mt-6 max-w-md text-neutral-600">
        The address may be mistyped, or the property may no longer be listed.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/search" className="btn-primary">
          Browse properties
        </Link>
        <Link to="/" className="btn-secondary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
