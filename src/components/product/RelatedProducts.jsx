"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals, batchReveal } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import ProductCard from "./ProductCard";

export default function RelatedProducts({ products }) {
  const root = useRef(null);
  useGSAP(
    () => {
      setupReveals();
      batchReveal("[data-card]");
    },
    { scope: root }
  );
  if (!products.length) return null;
  return (
    <section ref={root} aria-labelledby="related-title" className="border-t border-line bg-charcoal py-20 md:py-28">
      <div className="shell">
        <Lines as="h2" id="related-title" className="display mb-12 text-[13vw] md:text-[6vw]" lines={["Pairs well", "with."]} />
        <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
          {products.map((p, i) => (
            <li key={p.id} data-card>
              <ProductCard product={p} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
