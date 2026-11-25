"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import Placeholder from "@/components/ui/Placeholder";
import { TextLink } from "@/components/ui/Button";
import { store } from "@/data/catalog";

// DRAFT brand statement — not an official HV Nutrition philosophy. Edit freely.
const statement = "The work doesn’t stop at the gym. It’s in what you eat, when you sleep, and what you put in the shaker.";

/** 03 — Brand philosophy. The page turns to paper: warm white, black type. */
export default function Philosophy() {
  const root = useRef(null);

  useGSAP(
    () => {
      setupReveals();
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      // Words ink in as you read.
      gsap.fromTo(
        q("[data-word]"),
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: { trigger: q("[data-statement]")[0], start: "top 75%", end: "bottom 45%", scrub: true },
        }
      );
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
    <section ref={root} aria-labelledby="philosophy-title" className="relative bg-warm py-24 text-obsidian md:py-40">
      <div className="shell">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-obsidian/60">(03) Philosophy</span>
          <Placeholder className="text-obsidian/60">Draft copy — edit in Philosophy.jsx</Placeholder>
        </div>

        <h2 id="philosophy-title" data-statement className="display mt-10 max-w-[16ch] text-[13vw] leading-[0.88] md:mt-16 md:text-[7.6vw]">
          {statement.split(" ").map((w, i) => (
            <span key={i} data-word className="inline-block pr-[0.22em]">
              {w}
            </span>
          ))}
        </h2>

        <div className="mt-20 grid grid-cols-1 gap-12 md:mt-32 md:grid-cols-12 md:gap-8">
          <div data-crop-frame data-reveal="clip" className="grain relative aspect-[4/5] overflow-hidden bg-obsidian md:col-span-5">
            <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(55% 45% at 50% 45%, rgba(243,242,237,0.14) 0%, transparent 70%)" }} />
            {/* The full tub, studio-lit — drifts gently inside its frame. */}
            <div data-crop className="absolute inset-[10%]">
              <Image
                src="/assets/Black HV Nutrition Whey Protein Tub.png"
                alt="HV Nutrition Whey Protein tub, chocolate flavour, 1kg"
                fill
                sizes="(min-width:768px) 35vw, 80vw"
                className="object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.7)]"
              />
            </div>
            <span className="eyebrow absolute bottom-4 left-4 text-warm/70">Fig. 01 — HV Whey Protein</span>
          </div>

          <div className="flex flex-col justify-between gap-12 md:col-span-6 md:col-start-7">
            <div className="grid grid-cols-2 gap-6">
              <Stat value={store.yearsInNutrition} label="Years in gym supplements & nutritional products" />
              <Stat value={store.yearsInBodybuilding} label="Years in the bodybuilding field" />
            </div>
            <div>
              <Lines
                as="p"
                className="display text-5xl md:text-6xl"
                lines={["Founded by", `${store.founder}.`]}
              />
              <p data-reveal="fade" className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-obsidian/75">
                HV Nutrition was started in {store.city} by {store.founder}, with over a decade in sports nutrition behind it.
                The idea is simple: genuine products, honest guidance, and a house whey we’re proud to put our name on.
              </p>
              <TextLink href="/about" className="mt-8 font-mono text-xs uppercase tracking-[0.14em]">
                Read our story
              </TextLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="border-t border-obsidian/20 pt-4" data-reveal="fade">
      <p className="display text-[22vw] leading-[0.8] md:text-[9vw]">
        {value}
        <span className="text-[0.4em] align-top">yrs</span>
      </p>
      <p className="mt-3 max-w-[22ch] text-sm text-obsidian/65">{label}</p>
    </div>
  );
}
