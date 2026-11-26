"use client";

import Image from "next/image";
import { useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import { LinkButton } from "@/components/ui/Button";
import { store } from "@/data/catalog";

/** 08 — The founder: who's behind the shop, with the house tub alongside. Fits one screen. */
export default function Founder() {
  const root = useRef(null);

  useGSAP(
    () => {
      setupReveals();
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      // The tub drifts gently inside its frame.
      gsap.fromTo(
        q("[data-crop]"),
        { yPercent: 6 },
        { yPercent: -6, ease: "none", scrollTrigger: { trigger: q("[data-crop-frame]")[0], start: "top bottom", end: "bottom top", scrub: true } }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-labelledby="founder-title"
      className="relative border-t border-line bg-charcoal py-10 md:py-28 lg:flex lg:min-h-svh lg:items-center lg:py-16"
    >
      <div className="shell grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div
          data-crop-frame
          data-reveal="clip"
          className="grain relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-obsidian lg:col-span-5 lg:h-[calc(100svh-10rem)] lg:max-h-[760px] lg:w-auto lg:max-w-none"
        >
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(55% 45% at 50% 45%, rgba(243,242,237,0.14) 0%, transparent 70%)" }} />
          <div data-crop className="absolute inset-[10%]">
            <Image
              src="/assets/HV Nutrition Whey Protein Tub.png"
              alt="HV Nutrition Whey Protein tub, chocolate flavour, 1kg"
              fill
              sizes="(min-width:1024px) 35vw, 80vw"
              className="object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.7)]"
            />
          </div>
          <span className="eyebrow absolute bottom-4 left-4 text-warm/70">Fig. 01 — HV Whey Protein</span>
        </div>

        <div className="flex flex-col lg:col-span-6 lg:col-start-7">
          <span className="eyebrow text-mute">(07) Founder</span>
          <Lines
            as="h2"
            id="founder-title"
            className="display mt-5 text-[14vw] md:text-7xl lg:text-[clamp(3.5rem,5.4vw,6.5rem)]"
            lines={["Founded by", <span key="n" className="text-lime">{store.founder}.</span>]}
          />
          <p data-reveal="fade" className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-warm/75">
            {store.legalName} is run by {store.founder} from {store.city}, {store.region}. The idea is simple: genuine products,
            honest guidance, and a house whey we’re proud to put our name on.
          </p>

          <div data-reveal="fade" className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <LinkButton href={store.fssai.pdf} target="_blank" rel="noopener noreferrer" arrow={false} className="sm:flex-1">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4" aria-hidden /> FSSAI certificate
              </span>
            </LinkButton>
            <LinkButton href="/about" variant="ghost" className="sm:flex-1">
              Read our story
            </LinkButton>
          </div>
          <p data-reveal="fade" className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-mute">
            FSSAI Reg. No. <span className="text-warm">{store.fssai.number}</span> · valid until {store.fssai.validUntil}
          </p>
        </div>
      </div>
    </section>
  );
}
