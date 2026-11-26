"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { onIntroDone } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/Button";
import { hvWhey } from "@/lib/catalog";

/**
 * 01 — Hero. A product shoot, not a banner: the tub stands in a pool of light
 * in front of a wall of type, the second line sits in front of it for depth.
 */
export default function Hero() {
  const root = useRef(null);
  const p = hvWhey();

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const q = gsap.utils.selector(root);

      if (reduced) {
        gsap.set(q("[data-hero-hide]"), { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
      tl.fromTo(q("[data-light]"), { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 2.2 }, 0)
        .fromTo(q("[data-word] > span"), { yPercent: 105 }, { yPercent: 0, duration: 1.5, stagger: 0.05 }, 0.05)
        .fromTo(q("[data-hero-pack]"), { yPercent: 18, scale: 0.92, autoAlpha: 0 }, { yPercent: 0, scale: 1, autoAlpha: 1, duration: 1.9 }, 0.2)
        .fromTo(q("[data-shadow]"), { scaleX: 0.4, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 1.8 }, 0.35)
        .fromTo(q("[data-line2] > span"), { yPercent: 110 }, { yPercent: 0, duration: 1.3 }, 0.55)
        .fromTo(q("[data-fade]"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08 }, 0.8)
        .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.4, stagger: 0.06, ease: "expo.inOut" }, 0.7);
      // Elements now hold their "from" state (opacity 0 / masked) - lift the
      // pre-hydration visibility guard without revealing them.
      gsap.set(q("[data-hero-hide]"), { visibility: "visible" });
      const off = onIntroDone(() => tl.play());

      // Idle float on an inner wrapper (doesn't fight the parallax transforms).
      gsap.to(q("[data-float]"), { y: -14, rotation: 0.6, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // Pointer parallax — fine pointers only.
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const packX = gsap.quickTo(q("[data-parallax]"), "x", { duration: 1.2, ease: "power3.out" });
        const packY = gsap.quickTo(q("[data-parallax]"), "y", { duration: 1.2, ease: "power3.out" });
        const typeX = gsap.quickTo(q("[data-type-layer]"), "x", { duration: 1.6, ease: "power3.out" });
        const move = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          packX(nx * 26);
          packY(ny * 16);
          typeX(nx * -14);
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });

      // Scroll-out: type lifts faster than the product, light dims.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
        .to(q("[data-type-layer]"), { yPercent: -28, ease: "none" }, 0)
        .to(q("[data-scroll-pack]"), { yPercent: 14, scale: 0.94, ease: "none" }, 0)
        .to(q("[data-light]"), { autoAlpha: 0.3, ease: "none" }, 0)
        .to(q("[data-fade-out]"), { autoAlpha: 0, y: -40, ease: "none" }, 0);

      return () => {
        off();
        mm.revert();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-obsidian pt-[4.5rem] md:pt-24"
    >
      {/* Environment: studio light, column rules, floor */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          data-light
          className="absolute left-1/2 top-[-10%] h-[120%] w-[110vw] -translate-x-1/2 lg:left-[60%] lg:w-[80vw]"
          style={{ background: "radial-gradient(50% 45% at 50% 42%, rgba(243,242,237,0.13) 0%, rgba(243,242,237,0.04) 45%, transparent 75%)" }}
        />
        <div className="shell absolute inset-0 hidden grid-cols-6 lg:grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="border-l border-warm/[0.045] last:border-r" />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent" />
      </div>

      <h1 id="hero-title" className="sr-only">
        Outwork yesterday. HV Nutrition Whey Protein.
      </h1>

      {/* Layer 1: wall of type, behind the product */}
      <div data-type-layer aria-hidden className="relative z-0 mt-[6vh] lg:mt-[3vh]">
        <p data-word data-hero-hide className="display flex justify-center overflow-hidden text-[27.5vw] leading-[0.8] text-warm lg:text-[25vw]">
          {"OUTWORK".split("").map((c, i) => (
            <span key={i} className="inline-block">
              {c}
            </span>
          ))}
        </p>
      </div>

      {/* Layer 2: the product */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[36svh] top-[21svh] z-10 flex justify-center lg:bottom-[4vh] lg:left-[40%] lg:right-[12%] lg:top-[16vh] xl:left-[22%] xl:right-[10%]">
        <div data-scroll-pack className="relative h-full w-full">
          <div data-parallax className="relative h-full w-full">
            <div data-hero-pack data-hero-hide className="relative h-full w-full">
              <div data-float className="relative h-full w-full">
                <Image
                  src={p.images[0].src}
                  alt={p.images[0].alt}
                  fill
                  priority
                  quality={90}
                  sizes="(min-width: 1024px) 60vw, 90vw"
                  className="object-contain object-bottom drop-shadow-[0_40px_60px_rgba(0,0,0,0.65)]"
                />
              </div>
            </div>
            <div
              data-shadow
              data-hero-hide
              aria-hidden
              className="absolute -bottom-3 left-1/2 h-10 w-[46%] -translate-x-1/2 rounded-[50%] bg-black/90 blur-2xl lg:w-[34%]"
            />
          </div>
        </div>
      </div>

      {/* Layer 3: foreground copy */}
      <div data-fade-out className="shell relative z-20 mt-auto grid grid-cols-1 items-end gap-8 pb-8 lg:grid-cols-12 lg:pb-10">
        <div className="lg:col-span-6 xl:col-span-5">
          <p data-line2 data-hero-hide aria-hidden className="display overflow-hidden text-center text-[18vw] text-lime sm:text-[15vw] lg:text-left lg:text-[8.5vw]">
            <span className="block">
              Yesterday.
            </span>
          </p>
          <p data-fade data-hero-hide className="mt-4 max-w-sm text-[0.95rem] lg:mt-5 leading-relaxed text-soft/80">
            HV Whey Protein — our own tub, made for the rep after the one you thought was your last.
          </p>
          <div data-fade data-hero-hide className="mt-6 flex flex-col flex-wrap gap-3 xs:flex-row lg:mt-7">
            <LinkButton href={`/products/${p.slug}`} className="shrink-0 max-md:h-12">Shop HV Protein</LinkButton>
            <LinkButton href="/shop" variant="ghost" className="shrink-0 max-md:h-12">
              Explore collection
            </LinkButton>
          </div>
        </div>

        <div data-fade data-hero-hide className="hidden lg:col-span-2 lg:col-start-11 lg:block"><dl className="flex flex-col">
          {p.labelStats.map((s) => (
            <div key={s.label} className="relative flex items-baseline justify-between py-2.5">
              <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-warm/20" />
              <dt className="eyebrow text-mute">{s.label}</dt>
              <dd className="font-mono text-sm text-warm">
                {s.value}
                {s.unit}
              </dd>
            </div>
          ))}
          </dl>
          <p className="eyebrow mt-2 leading-relaxed text-mute/70">As printed on the pack · Chocolate · 1kg</p>
        </div>
      </div>

      {/* Scroll cue */}
      <div data-fade data-hero-hide aria-hidden className="absolute right-[var(--gutter)] top-[42%] z-20 hidden flex-col items-center gap-3 lg:flex">
        <span className="eyebrow text-mute [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-warm/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_cubic-bezier(0.76,0,0.24,1)_infinite] bg-lime" />
        </span>
      </div>
    </section>
  );
}
