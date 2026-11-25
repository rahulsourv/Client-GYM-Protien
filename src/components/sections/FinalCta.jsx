"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/Button";
import { hvWhey } from "@/lib/catalog";

/** 11 — Closing frame: the type splits, the tub rises through the gap. */
export default function FinalCta() {
  const root = useRef(null);
  const p = hvWhey();
  useGSAP(
    () => {
      setupReveals();
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const st = { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 1 };
      gsap
        .timeline({ scrollTrigger: st })
        .fromTo(q("[data-top]"), { xPercent: -12 }, { xPercent: 0, ease: "none" }, 0)
        .fromTo(q("[data-bottom]"), { xPercent: 12 }, { xPercent: 0, ease: "none" }, 0)
        .fromTo(q("[data-rise]"), { yPercent: 45, scale: 0.85 }, { yPercent: 0, scale: 1, ease: "none" }, 0);
    },
    { scope: root }
  );
  return (
    <section ref={root} aria-labelledby="final-title" className="grain relative isolate overflow-hidden bg-obsidian pb-16 pt-28 md:pb-24 md:pt-40">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(45% 50% at 50% 60%, rgba(243,242,237,0.1) 0%, transparent 70%)" }} />
      <h2 id="final-title" className="display relative z-0 text-center text-[24vw] leading-[0.8] md:text-[19vw]">
        <span data-top className="block">Make every</span>
        <span data-bottom className="block">
          rep <span className="text-lime">count.</span>
        </span>
      </h2>
      <div data-rise className="relative z-10 mx-auto -mt-[22vw] h-[62vw] w-[60vw] max-w-[520px] md:-mt-[17vw] md:h-[44vw] md:max-h-[620px]">
        <Image src={p.images[0].src} alt="" fill sizes="(min-width:768px) 40vw, 60vw" className="object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.75)]" />
      </div>
      <div className="shell relative z-20 mt-10 flex flex-col items-center gap-4 text-center">
        <p data-reveal="fade" className="max-w-sm text-sm text-mute">
          Our whey, plus creatine, pre-workout and more from the brands we stock.
        </p>
        <div data-reveal="fade" className="flex flex-col gap-3 xs:flex-row">
          <LinkButton href="/shop">Shop now</LinkButton>
          <LinkButton href={`/products/${p.slug}`} variant="ghost">
            HV Whey Protein
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
