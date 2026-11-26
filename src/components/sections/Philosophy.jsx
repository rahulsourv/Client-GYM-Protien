"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Placeholder from "@/components/ui/Placeholder";

// DRAFT brand statement — not an official HV Nutrition philosophy. Edit freely.
const statement = "The work doesn’t stop at the gym. It’s in what you eat, when you sleep, and what you put in the shaker.";

// DRAFT copy for the three beats the shaker acts out.
const beats = [
  { n: "01", title: "Fill", body: "Good habits start simple. Water, a scoop, a lid." },
  { n: "02", title: "Shake", body: "Consistency is the work. Show up, shake it, repeat." },
  { n: "03", title: "Refuel", body: "Then get back to it. Tomorrow, you outwork today." },
];

/**
 * 09 — Brand philosophy, the last word before the footer. The page turns to
 * paper; a shaker on the right fills, shakes and opens as you scroll.
 */
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

      // The shaker routine, scrubbed by scroll.
      const mm = gsap.matchMedia();
      const build = (scrollTrigger) => {
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { ...scrollTrigger, scrub: 0.8 } });
        const steps = q("[data-step]");
        gsap.set(q("[data-shaker]"), { svgOrigin: "120 330" });
        gsap.set(q("[data-lid]"), { svgOrigin: "120 90" });
        gsap.set(q("[data-stream]"), { transformOrigin: "50% 0%" });
        // Scoop rolls over along its rim line (x axis), so the opening turns to face down.
        gsap.set(q("[data-scoop-tilt]"), { svgOrigin: `${SCOOP_LIP.x + 30} ${SCOOP_LIP.y}` });

        // Start state: empty cup, lid off, scoop waiting out of frame.
        tl.set(steps, { opacity: 0.3 }, 0)
          .set(q("[data-powder]"), { opacity: 0 }, 0)
          .set(steps[0], { opacity: 1 }, 0)
          .fromTo(q("[data-progress]"), { scaleX: 0 }, { scaleX: 1, duration: 10 }, 0)
          .fromTo(q("[data-shaker]"), { y: 40, rotation: 4 }, { y: 0, rotation: 0, duration: 1.2, ease: "power2.out" }, 0)
          .fromTo(q("[data-lid]"), { y: -70, opacity: 0 }, { y: -70, opacity: 0, duration: 0.01 }, 0)
          // 01 Fill — water pours, the level rises, the scoop drops in.
          .fromTo(q("[data-stream]"), { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.4 }, 0.2)
          .fromTo(q("[data-liquid]"), { y: 330 }, { y: 0, duration: 2.8, ease: "power1.out" }, 0.3)
          .fromTo(q("[data-fill]"), { attr: { fill: "#dcd6ca" } }, { attr: { fill: "#dcd6ca" }, duration: 0.01 }, 0)
          .to(q("[data-stream]"), { opacity: 0, duration: 0.3 }, 3)
          // A heaped scoop swings in, tips over the opening, and the powder pours out of its lip.
          .fromTo(q("[data-scoop]"), { x: 200, y: -30, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 2.4)
          .fromTo(q("[data-scoop-tilt]"), { scaleY: 1 }, { scaleY: -1, duration: 0.5, ease: "power2.inOut" }, 3)
          .fromTo(q("[data-mound]"), { opacity: 1 }, { opacity: 0, duration: 0.4 }, 3.25)
          .fromTo(
            q("[data-powder]"),
            {
              opacity: 1,
              // Spill from along the whole upturned rim, not from a single point.
              x: (i, el) => SCOOP_LIP.x + 4 + ((i * 13) % 52) - Number(el.getAttribute("cx")),
              y: (i, el) => SCOOP_LIP.y - Number(el.getAttribute("cy")) + (i % 3) * 3,
            },
            { x: 0, y: 0, duration: 0.7, ease: "power2.in", stagger: 0.015, immediateRender: false },
            3.25
          )
          .to(q("[data-scoop-tilt]"), { scaleY: 1, duration: 0.35, ease: "power2.inOut" }, 3.95)
          .to(q("[data-scoop]"), { x: 200, y: -30, opacity: 0, duration: 0.45, ease: "power2.in" }, 4.15)
          // Lid goes on.
          .to(q("[data-lid]"), { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 4.7)
          // 02 Shake.
          .to(steps[0], { opacity: 0.3, duration: 0.2 }, 5.3)
          .to(steps[1], { opacity: 1, duration: 0.2 }, 5.3)
          .to(q("[data-shaker]"), {
            keyframes: [
              { rotation: 16, y: -24 },
              { rotation: -16, y: 0 },
              { rotation: 14, y: -20 },
              { rotation: -14, y: 0 },
              { rotation: 9, y: -12 },
              { rotation: -6, y: 0 },
              { rotation: 0, y: 0 },
            ],
            duration: 3,
            ease: "sine.inOut",
          }, 5.4)
          .fromTo(q("[data-wave]"), { x: 0 }, { x: -240, duration: 3.2 }, 5.4)
          .to(q("[data-powder]"), { opacity: 0, duration: 1.6, stagger: 0.02 }, 5.6)
          .to(q("[data-fill]"), { attr: { fill: "#5b3a28" }, duration: 2.4 }, 5.6)
          .fromTo(q("[data-foam]"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.8, stagger: 0.05, transformOrigin: "50% 50%" }, 7.6)
          // 03 Refuel — the spout flips open.
          .to(steps[1], { opacity: 0.3, duration: 0.2 }, 8.4)
          .to(steps[2], { opacity: 1, duration: 0.2 }, 8.4)
          .fromTo(q("[data-spout]"), { rotation: 0 }, { rotation: -120, duration: 0.8, ease: "back.out(1.6)", svgOrigin: "152 40" }, 8.6)
          .fromTo(q("[data-ready]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 9.2)
          .to({}, { duration: 0.8 }, 9.2);
        return tl;
      };

      mm.add("(min-width: 768px)", () => {
        build({ trigger: root.current, start: "top 25%", end: "bottom bottom" });
      });
      mm.add("(max-width: 767px)", () => {
        build({ trigger: q("[data-beats]")[0], start: "top 90%", end: "bottom 70%" });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="philosophy-title" className="palette-fixed relative bg-warm text-obsidian">
      <div className="shell grid grid-cols-1 md:grid-cols-12 md:gap-x-8">
        <div className="pt-24 md:col-span-7 md:row-start-1 md:pt-40">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow text-obsidian/60">(09) Philosophy</span>
            <Placeholder className="text-obsidian/60">Draft copy — edit in Philosophy.jsx</Placeholder>
          </div>
          <h2 id="philosophy-title" data-statement className="display mt-10 max-w-[16ch] text-[13vw] leading-[0.88] md:mt-16 md:text-[6.4vw]">
            {statement.split(" ").map((w, i) => (
              <span key={i} data-word className="inline-block pr-[0.22em]">
                {w}
              </span>
            ))}
          </h2>
        </div>

        {/* The shaker: sticky on the right (desktop) / pinned under the header strip (mobile). */}
        <div className="sticky top-0 z-10 -mx-[var(--gutter)] flex h-[58svh] flex-col items-center justify-center bg-warm px-[var(--gutter)] md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:mx-0 md:h-svh md:self-start md:bg-transparent md:px-0 md:pb-6 md:pt-24">
          <Shaker />
          <div className="mt-4 w-full max-w-[300px] md:mt-8">
            <div className="flex justify-between">
              {beats.map((b) => (
                <span key={b.n} data-step className="eyebrow text-obsidian">
                  {b.n} {b.title}
                </span>
              ))}
            </div>
            <div className="mt-2 h-px bg-obsidian/15">
              <div data-progress className="h-px origin-left bg-obsidian" />
            </div>
          </div>
        </div>

        <div data-beats className="pb-24 md:col-span-6 md:row-start-2 md:pb-40">
          {beats.map((b) => (
            <div key={b.n} className="flex min-h-[48svh] flex-col justify-center border-t border-obsidian/15 py-10 md:min-h-[78svh]">
              <div data-reveal="fade">
                <span className="font-mono text-xs text-obsidian/50">{b.n}</span>
                <p className="display mt-3 text-[16vw] md:text-[7vw]">{b.title}</p>
                <p className="mt-4 max-w-sm text-[1.02rem] leading-relaxed text-obsidian/70">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Shaker illustration ───────────────────────── */

// Sine-topped liquid shape, wider than the cup so it can slide sideways.
function wavePath(baseY) {
  const period = 120;
  const amp = 6;
  let d = `M -240 ${baseY}`;
  for (let x = -240; x < 480; x += period) {
    d += ` q ${period / 4} ${-amp} ${period / 2} 0 t ${period / 2} 0`;
  }
  return `${d} L 480 520 L -240 520 Z`;
}

// The scoop's rim: left end x, rim line y — just above the cup opening.
const SCOOP_LIP = { x: 132, y: 42 };

// Deterministic "random" powder specks (same on server and client).
const powder = Array.from({ length: 26 }, (_, i) => {
  // Rounded so server and browser floating-point output match exactly.
  const r = (n) => Math.round(((Math.sin((i + 1) * n) + 1) / 2) * 100) / 100;
  return {
    cx: Math.round(56 + r(12.9898) * 128),
    cy: Math.round(210 + r(78.233) * 110),
    r: Math.round((2.2 + r(3.7) * 2.6) * 10) / 10,
  };
});

const foam = [70, 92, 112, 133, 152, 172].map((cx, i) => ({ cx, cy: 176 + (i % 2) * 3, r: 5 + (i % 3) * 2 }));

const CUP = "M24 112 L216 112 L202 488 Q200 504 184 504 L56 504 Q40 504 38 488 Z";
const INNER = "M30 116 L210 116 L196.5 484 Q195 498 182 498 L58 498 Q45 498 43.5 484 Z";

function Shaker() {
  return (
    <div className="relative w-[min(44vw,calc((58svh-80px)*0.4375))] md:w-[min(30vw,320px,calc((100svh-230px)*0.4375))] lg:w-[min(22vw,320px,calc((100svh-230px)*0.4375))]">
      <svg
        viewBox="-20 -100 280 640"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label="Illustration of a protein shaker being filled, shaken and opened"
      >
        <defs>
          <clipPath id="shaker-inner">
            <path d={INNER} />
          </clipPath>
          <linearGradient id="shaker-glass" x1="0" x2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="1" stopColor="#090909" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Floor shadow */}
        <ellipse cx="120" cy="522" rx="96" ry="10" fill="#090909" opacity="0.12" />

        <g data-shaker>
          {/* Pour stream */}
          <rect data-stream x="114" y="-120" width="10" height="600" rx="5" fill="#cfc8ba" opacity="0" />

          {/* Liquid + powder, clipped to the cup */}
          <g clipPath="url(#shaker-inner)">
            <rect x="0" y="0" width="240" height="520" fill="#090909" opacity="0.03" />
            <g data-liquid>
              <path data-wave data-fill d={wavePath(178)} fill="#5b3a28" />
              {foam.map((f, i) => (
                <circle key={i} data-foam cx={f.cx} cy={f.cy} r={f.r} fill="#e8dccb" />
              ))}
            </g>
          </g>
          {powder.map((p, i) => (
            <circle key={i} data-powder cx={p.cx} cy={p.cy} r={p.r} fill="#a47b58" opacity="0" />
          ))}

          {/* Scoop: slides in, tips at its lip, slides back out */}
          <g data-scoop opacity="0">
            <g data-scoop-tilt>
              <rect x="186" y="42" width="78" height="11" rx="5.5" fill="#191919" />
              <path d="M132 42 L192 42 L188 80 Q186 92 174 92 L150 92 Q138 92 136 80 Z" fill="#090909" />
              <path d="M138 48 L140 78" stroke="#f3f2ed" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
              <g data-mound>
                <path d="M134 42 Q162 20 190 42 Z" fill="#a47b58" />
                <circle cx="150" cy="36" r="2.4" fill="#8a6446" />
                <circle cx="168" cy="32" r="2" fill="#8a6446" />
                <circle cx="178" cy="38" r="2.2" fill="#8a6446" />
              </g>
            </g>
          </g>

          {/* Glass body */}
          <path d={CUP} fill="url(#shaker-glass)" stroke="#090909" strokeWidth="3" strokeLinejoin="round" />
          <path d="M44 132 L56 470" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" />
          {/* Measure marks */}
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <line x1="184" x2={k % 2 ? 196 : 190} y1={190 + k * 62} y2={190 + k * 62} stroke="#090909" strokeOpacity="0.55" strokeWidth="2" />
              <text x="178" y={194 + k * 62} textAnchor="end" className="font-mono" fontSize="11" fill="#090909" fillOpacity="0.55">
                {500 - k * 100}
              </text>
            </g>
          ))}
          <text x="178" y="168" textAnchor="end" className="font-mono" fontSize="10" fill="#090909" fillOpacity="0.45">
            ML
          </text>

          {/* Lid */}
          <g data-lid>
            <rect x="16" y="78" width="208" height="40" rx="7" fill="#090909" />
            {[40, 64, 88, 112, 136, 160, 184].map((x) => (
              <line key={x} x1={x + 6} x2={x + 6} y1="86" y2="110" stroke="#f3f2ed" strokeOpacity="0.14" strokeWidth="3" />
            ))}
            <path d="M34 80 Q36 46 78 40 L162 40 Q204 46 206 80 Z" fill="#191919" />
            {/* Spout cap, hinged at its left edge */}
            <g data-spout>
              <rect x="150" y="26" width="52" height="18" rx="6" fill="#090909" />
              <rect x="190" y="30" width="18" height="6" rx="3" fill="#ffb300" />
            </g>
          </g>
        </g>
      </svg>
      <span data-ready className="eyebrow absolute -right-2 top-[22%] bg-lime px-2 py-1 text-obsidian md:-right-10">
        Ready
      </span>
    </div>
  );
}
