"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import ProductImage from "@/components/product/ProductImage";
import { brands, byBrand } from "@/lib/catalog";

const themes = {
  "hv-nutrition": { panel: "bg-obsidian text-warm", sub: "text-soft/70", accent: "text-lime", line: "border-line" },
  wellcore: { panel: "bg-soft text-obsidian", sub: "text-obsidian/65", accent: "text-obsidian", line: "border-obsidian/15" },
  muscleblaze: { panel: "bg-graphite text-warm", sub: "text-soft/70", accent: "text-warm", line: "border-line" },
  rebuild: { panel: "bg-charcoal text-warm", sub: "text-soft/70", accent: "text-warm", line: "border-line" },
};

/** 06 — The marketplace: our own line plus the independent brands we stock. */
export default function Marketplace() {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  useGSAP(() => setupReveals(), { scope: root });

  const data = brands.map((b) => {
    const list = byBrand(b.slug);
    // Distinct family+flavour so Wellcore shows three different flavours.
    const seen = new Set();
    const picks = list.filter((p) => {
      const k = `${p.family}:${p.flavour}`;
      return seen.has(k) ? false : (seen.add(k), true);
    });
    return { ...b, count: list.length, picks: picks.slice(0, 3), t: themes[b.slug] };
  });

  return (
    <section ref={root} aria-labelledby="market-title" className="bg-obsidian py-24 md:py-36">
      <div className="shell">
        <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <span className="eyebrow text-mute">(04) The marketplace</span>
            <Lines as="h2" id="market-title" className="display mt-4 text-[15vw] md:text-[7.5vw]" lines={["The right fuel.", <span key="2" className="outline-text">The right formula.</span>]} />
          </div>
          <p data-reveal="fade" className="max-w-sm text-sm leading-relaxed text-mute md:col-span-4">
            Our own whey sits alongside independent brands we stock and stand behind. Wellcore, MuscleBlaze and Rebuild are
            separate companies — not HV Nutrition products.
          </p>
        </div>

        {/* Desktop: expanding panels */}
        <div data-reveal="fade" className="hidden h-[78vh] min-h-[560px] gap-2 lg:flex">
          {data.map((b, i) => {
            const open = active === i;
            return (
              <Link
                key={b.slug}
                href={`/collections/${b.slug}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`group relative overflow-hidden transition-[flex-grow] duration-[900ms] ease-[var(--ease-out-expo)] ${b.t.panel}`}
                style={{ flexGrow: open ? 3.6 : 1, flexBasis: 0 }}
                aria-label={`${b.name} collection, ${b.count} products`}
              >
                {/* Collapsed label */}
                <div className={`absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-500 ${open ? "opacity-0" : "opacity-100 delay-200"}`}>
                  <span className="font-mono text-xs opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-6xl [writing-mode:vertical-rl] rotate-180">{b.name}</span>
                </div>

                {/* Expanded */}
                <div className={`absolute inset-0 flex flex-col p-8 transition-opacity duration-500 ${open ? "opacity-100 delay-200" : "pointer-events-none opacity-0"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`eyebrow ${b.t.sub}`}>{b.own ? "House brand" : "Independent brand · stocked by HV"}</p>
                      <p className="display mt-3 whitespace-nowrap text-[6.5vw]">{b.name}</p>
                      <p className={`mt-3 max-w-sm text-sm ${b.t.sub}`}>{b.tagline}</p>
                    </div>
                    <span className="text-right">
                      <span className="display block text-6xl">{String(b.count).padStart(2, "0")}</span>
                      <span className={`eyebrow ${b.t.sub}`}>Products</span>
                    </span>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-6">
                    <div className="flex flex-1 items-end gap-3">
                      {b.own ? (
                        <div className="relative h-[42vh] w-full max-w-[380px] transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:-translate-y-2">
                          <Image src={b.picks[0].images[0].src} alt="" fill sizes="380px" className="object-contain object-bottom drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
                        </div>
                      ) : (
                        b.picks.map((p) => (
                          <ProductImage
                            key={p.id}
                            image={{ ...p.images[0], alt: "" }}
                            sizes="300px"
                            className="aspect-[4/5] w-[31%] max-w-[300px] transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:-translate-y-2"
                            pad="10%"
                          />
                        ))
                      )}
                    </div>
                    <span className={`flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] ${b.t.accent}`}>
                      Explore <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile / tablet: stacked brand blocks */}
        <div className="flex flex-col gap-2 lg:hidden">
          {data.map((b, i) => (
            <Link key={b.slug} href={`/collections/${b.slug}`} data-reveal="fade" className={`block p-5 ${b.t.panel}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`eyebrow ${b.t.sub}`}>
                    {String(i + 1).padStart(2, "0")} · {b.own ? "House brand" : "Independent brand"}
                  </p>
                  <p className="display mt-2 text-6xl">{b.name}</p>
                </div>
                <span className="font-mono text-sm">{String(b.count).padStart(2, "0")}</span>
              </div>
              <p className={`mt-2 text-sm ${b.t.sub}`}>{b.tagline}</p>
              <div className="mt-5 flex gap-2">
                {b.own ? (
                  <div className="relative h-56 w-full">
                    <Image src={b.picks[0].images[0].src} alt="" fill sizes="90vw" className="object-contain" />
                  </div>
                ) : (
                  b.picks.map((p) => <ProductImage key={p.id} image={{ ...p.images[0], alt: "" }} sizes="30vw" className="aspect-square flex-1" pad="8%" />)
                )}
              </div>
              <p className={`mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] ${b.t.accent}`}>
                Explore {b.name} <ArrowUpRight className="size-4" aria-hidden />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
