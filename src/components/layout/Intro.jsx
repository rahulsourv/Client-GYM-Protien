"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * First-visit intro (once per session). It is never a fake progress bar: the
 * line tracks fonts + the hero packshot actually loading, and is capped at
 * ~1.3s so a slow network never holds the page hostage.
 *
 * Visibility is decided before paint by the inline script in layout.jsx,
 * which sets <html data-intro="play">. Without JS the intro never shows.
 * When done it sets window.__hvIntroDone and fires "hv:intro-done".
 */
export default function Intro() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    const signal = () => {
      window.__hvIntroDone = true;
      window.dispatchEvent(new Event("hv:intro-done"));
    };
    const finish = () => {
      html.dataset.intro = "done";
      signal();
    };
    if (html.dataset.intro !== "play" || !el) return finish();
    try {
      sessionStorage.setItem("hv-intro", "1");
    } catch {}
    if (prefersReducedMotion()) return finish();

    const bar = el.querySelector("[data-bar]");
    const letters = el.querySelectorAll("[data-letter]");
    const progress = { v: 0 };

    const tl = gsap.timeline();
    tl.from(letters, { yPercent: 110, duration: 0.9, stagger: 0.06, ease: "expo.out" });

    const ready = Promise.all([
      document.fonts?.ready,
      new Promise((res) => {
        const img = document.querySelector("[data-hero-pack] img");
        if (!img || img.complete) return res();
        img.addEventListener("load", res, { once: true });
        img.addEventListener("error", res, { once: true });
      }),
    ]);
    const cap = new Promise((res) => setTimeout(res, 1300));
    gsap.to(progress, { v: 0.7, duration: 0.8, ease: "power2.out", onUpdate: () => gsap.set(bar, { scaleX: progress.v }) });

    let cancelled = false;
    Promise.race([ready, cap]).then(() => {
      if (cancelled) return;
      gsap
        .timeline({ delay: 0.15 })
        .to(progress, { v: 1, duration: 0.35, ease: "power2.inOut", onUpdate: () => gsap.set(bar, { scaleX: progress.v }) })
        .to(letters, { yPercent: -110, duration: 0.6, stagger: 0.03, ease: "expo.in" }, "<0.1")
        .add(signal, "-=0.15")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "<")
        .add(() => (html.dataset.intro = "done"));
    });
    return () => {
      cancelled = true;
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="intro fixed inset-0 z-[100] hidden flex-col items-center justify-center bg-obsidian"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <div className="flex overflow-hidden font-display text-[22vw] font-black italic leading-[0.85] tracking-[-0.06em] text-warm md:text-[12rem]" style={{ fontVariationSettings: '"wdth" 100' }}>
        <span data-letter className="block pr-[0.04em]">H</span>
        <span data-letter className="block pr-[0.04em]">V</span>
      </div>
      <div className="mt-8 h-px w-40 overflow-hidden bg-line">
        <div data-bar className="h-full w-full origin-left scale-x-0 bg-lime" />
      </div>
      <p className="eyebrow mt-4 text-mute">Nutrition · Uttarpara</p>
    </div>
  );
}
