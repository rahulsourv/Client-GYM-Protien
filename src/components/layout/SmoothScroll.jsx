"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis";

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one clock. Disabled entirely for reduced-motion users (native scroll).
 * Touch devices keep native scrolling (Lenis default: syncTouch false).
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Sections that stream in after load (e.g. the live catalog) push pinned
  // sections like the shaker further down. Re-measure whenever the page height
  // changes, otherwise their pins fire at stale positions and show a blank screen.
  useEffect(() => {
    let lastHeight = document.body.scrollHeight;
    let timer;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const height = document.body.scrollHeight;
        if (height === lastHeight) return;
        ScrollTrigger.refresh();
        lastHeight = document.body.scrollHeight;
      }, 150);
    });
    observer.observe(document.body);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // New route → start at the top and let triggers re-measure.
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
