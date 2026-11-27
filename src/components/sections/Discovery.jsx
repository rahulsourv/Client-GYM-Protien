"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import CatalogBrowser from "@/components/shop/CatalogBrowser";

/** 08 — Find your fuel: the live catalog, filterable right on the homepage. */
export default function Discovery({ categories, products, unavailable }) {
  const root = useRef(null);
  useGSAP(() => setupReveals(), { scope: root });
  return (
    <section ref={root} aria-labelledby="discover-title" className="border-t border-line bg-charcoal py-24 md:py-36">
      <div className="shell">
        <div className="mb-12 grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <span className="eyebrow text-mute">(05) Discover</span>
            <Lines as="h2" id="discover-title" className="display mt-4 text-[17vw] md:text-[9vw]" lines={["Find your", <span key="f" className="text-lime">fuel.</span>]} />
          </div>
          <p data-reveal="fade" className="max-w-xs text-sm text-mute md:col-span-4">
            Filter by brand, type and budget. Every product here is in the catalog right now.
          </p>
        </div>
        {unavailable && <p role="status" className="mb-6 text-sm text-mute">The live catalog is temporarily unavailable.</p>}
        <CatalogBrowser compact limit={8} base={products} categoryList={categories} defaultSort="newest" />
      </div>
    </section>
  );
}
