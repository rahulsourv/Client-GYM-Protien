"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const GOLD = "linear-gradient(180deg, #ffd23f 0%, #ffb300 55%, #ff9800 100%)";
const WORD = "NUTRITION".split("");

/**
 * First-visit loading screen (once per session): "High Voltage" charging up.
 * The meter is never fake: it tracks fonts + the hero packshot actually
 * loading, and is capped at ~1.3s so a slow network never holds the page.
 *
 * Visibility is decided before paint by the inline script in layout.jsx,
 * which sets <html data-intro="play">. Without JS the screen never shows.
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

    let cancelled = false;
    // A context records every tween so cleanup (e.g. React's dev double-run)
    // rewinds them all and the next run starts from a clean slate.
    const ctx = gsap.context(() => {}, el);

    const q = gsap.utils.selector(el);
    const letters = q("[data-letter]");
    const bolt = q("[data-bolt]");
    const word = q("[data-word]");
    const bar = q("[data-bar]");
    const pct = q("[data-pct]")[0];
    const progress = { v: 0 };
    const paint = () => {
      gsap.set(bar, { scaleX: progress.v });
      pct.textContent = `${Math.round(progress.v * 100)}%`;
    };

    let entered;
    const entrance = new Promise((res) => (entered = res));
    ctx.add(() => {
      // Entrance: letters drop in stretched and land with a squash; the bolt
      // winds up, pops past full size and flickers like a live current.
      gsap
        .timeline({ onComplete: entered })
        .from(letters, { yPercent: 120, scaleY: 1.35, scaleX: 0.85, duration: 0.55, stagger: 0.08, ease: "power3.in" })
        .to(letters, { scaleY: 0.86, scaleX: 1.1, duration: 0.09, stagger: 0.08, ease: "power1.out" }, ">-0.08")
        .to(letters, { scaleY: 1, scaleX: 1, duration: 0.4, stagger: 0.06, ease: "elastic.out(1, 0.45)" })
        .fromTo(bolt, { scale: 0, rotate: -40, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: "back.out(2.6)" }, 0.35)
        .to(bolt, { opacity: 0.35, duration: 0.05, repeat: 3, yoyo: true, ease: "none" }, ">-0.1")
        .from(word, { yPercent: 100, opacity: 0, duration: 0.5, stagger: 0.035, ease: "expo.out" }, 0.45);
      gsap.to(q("[data-glow]"), { opacity: 0.55, scale: 1.08, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(progress, { v: 0.85, duration: 1.4, ease: "power1.out", onUpdate: paint });
    });

    // Real readiness: fonts + the hero packshot, capped so a slow network
    // never holds the page. The exit also waits for the entrance to land.
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

    Promise.all([Promise.race([ready, cap]), entrance]).then(() => {
      if (cancelled) return;
      ctx.add(() => {
        gsap
          .timeline({ delay: 0.1 })
          .to(progress, { v: 1, duration: 0.35, ease: "power2.inOut", onUpdate: paint, overwrite: true })
          // Fully charged: the bolt flashes, the letters squash down, then the
          // screen splits open from the middle.
          .to(bolt, { scale: 1.5, filter: "brightness(2.2) drop-shadow(0 0 28px #ffb300)", duration: 0.18, ease: "power2.out" })
          .to(bolt, { scale: 0, opacity: 0, duration: 0.3, ease: "back.in(2)" })
          .to(letters, { scaleY: 0.2, scaleX: 1.3, yPercent: 40, opacity: 0, duration: 0.35, stagger: 0.04, ease: "back.in(1.8)" }, "<")
          .to(word, { opacity: 0, y: -10, duration: 0.25, stagger: 0.01 }, "<")
          .add(signal, "-=0.1")
          .to(el, { clipPath: "inset(50% 0% 50% 0%)", duration: 0.8, ease: "expo.inOut" }, "<0.05")
          .add(() => (html.dataset.intro = "done"));
      });
    });
    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="intro palette-fixed fixed inset-0 z-[100] hidden flex-col items-center justify-center overflow-hidden bg-obsidian"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div
        data-glow
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(42% 36% at 50% 46%, rgba(255,179,0,0.35), transparent 72%)" }}
      />
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative flex items-end">
        <div
          className="flex overflow-hidden px-[0.06em] pb-[0.06em] font-display text-[34vw] font-black italic leading-[0.85] tracking-[-0.06em] sm:text-[11rem] md:text-[13rem]"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          {["H", "V"].map((l) => (
            <span
              key={l}
              data-letter
              className="block origin-bottom bg-clip-text pr-[0.06em] text-transparent"
              style={{ backgroundImage: GOLD }}
            >
              {l}
            </span>
          ))}
        </div>
        <svg
          data-bolt
          viewBox="0 0 24 40"
          className="absolute -right-[4%] top-[2%] w-[13vw] drop-shadow-[0_0_14px_rgba(255,179,0,0.7)] sm:w-16 md:w-20"
        >
          <path d="M15 0 L2 23 H11 L7.5 40 L22 15 H13 Z" fill="#fff3c4" stroke="#ffb300" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="mt-1 flex overflow-hidden font-display text-[5.5vw] font-bold tracking-[0.42em] text-warm sm:text-2xl" style={{ fontVariationSettings: '"wdth" 112' }}>
        {WORD.map((c, i) => (
          <span key={i} data-word className="block">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-3">
        <div className="relative h-[3px] w-44 overflow-hidden rounded-full bg-line sm:w-56">
          <div data-bar className="absolute inset-0 origin-left scale-x-0 rounded-full bg-lime shadow-[0_0_14px_#ffb300]" />
        </div>
        <span data-pct className="w-10 font-mono text-xs tabular-nums text-warm">
          0%
        </span>
      </div>
      <p className="eyebrow mt-4 text-mute">Charging up · Uttarpara</p>
    </div>
  );
}
