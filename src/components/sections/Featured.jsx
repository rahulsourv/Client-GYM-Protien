"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals, batchReveal } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import ProductCard from "@/components/product/ProductCard";
import { TextLink } from "@/components/ui/Button";
import { featured } from "@/lib/catalog";

/**
 * 07 — Featured. No sales data exists, so this is the store's own featured
 * selection (as on the current site), not a "bestsellers" claim.
 */
export default function Featured() {
  const root = useRef(null);
  const list = featured().slice(0, 8);
  useGSAP(
    () => {
      setupReveals();
      batchReveal("[data-card]");
    },
    { scope: root }
  );
  return (
    <section ref={root} aria-labelledby="featured-title" className="bg-obsidian pb-24 md:pb-36">
      <div className="shell">
        <div className="mb-12 flex flex-col justify-between gap-6 border-t border-line pt-10 md:flex-row md:items-end">
          <div>
            <span className="eyebrow text-mute">(07) Featured</span>
            <Lines as="h2" id="featured-title" className="display mt-4 text-[15vw] md:text-[7vw]" lines={["On the shelf", "right now."]} />
          </div>
          <TextLink href="/shop" className="font-mono text-xs uppercase tracking-[0.14em]">
            View all products
          </TextLink>
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-5">
          {list.map((p, i) => (
            <li key={p.id} data-card>
              <ProductCard product={p} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
