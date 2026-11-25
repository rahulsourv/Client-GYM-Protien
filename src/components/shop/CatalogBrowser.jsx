"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Overlay from "@/components/ui/Overlay";
import { LinkButton, Button } from "@/components/ui/Button";
import { brands, categories, filterProducts, formatPrice, products as allProducts } from "@/lib/catalog";

const sorts = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

/**
 * Filter / sort / search over the central catalog. Used by /shop,
 * /collections/[slug] and the homepage discovery section (compact).
 */
export default function CatalogBrowser({ base = allProducts, lock = {}, compact = false, limit }) {
  const bounds = useMemo(() => {
    const ps = base.map((p) => p.price);
    return [Math.floor(Math.min(...ps) / 50) * 50, Math.ceil(Math.max(...ps) / 50) * 50];
  }, [base]);

  const empty = { brands: [], categories: [], maxPrice: bounds[1], inStockOnly: false, query: "", sort: "featured" };
  const [f, setF] = useState(empty);
  const [drawer, setDrawer] = useState(false);
  const query = useDeferredValue(f.query);

  const results = useMemo(() => filterProducts(base, { ...f, query }), [base, f, query]);
  const shown = limit ? results.slice(0, limit) : results;

  const toggle = (key, v) =>
    setF((s) => ({ ...s, [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));
  const active = f.brands.length + f.categories.length + (f.maxPrice < bounds[1]) + f.inStockOnly + Boolean(f.query);
  const reset = () => setF(empty);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  const brandOpts = brands.filter((b) => !lock.brand && base.some((p) => p.brand === b.slug));
  const catOpts = categories.filter((c) => !lock.category && base.some((p) => p.category === c.slug));

  const filters = (
    <Filters
      f={f}
      setF={setF}
      toggle={toggle}
      brandOpts={brandOpts}
      catOpts={catOpts}
      bounds={bounds}
      base={base}
      compact={compact}
    />
  );

  return (
    <div className={compact ? "" : "grid gap-10 lg:grid-cols-[260px_1fr]"}>
      {!compact && (
        <aside className="hidden lg:block" aria-label="Product filters">
          <div className="sticky top-28">{filters}</div>
        </aside>
      )}

      <div>
        {/* Toolbar */}
        <div className={`mb-8 flex flex-col gap-4 ${compact ? "" : "border-b border-line pb-5"}`}>
          {compact && filters}
          <div className="flex flex-wrap items-center gap-3">
            {!compact && (
              <label className="relative flex min-w-0 flex-1 items-center border-b border-line focus-within:border-lime">
                <Search className="size-4 text-mute" aria-hidden />
                <span className="sr-only">Search within this collection</span>
                <input
                  value={f.query}
                  onChange={(e) => setF((s) => ({ ...s, query: e.target.value }))}
                  placeholder="Search this collection"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-mute"
                />
              </label>
            )}
            <p className="font-mono text-xs text-mute" aria-live="polite">
              {results.length} product{results.length === 1 ? "" : "s"}
            </p>
            <div className="ml-auto flex items-center gap-2">
              {!compact && (
                <button
                  type="button"
                  onClick={() => setDrawer(true)}
                  className="flex h-10 items-center gap-2 border border-line px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] lg:hidden"
                >
                  <SlidersHorizontal className="size-3.5" aria-hidden /> Filters{active ? ` (${active})` : ""}
                </button>
              )}
              <label className="flex items-center gap-2">
                <span className="eyebrow hidden text-mute sm:inline">Sort</span>
                <select
                  value={f.sort}
                  onChange={(e) => setF((s) => ({ ...s, sort: e.target.value }))}
                  className="h-10 border border-line bg-obsidian px-3 text-sm text-warm outline-none focus-visible:border-lime"
                >
                  {sorts.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          {active > 0 && (
            <button type="button" onClick={reset} className="eyebrow flex w-fit items-center gap-1.5 text-mute hover:text-warm">
              <X className="size-3" aria-hidden /> Clear all filters
            </button>
          )}
        </div>

        {/* Grid */}
        {shown.length === 0 ? (
          <div className="border border-dashed border-line px-6 py-20 text-center">
            <p className="display text-5xl text-soft">Nothing matches that.</p>
            <p className="mt-3 text-sm text-mute">Loosen a filter or clear them all.</p>
            <Button variant="ghost" className="mt-8" onClick={reset}>
              Clear filters
            </Button>
          </div>
        ) : (
          <motion.ul layout className={`grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 ${compact ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProductCard product={p} index={i} sizes={compact ? "(min-width:768px) 24vw, 48vw" : "(min-width:1024px) 24vw, (min-width:768px) 32vw, 48vw"} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}

        {limit && results.length > limit && (
          <div className="mt-14 flex justify-center">
            <LinkButton href="/shop" variant="ghost">
              View all {results.length} in the shop
            </LinkButton>
          </div>
        )}
      </div>

      {!compact && (
        <Overlay open={drawer} onClose={closeDrawer} label="Filters" side="right" className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-charcoal">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <h2 className="display text-4xl">Filters</h2>
            <button type="button" onClick={closeDrawer} className="grid size-11 place-items-center" aria-label="Close filters">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">{filters}</div>
          <div className="flex gap-2 border-t border-line p-4">
            <Button variant="ghost" className="flex-1" onClick={reset}>
              Reset
            </Button>
            <Button className="flex-1" onClick={closeDrawer}>
              Show {results.length}
            </Button>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function Chip({ on, onClick, children, count }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="flex items-center gap-2 border border-line px-3.5 py-2 text-sm text-warm transition-colors hover:border-warm aria-pressed:border-lime aria-pressed:bg-lime aria-pressed:text-ink"
    >
      {children}
      {count != null && <span className="font-mono text-[0.65rem] opacity-60">{count}</span>}
    </button>
  );
}

function Filters({ f, setF, toggle, brandOpts, catOpts, bounds, base, compact }) {
  const group = compact ? "flex flex-wrap items-center gap-2" : "flex flex-wrap gap-2";
  return (
    <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-9"}>
      {brandOpts.length > 1 && (
        <fieldset>
          <legend className={`eyebrow text-mute ${compact ? "sr-only" : "mb-3"}`}>Brand</legend>
          <div className={group}>
            {compact && <span className="eyebrow mr-2 w-20 text-mute">Brand</span>}
            {brandOpts.map((b) => (
              <Chip key={b.slug} on={f.brands.includes(b.slug)} onClick={() => toggle("brands", b.slug)} count={base.filter((p) => p.brand === b.slug).length}>
                {b.name}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}
      {catOpts.length > 1 && (
        <fieldset>
          <legend className={`eyebrow text-mute ${compact ? "sr-only" : "mb-3"}`}>Category</legend>
          <div className={group}>
            {compact && <span className="eyebrow mr-2 w-20 text-mute">Type</span>}
            {catOpts.map((c) => (
              <Chip key={c.slug} on={f.categories.includes(c.slug)} onClick={() => toggle("categories", c.slug)} count={base.filter((p) => p.category === c.slug).length}>
                {c.name}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset className={compact ? "flex flex-wrap items-center gap-4" : ""}>
        <legend className={`eyebrow text-mute ${compact ? "sr-only" : "mb-3"}`}>Price</legend>
        {compact && <span className="eyebrow w-20 text-mute">Max price</span>}
        <label className={`flex items-center gap-4 ${compact ? "min-w-64 flex-1 md:max-w-md" : ""}`}>
          <span className="sr-only">Maximum price</span>
          <input
            type="range"
            min={bounds[0]}
            max={bounds[1]}
            step={50}
            value={f.maxPrice}
            onChange={(e) => setF((s) => ({ ...s, maxPrice: Number(e.target.value) }))}
            className="h-1 flex-1 cursor-pointer accent-lime"
          />
          <output className="w-20 text-right font-mono text-xs tabular-nums">≤ {formatPrice(f.maxPrice)}</output>
        </label>
        {!compact && (
          <p className="mt-2 flex justify-between font-mono text-[0.65rem] text-mute">
            <span>{formatPrice(bounds[0])}</span>
            <span>{formatPrice(bounds[1])}</span>
          </p>
        )}
      </fieldset>
      {!compact && (
        <fieldset>
          <legend className="eyebrow mb-3 text-mute">Availability</legend>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={f.inStockOnly}
              onChange={(e) => setF((s) => ({ ...s, inStockOnly: e.target.checked }))}
              className="size-4 accent-lime"
            />
            In stock only
          </label>
        </fieldset>
      )}
    </div>
  );
}
