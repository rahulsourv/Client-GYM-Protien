"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
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

      // Copy column: tied to scroll (scrubbed), so it builds in on the way down
      // and rewinds cleanly on the way back up.
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023px)" }, (ctx) => {
        const { desktop } = ctx.conditions;
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: desktop
            ? { trigger: root.current, start: "top 75%", end: "top 5%", scrub: 0.8 }
            : { trigger: q("[data-copy]")[0], start: "top 90%", end: "center 55%", scrub: 0.8 },
        });
        tl.fromTo(q("[data-title-line]"), { yPercent: 110 }, { yPercent: 0, stagger: 0.12, duration: 0.6 }, 0)
          .fromTo(q("[data-in]"), { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5 }, 0.15)
          .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, 0.3)
          .fromTo(q("[data-stat]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.45 }, 0.35);

        // Numbers count up with the scroll (and back down when reversing).
        q("[data-count]").forEach((el, i) => {
          const raw = String(el.dataset.count);
          const target = Number(raw);
          const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
          const proxy = { v: 0 };
          const render = () => {
            el.textContent = target >= 1000 || el.closest("[data-in]")
              ? Math.round(proxy.v).toLocaleString("en-IN")
              : proxy.v.toFixed(decimals);
          };
          tl.fromTo(proxy, { v: 0 }, { v: target, duration: 0.6, ease: "power1.out", onUpdate: render }, 0.4 + i * 0.08);
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="sig-title" className="relative bg-charcoal py-24 md:py-32 lg:flex lg:min-h-svh lg:items-center lg:py-12">
      <div className="shell grid w-full grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Visual */}
        <div data-rep-box data-reveal="clip" className="grain relative isolate min-h-[120vw] overflow-hidden bg-obsidian md:min-h-[90vw] lg:col-span-7 lg:h-[calc(100svh-6rem)] lg:min-h-[520px]">
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
        <div data-copy className="flex flex-col justify-center lg:col-span-5 lg:pl-6">
          <span data-in className="eyebrow text-mute">(04) The signature</span>
          <h2 id="sig-title" className="display mt-4 text-[17vw] md:text-[12vw] lg:mt-3 lg:text-[clamp(3rem,4.6vw,5.5rem)]">
            <span className="line-mask"><span data-title-line className="block">HV Whey</span></span>
            <span className="line-mask"><span data-title-line className="block text-lime">Protein.</span></span>
          </h2>

          <div className="mt-6 flex flex-col gap-3 text-[0.95rem] leading-relaxed text-soft/80 lg:mt-5 lg:text-[0.9rem]">
            {p.description.map((d, i) => (
              <p key={i} data-in>{d}</p>
            ))}
            <div data-in>
              <Placeholder>Description is a draft</Placeholder>
            </div>
          </div>

          <dl className="relative mt-8 grid grid-cols-3 lg:mt-6">
            <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-line" />
            <span data-rule aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-right bg-line" />
            {p.labelStats.map((s) => (
              <div key={s.label} data-stat className="border-r border-line py-5 pr-3 last:border-r-0 lg:py-4 [&:not(:first-child)]:pl-4">
                <dd className="display text-5xl lg:text-[clamp(2.25rem,3vw,3rem)]">
                  <span data-count={s.value}>{s.value}</span>
                  <span className="normal-case text-lime">{s.unit}</span>
                </dd>
                <dt className="eyebrow mt-2 text-mute">{s.label}</dt>
              </div>
            ))}
          </dl>
          <p data-in className="eyebrow mt-2 text-mute/70">As printed on the pack</p>

          <div className="mt-8 flex flex-col gap-5 lg:mt-6 lg:gap-4">
            <div data-in className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-mute">Flavour · Size</p>
                <p className="mt-1 text-warm">
                  {p.flavour} · {p.size}
                </p>
                <p className="mt-1 text-xs text-mute">{availabilityLabel[p.availability]}</p>
              </div>
              <div className="text-right">
                <p className="display text-5xl tabular-nums lg:text-[clamp(2.25rem,3vw,3rem)]">
                  From ₹<span data-count={p.price}>{formatPrice(p.price).replace(/[^\d,]/g, "")}</span>
                </p>
                <Placeholder className="mt-1">Price to be confirmed</Placeholder>
              </div>
            </div>
            <div data-in className="flex flex-col gap-3 xs:flex-row">
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
