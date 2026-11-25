"use client";

import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Declarative scroll reveals. Call inside useGSAP({ scope }) — selectors are
 * scoped and everything is reverted on unmount.
 *
 *   data-reveal="lines"  children `.line-mask > *` rise from the mask
 *   data-reveal="fade"   fade + lift
 *   data-reveal="clip"   wipes open bottom → top
 *   data-reveal="rule"   hairline draws left → right
 *   data-reveal-delay="0.2"
 */
export function setupReveals() {
  if (prefersReducedMotion()) return;
  const make = (el, vars) => {
    const delay = Number(el.dataset.revealDelay ?? 0);
    gsap.from(el.dataset.reveal === "lines" ? el.querySelectorAll(".line-mask > *") : el, {
      ...vars,
      delay,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  };
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    switch (el.dataset.reveal) {
      case "lines":
        make(el, { yPercent: 110, duration: 1.3, stagger: 0.08, ease: "expo.out" });
        break;
      case "fade":
        make(el, { y: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out" });
        break;
      case "clip":
        make(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
        break;
      case "rule":
        make(el, { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "expo.inOut" });
        break;
    }
  });
}

/** Stagger-in groups of cards as they enter. */
export function batchReveal(selector) {
  if (prefersReducedMotion()) return;
  gsap.set(selector, { autoAlpha: 0, y: 50 });
  ScrollTrigger.batch(selector, {
    start: "top 92%",
    once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", overwrite: true }),
  });
}

/** Run `cb` after the first-visit intro has lifted (or immediately). */
export function onIntroDone(cb) {
  if (typeof window === "undefined") return () => {};
  if (window.__hvIntroDone || document.documentElement.dataset.intro !== "play") {
    cb();
    return () => {};
  }
  const h = () => cb();
  window.addEventListener("hv:intro-done", h, { once: true });
  return () => window.removeEventListener("hv:intro-done", h);
}
