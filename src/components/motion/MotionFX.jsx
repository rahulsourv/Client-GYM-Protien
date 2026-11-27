"use client";

import { useEffect } from "react";

// (4) pose to pose: low and tilted → overshoot (stretch) → settle → rest.
const POSES = [
  { opacity: 0, transform: "translateY(48px) rotate(-2.5deg) scale(0.94, 0.96)", offset: 0 },
  { opacity: 1, transform: "translateY(-8px) rotate(0.8deg) scale(1.01, 1.03)", offset: 0.55 },
  { opacity: 1, transform: "translateY(2px) rotate(-0.3deg) scale(1.005, 0.995)", offset: 0.78 },
  { opacity: 1, transform: "none", offset: 1 },
];

/**
 * Site-wide interaction motion (styles live in globals.css under MOTION PRINCIPLES):
 *  - (10) a ripple bursts from the tap point on every `.press` element
 *  - (4)  `[data-pose]` elements below the fold play their pose-to-pose entrance
 *         just before they scroll into view. Runs through the Web Animations
 *         API so React-rendered markup is never modified (no hydration
 *         mismatches); anything already on screen is left alone.
 * Does nothing for visitors who prefer reduced motion.
 */
export default function MotionFX() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerDown = (event) => {
      const el = event.target.closest?.(".press");
      if (!el || el.disabled || el.getAttribute("aria-disabled") === "true") return;
      const box = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "fx-ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.left = `${event.clientX - box.left}px`;
      ripple.style.top = `${event.clientY - box.top}px`;
      // Scale so the ripple covers the farthest corner of the element.
      ripple.style.setProperty("--fx-r", String(Math.ceil(Math.hypot(box.width, box.height) / 6) + 2));
      el.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };
    document.addEventListener("pointerdown", onPointerDown, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          io.unobserve(el);
          const i = Number(getComputedStyle(el).getPropertyValue("--i")) || 0;
          // fill "backwards" holds the first pose during the stagger delay.
          el.animate(POSES, { duration: 900, delay: i * 70, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" });
        }
      },
      // Start just before the card enters, so its first pose is never seen popping in.
      { rootMargin: "0px 0px 6% 0px" }
    );
    const seen = new WeakSet();
    const scan = () => {
      for (const el of document.querySelectorAll("[data-pose]")) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (el.getBoundingClientRect().top < window.innerHeight) continue;
        io.observe(el);
      }
    };
    scan();
    // Product grids stream in and re-render (filters, client navigation).
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (!queued) queued = requestAnimationFrame(() => ((queued = 0), scan()));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(queued);
    };
  }, []);

  return null;
}
