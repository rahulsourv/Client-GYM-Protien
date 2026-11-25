"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import Placeholder from "@/components/ui/Placeholder";
import { LinkButton } from "@/components/ui/Button";
import { hvWhey, formatPrice, availabilityLabel } from "@/lib/catalog";
import { store } from "@/data/catalog";

/** 05 — The signature product, presented like a print ad. */
export default function Signature() {
  const root = useRef(null);
  const p = hvWhey();

  useGSAP(
    () => {
      setupReveals();
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      // "Make every rep count": the two lines slide together while the tub rises through them.
      const box = q("[data-rep-box]")[0];
      gsap
        .timeline({ scrollTrigger: { trigger: box, start: "top bottom", end: "bottom bottom", scrub: 1 } })
        .fromTo(q("[data-rep-top]"), { xPercent: -14 }, { xPercent: 0, ease: "none" }, 0)
        .fromTo(q("[data-rep-bottom]"), { xPercent: 14 }, { xPercent: 0, ease: "none" }, 0)
        .fromTo(q("[data-rep-rise]"), { yPercent: 45, scale: 0.85 }, { yPercent: 0, scale: 1, ease: "none" }, 0);
      gsap.fromTo(q("[data-vertical]"), { xPercent: 0 }, {
        xPercent: -50, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="sig-title" className="relative bg-charcoal py-24 md:py-32">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Visual */}
        <div data-rep-box data-reveal="clip" className="grain relative isolate min-h-[120vw] overflow-hidden bg-obsidian md:min-h-[90vw] lg:col-span-7 lg:min-h-[86vh]">
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(50% 50% at 50% 62%, rgba(243,242,237,0.12) 0%, transparent 70%)" }} />
          <p aria-hidden className="display absolute inset-x-0 top-[9%] z-0 text-center text-[19vw] leading-[0.8] lg:text-[10.5vw]">
            <span data-rep-top className="block">Make every</span>
            <span data-rep-bottom className="block">
              rep <span className="text-lime">count.</span>
            </span>
          </p>
          <div data-rep-rise className="absolute inset-x-[14%] bottom-[11%] top-[30%] z-10">
            <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width:1024px) 42vw, 75vw" className="object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.75)]" />
          </div>
          <div aria-hidden className="absolute bottom-5 left-0 z-20 w-full overflow-hidden whitespace-nowrap">
            <p data-vertical className="eyebrow inline-block text-mute">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="mr-8">HV Whey Protein — Chocolate — 1kg —</span>
              ))}
            </p>
          </div>
          <span className="eyebrow absolute right-4 top-4 z-20 bg-lime px-2 py-1 text-ink">HV Original</span>
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-center lg:col-span-5 lg:pl-6">
          <span className="eyebrow text-mute">(05) The signature</span>
          <Lines as="h2" id="sig-title" className="display mt-5 text-[17vw] md:text-[12vw] lg:text-[6.5vw]" lines={["HV Whey", <span key="p" className="text-lime">Protein.</span>]} />

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
              <LinkButton href={`/products/${p.slug}`} className="xs:flex-1">
                View details
              </LinkButton>
              <LinkButton href={store.phoneHref} variant="ghost" arrow={false} className="xs:flex-1">
                Call to order
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
