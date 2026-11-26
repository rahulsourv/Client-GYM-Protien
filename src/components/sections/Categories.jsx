"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import ProductImage from "@/components/product/ProductImage";
import { categories, byCategory, onePerFamily, hvWhey } from "@/lib/catalog";

/**
 * 04 — Shop by category. An editorial index instead of a tile grid: huge rows,
 * each with a fixed packshot thumbnail that zooms gently on hover.
 */
export default function Categories({ bare = false }) {
  const root = useRef(null);
  const [active, setActive] = useState(null);

  const rows = categories.map((c) => {
    const list = byCategory(c.slug);
    // Lead with our own tub for protein; otherwise the sharpest available packshot.
    const lead = c.slug === "whey-protein" ? hvWhey() : [...onePerFamily(list)].sort((a, b) => b.images[0].width - a.images[0].width)[0];
    return { ...c, count: list.length, lead };
  });

  useGSAP(() => setupReveals(), { scope: root });

  return (
    <section ref={root} aria-labelledby={bare ? undefined : "cat-title"} aria-label={bare ? "Categories" : undefined} className={`relative overflow-hidden bg-obsidian ${bare ? "pb-28" : "py-10 md:py-36"}`}>
      <div className="shell">
        {!bare && (
        <div className="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <div>
            <span className="eyebrow text-mute">(03) Index</span>
            <Lines as="h2" id="cat-title" className="display mt-4 text-[16vw] md:text-[8vw]" lines={["Shop by", "category"]} />
          </div>
          <p data-reveal="fade" className="max-w-xs text-sm text-mute">
            Everything on our shelf, sorted by what it does in your routine.
          </p>
        </div>
        )}

        <ul onPointerLeave={() => setActive(null)}>
          {rows.map((c, i) => (
            <li key={c.slug} className="relative">
              <span data-reveal="rule" aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
              <Link
                href={`/collections/${c.slug}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 transition-opacity duration-500 md:gap-10 md:py-7 ${
                  active != null && active !== i ? "md:opacity-30" : ""
                }`}
              >
                <span className="w-8 font-mono text-xs text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span className="display block text-[12vw] leading-[0.85] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-4 group-hover:text-lime md:text-[7vw]">
                  {c.name}
                </span>
                <span className="flex items-center gap-4 md:gap-8">
                  <span className="hidden text-right md:block">
                    <span className="block font-mono text-sm text-warm">{String(c.count).padStart(2, "0")}</span>
                    <span className="eyebrow text-mute">Products</span>
                  </span>
                  {/* Fixed thumbnail — zooms slightly on hover */}
                  <span className="block w-16 overflow-hidden md:w-28">
                    {c.lead.brand === "hv-nutrition" ? (
                      <span className="relative block aspect-square bg-graphite">
                        <Image
                          src={c.lead.images[0].src}
                          alt=""
                          fill
                          sizes="(min-width:768px) 112px, 64px"
                          className="object-contain p-1.5 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110 md:p-2.5"
                        />
                      </span>
                    ) : (
                      <ProductImage
                        image={{ ...c.lead.images[0], alt: "" }}
                        sizes="(min-width:768px) 112px, 64px"
                        className="aspect-square"
                        imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110"
                        pad="6%"
                      />
                    )}
                  </span>
                  <span className="grid size-12 place-items-center border border-line transition-colors duration-500 group-hover:border-lime group-hover:bg-lime group-hover:text-ink max-md:hidden">
                    <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li aria-hidden className="h-px bg-line" />
        </ul>
      </div>
    </section>
  );
}
