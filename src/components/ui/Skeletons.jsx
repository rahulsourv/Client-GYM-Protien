/**
 * Skeleton placeholders shaped like the real layouts, shown while the live
 * catalogue loads. Each one announces itself to screen readers once.
 */

function Bone({ className = "" }) {
  return <span aria-hidden className={`skeleton block ${className}`} />;
}

function Loading({ label, className = "", children }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** One product card: image, brand, name, size, price. */
export function ProductCardSkeleton() {
  return (
    <div>
      <Bone className="aspect-[4/5] w-full" />
      <Bone className="mt-4 h-2.5 w-20" />
      <Bone className="mt-3 h-4 w-4/5" />
      <Bone className="mt-2 h-3 w-1/3" />
      <Bone className="mt-4 h-4 w-1/2" />
    </div>
  );
}

/** A grid of product cards, matching the shop / collection grids. */
export function ProductGridSkeleton({ count = 6, columns = "md:grid-cols-3" }) {
  return (
    <div className={`grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 ${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Product page: gallery, details column, then the details blocks. */
export function ProductPageSkeleton() {
  return (
    <Loading label="Loading product…" className="shell pb-16 pt-24 md:pb-24 md:pt-32">
      <Bone className="h-3 w-56" />
      <div className="mt-6 grid gap-6 md:mt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-12">
        <Bone className="-mx-[var(--gutter)] aspect-square lg:mx-auto lg:w-full lg:max-w-[min(100%,calc(100svh-11rem))]" />
        <div>
          <Bone className="h-6 w-28" />
          <Bone className="mt-5 h-12 w-11/12" />
          <Bone className="mt-3 h-12 w-2/3" />
          <Bone className="mt-6 h-7 w-44" />
          <Bone className="mt-4 h-3.5 w-56" />
          <Bone className="mt-6 h-4 w-full max-w-md" />
          <Bone className="mt-2 h-4 w-4/5 max-w-sm" />
          <div className="mt-8 border-t border-line pt-6">
            <Bone className="h-3 w-48" />
            <Bone className="mt-5 h-3 w-36" />
            <div className="mt-3 flex gap-2">
              <Bone className="h-12 w-24" />
              <Bone className="h-12 w-24" />
            </div>
          </div>
          <div className="mt-8 flex max-w-md flex-col gap-3">
            <Bone className="h-14 w-full" />
            <Bone className="h-14 w-full" />
          </div>
        </div>
      </div>
      <div className="mt-16 flex flex-col gap-4 border-t border-line pt-10">
        {Array.from({ length: 4 }, (_, i) => (
          <Bone key={i} className="h-5 w-1/2 max-w-xs" />
        ))}
      </div>
    </Loading>
  );
}

/** Collection page: header, search/sort bar and a product grid. */
export function CollectionSkeleton() {
  return (
    <Loading label="Loading category…" className="shell pb-28 pt-28 md:pt-40">
      <Bone className="h-3 w-40" />
      <Bone className="mt-8 h-3 w-32" />
      <Bone className="mt-5 h-16 w-3/4 md:h-28 md:w-1/2" />
      <Bone className="mt-6 h-4 w-full max-w-md" />
      <Bone className="mt-2 h-4 w-2/3 max-w-sm" />
      <div className="mt-12 flex items-center justify-between gap-4 border-b border-line pb-5">
        <Bone className="h-10 w-1/2 max-w-xs" />
        <Bone className="h-10 w-28" />
      </div>
      <div className="mt-8">
        <ProductGridSkeleton count={6} />
      </div>
    </Loading>
  );
}

/** Category index rows: number, big name, thumbnail. */
export function CategoryListSkeleton({ rows = 5 }) {
  return (
    <Loading label="Loading categories…" className="shell pb-28">
      <ul>
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-line py-5 md:gap-10 md:py-7">
            <Bone className="h-3 w-6" />
            <Bone className="h-10 w-3/5 md:h-20" />
            <Bone className="size-16 md:size-28" />
          </li>
        ))}
        <li aria-hidden className="h-px bg-line" />
      </ul>
    </Loading>
  );
}
