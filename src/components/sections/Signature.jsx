"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import Placeholder from "@/components/ui/Placeholder";
import AddToCart from "@/components/product/AddToCart";
import { LinkButton } from "@/components/ui/Button";
import { hvWhey, formatPrice, availabilityLabel } from "@/lib/catalog";

/** 05 — The signature product, presented like a print ad. */
export default function Signature() {
  const root = useRef(null);
  const p = hvWhey();

  useGSAP(
    () => {
      setupReveals();
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(q("[data-sig-pack]"), { yPercent: 12, rotation: -4 }, {
        yPercent: -8, rotation: 3, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.fromTo(q("[data-sig-num]"), { yPercent: 20 }, {
        yPercent: -30, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.fromTo(q("[data-vertical]"), { xPercent: 0 }, {
        xPercent: -50, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="sig-title" className="relative bg-charcoal py-24 md:py-32">
      <div className="shell grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        {/* Visual */}
        <div data-reveal="clip" className="grain relative min-h-[110vw] overflow-hidden bg-obsidian md:col-span-7 md:min-h-[86vh]">
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(55% 45% at 55% 45%, rgba(243,242,237,0.12) 0%, transparent 70%)" }} />
          <span data-sig-num aria-hidden className="display outline-text absolute -left-[0.05em] top-[2%] text-[52vw] leading-none [--stroke:rgba(243,242,237,0.16)] md:text-[30vw]">
            01
          </span>
          <div aria-hidden className="absolute bottom-6 left-0 w-full overflow-hidden whitespace-nowrap">
            <p data-vertical className="eyebrow inline-block text-mute">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="mr-8">HV Whey Protein — Chocolate — 1kg —</span>
              ))}
            </p>
          </div>
          <div data-sig-pack className="absolute inset-[12%_10%_14%_14%]">
            <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width:768px) 50vw, 90vw" className="object-contain drop-shadow-[0_45px_60px_rgba(0,0,0,0.7)]" />
          </div>
          <span className="eyebrow absolute right-4 top-4 bg-lime px-2 py-1 text-obsidian">HV Original</span>
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-center md:col-span-5 md:pl-6">
          <span className="eyebrow text-mute">(05) The signature</span>
          <Lines as="h2" id="sig-title" className="display mt-5 text-[17vw] md:text-[6.5vw]" lines={["HV Whey", <span key="p" className="text-lime">Protein.</span>]} />

          <div data-reveal="fade" className="mt-8 flex flex-col gap-4 text-[1rem] leading-relaxed text-soft/80">
            {p.description.map((d, i) => (
              <p key={i}>{d}</p>
            ))}
            <Placeholder>Description is a draft</Placeholder>
          </div>

          <dl data-reveal="fade" className="mt-10 grid grid-cols-3 border-y border-line">
            {p.labelStats.map((s) => (
              <div key={s.label} className="border-r border-line py-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                <dd className="display text-5xl">
                  {s.value}
                  <span className="normal-case text-lime">{s.unit}</span>
                </dd>
                <dt className="eyebrow mt-2 text-mute">{s.label}</dt>
              </div>
            ))}
          </dl>
          <p className="eyebrow mt-2 text-mute/70">As printed on the pack</p>

          <div data-reveal="fade" className="mt-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-mute">Flavour · Size</p>
                <p className="mt-1 text-warm">
                  {p.flavour} · {p.size}
                </p>
              </div>
              <div className="text-right">
                <p className="display text-5xl tabular-nums">From {formatPrice(p.price)}</p>
                <Placeholder className="mt-1">Price to be confirmed</Placeholder>
              </div>
            </div>
            <p className="text-xs text-mute">{availabilityLabel[p.availability]}</p>
            <div className="flex flex-col gap-3 xs:flex-row">
              <AddToCart product={p} className="flex-1" />
              <LinkButton href={`/products/${p.slug}`} variant="ghost" className="flex-1">
                Explore product
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
