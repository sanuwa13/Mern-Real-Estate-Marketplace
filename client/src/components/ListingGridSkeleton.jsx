export default function ListingGridSkeleton({ count = 3 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} aria-hidden="true" className="animate-pulse">
      <div className="aspect-[4/3] bg-neutral-100" />
      <div className="mt-4 h-5 w-1/3 bg-neutral-100" />
      <div className="mt-2 h-4 w-2/3 bg-neutral-100" />
      <div className="mt-2 h-4 w-1/2 bg-neutral-100" />
    </div>
  ));
}
