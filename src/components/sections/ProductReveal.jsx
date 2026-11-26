"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { hvWhey } from "@/lib/catalog";

/**
 * 02 — Scroll-driven reveal. Pinned stage: the headline gives way to the tub,
 * then the label's own numbers count in around it. Only facts printed on the
 * HV pack are used here.
 */
const callouts = [
  { key: "protein", value: 24, decimals: 0, unit: "g", label: "Protein", pos: "left-[5%] top-[17%] md:left-[7%] md:top-[24%]" },
  { key: "bcaa", value: 5.5, decimals: 1, unit: "g", label: "BCAAs", pos: "right-[5%] top-[17%] text-right md:right-[7%] md:top-[20%]" },
  { key: "glut", value: 4, decimals: 0, unit: "g", label: "Glutamine", pos: "right-[5%] bottom-[14%] text-right md:right-[10%] md:bottom-[18%]" },
  { key: "whey", value: 100, decimals: 0, unit: "%", label: "Premium whey protein", pos: "left-[5%] bottom-[14%] md:left-[10%] md:bottom-[20%]" },
];

export default function ProductReveal() {
  const root = useRef(null);
  const p = hvWhey();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // Headline rises as the section arrives (before pinning).
      gsap.from(q("[data-head] .line-mask > span"), {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (window.innerWidth < 768 ? 1.8 : 2.4)}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(q("[data-tub]"), { yPercent: 75, scale: 0.72, rotation: -9 }, { yPercent: 0, scale: 1, rotation: 0, ease: "power2.out", duration: 1.2 }, 0)
        .to(q("[data-head]"), { scale: 1.12, autoAlpha: 0, filter: "blur(6px)", duration: 0.7, ease: "power1.in" }, 0.7)
        .fromTo(q("[data-glow]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.6);

      q("[data-callout]").forEach((el, i) => {
        const num = el.querySelector("[data-num]");
        const target = Number(num.dataset.value);
        const decimals = Number(num.dataset.decimals);
        const proxy = { v: 0 };
        const at = 1.35 + i * 0.32;
        tl.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, at)
          .fromTo(el.querySelector("[data-tick]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, at)
          .to(proxy, { v: target, duration: 0.6, ease: "power2.out", onUpdate: () => (num.textContent = proxy.v.toFixed(decimals)) }, at);
      });

      tl.to(q("[data-tub]"), { rotation: 3, scale: 0.96, duration: 1.2, ease: "sine.inOut" }, 2.4)
        .fromTo(q("[data-caption]"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 2.9)
        .to({}, { duration: 0.4 }); // short hold before release
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="reveal-title" className="grain relative isolate h-[100svh] overflow-hidden bg-obsidian">
      <div
        data-glow
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-100 motion-safe:opacity-0"
        style={{ background: "radial-gradient(40% 50% at 50% 55%, rgba(255,179,0,0.08) 0%, transparent 70%), radial-gradient(60% 60% at 50% 45%, rgba(243,242,237,0.08) 0%, transparent 70%)" }}
      />

      <div className="shell absolute inset-x-0 top-20 z-20 flex justify-between md:top-24">
        <span className="eyebrow text-mute">(02) The tub</span>
        <span className="eyebrow text-mute">HV Whey · Chocolate · 1kg</span>
      </div>

      <h2 id="reveal-title" data-head className="display absolute inset-0 z-0 flex flex-col items-center justify-center text-center text-[17vw] text-warm motion-reduce:opacity-15 md:text-[11.5vw]">
        <span className="line-mask"><span>Not just</span></span>
        <span className="line-mask"><span>another <span className="outline-text">scoop.</span></span></span>
      </h2>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div data-tub className="relative h-[52svh] w-[80vw] max-w-[560px] md:h-[66vh]">
          <Image src={p.images[0].src} alt="" fill sizes="(min-width:768px) 40vw, 80vw" className="object-contain drop-shadow-[0_50px_70px_rgba(0,0,0,0.7)]" />
        </div>
      </div>

      <ul className="absolute inset-0 z-20" aria-label="As printed on the HV Whey Protein pack">
        {callouts.map((c) => (
          <li key={c.key} data-callout className={`absolute opacity-100 motion-safe:opacity-0 ${c.pos}`}>
            <span className="display block text-[15vw] leading-[0.85] text-warm md:text-[7.5vw]">
              <span data-num data-value={c.value} data-decimals={c.decimals}>
                {c.value}
              </span>
              <span className="normal-case text-lime">{c.unit}</span>
            </span>
            <span className={`mt-2 flex items-center gap-3 ${c.pos.includes("text-right") ? "flex-row-reverse" : ""}`}>
              <span data-tick aria-hidden className="h-px w-8 origin-left bg-lime md:w-14" />
              <span className="eyebrow text-soft">{c.label}</span>
            </span>
          </li>
        ))}
      </ul>

      <p data-caption className="absolute inset-x-0 bottom-6 z-20 text-center opacity-100 motion-safe:opacity-0">
        <span className="eyebrow text-mute">Figures as printed on the HV pack · </span>
        <Link href={`/products/${p.slug}`} className="eyebrow text-warm underline decoration-lime underline-offset-4 hover:text-lime">
          See the product
        </Link>
      </p>
    </section>
  );
}
