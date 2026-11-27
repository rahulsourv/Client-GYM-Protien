"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
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
 * 08 — Brand philosophy, the last word before the footer. The page turns to
 * paper; a shaker on the right fills, shakes and opens as you scroll.
 */
export default function Philosophy() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      // The shaker routine, scrubbed by scroll.
      const mm = gsap.matchMedia();
      const build = (scrollTrigger) => {
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { ...scrollTrigger, scrub: 0.8 } });
        const steps = q("[data-step]");
        const caps = q("[data-caption]");
        // The shaker's tilt is written straight into its SVG transform, always pivoting
        // low in the cup — GSAP's origin smoothing otherwise drifts it sideways.
        const shakerEl = q("[data-shaker]")[0];
        const sh = { r: 4, y: 40 };
        const drawShaker = () => shakerEl.setAttribute("transform", `translate(0 ${sh.y}) rotate(${sh.r} ${SHAKER_ORIGIN})`);
        drawShaker();
        gsap.set(q("[data-lid]"), { svgOrigin: "120 90" });
        gsap.set(q("[data-stream]"), { transformOrigin: "50% 0%" });
        gsap.set(q("[data-pour]"), { svgOrigin: "154 44" });
        gsap.set(q("[data-heap]"), { svgOrigin: HEAP_ORIGIN });
        // Scoop rolls over along its rim line (x axis), so the opening turns to face down.
        gsap.set(q("[data-scoop-tilt]"), { svgOrigin: `${SCOOP_LIP.x + 30} ${SCOOP_LIP.y}` });

        // Start state: empty cup, lid off, scoop waiting out of frame.
        tl.set(steps, { opacity: 0.3 }, 0)
          .set(q("[data-pour], [data-heap]"), { opacity: 0 }, 0)
          .set(steps[0], { opacity: 1 }, 0)
          .set(caps, { autoAlpha: 0, y: 8 }, 0)
          .set(caps[0], { autoAlpha: 1, y: 0 }, 0)
          .fromTo(q("[data-progress]"), { scaleX: 0 }, { scaleX: 1, duration: 10 }, 0)
          .fromTo(sh, { r: 4, y: 40 }, { r: 0, y: 0, duration: 1.2, ease: "power2.out", onUpdate: drawShaker }, 0)
          .fromTo(q("[data-lid]"), { y: -70, opacity: 0 }, { y: -70, opacity: 0, duration: 0.01 }, 0)
          // 01 Fill — water pours, the level rises, the scoop drops in.
          .fromTo(q("[data-stream]"), { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.4 }, 0.2)
          .fromTo(q("[data-liquid]"), { y: 330 }, { y: 0, duration: 2.8, ease: "power1.out" }, 0.3)
          .fromTo(q("[data-fill]"), { attr: { fill: "#dcd6ca" } }, { attr: { fill: "#dcd6ca" }, duration: 0.01 }, 0)
          .to(q("[data-stream]"), { opacity: 0, duration: 0.3 }, 3)
          // A heaped scoop swings in, tips over the opening, and the powder pours out of its lip.
          .fromTo(q("[data-scoop]"), { x: 200, y: -30, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 2.4)
          .fromTo(q("[data-scoop-tilt]"), { scaleY: 1, svgOrigin: TILT_ORIGIN }, { scaleY: -1, svgOrigin: TILT_ORIGIN, duration: 0.5, ease: "power2.inOut" }, 3)
          .fromTo(q("[data-mound]"), { opacity: 1 }, { opacity: 0, duration: 0.5 }, 3.3)
          // A solid stream of powder falls from the lip to the water…
          .fromTo(q("[data-pour]"), { opacity: 0, scaleY: 0 }, { opacity: 0.95, scaleY: 1, duration: 0.35, ease: "power1.in", immediateRender: false }, 3.3)
          .to(q("[data-pour]"), { opacity: 0, scaleY: 0.2, duration: 0.35, ease: "power1.in" }, 4.25)
          // …and piles up on the surface until it's shaken in.
          .fromTo(q("[data-heap]"), { opacity: 0, scaleX: 0.25, scaleY: 0, svgOrigin: HEAP_ORIGIN }, { opacity: 1, scaleX: 1, scaleY: 1, svgOrigin: HEAP_ORIGIN, duration: 1.1, ease: "power1.out", immediateRender: false }, 3.55)
          .to(q("[data-scoop-tilt]"), { scaleY: 1, svgOrigin: TILT_ORIGIN, duration: 0.35, ease: "power2.inOut" }, 4.45)
          .to(q("[data-scoop]"), { x: 200, y: -30, opacity: 0, duration: 0.45, ease: "power2.in" }, 4.65)
          // Lid goes on.
          .to(q("[data-lid]"), { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, 4.9)
          // 02 Shake.
          .to(steps[0], { opacity: 0.3, duration: 0.2 }, 5.3)
          .to(steps[1], { opacity: 1, duration: 0.2 }, 5.3)
          .to(caps[0], { autoAlpha: 0, y: -8, duration: 0.2 }, 5.3)
          .to(caps[1], { autoAlpha: 1, y: 0, duration: 0.25 }, 5.45)
          .to(sh, {
            keyframes: [
              { r: 16, y: -24 },
              { r: -16, y: 0 },
              { r: 14, y: -20 },
              { r: -14, y: 0 },
              { r: 9, y: -12 },
              { r: -6, y: 0 },
              { r: 0, y: 0 },
            ],
            duration: 3,
            ease: "sine.inOut",
            onUpdate: drawShaker,
          }, 5.4)
          .fromTo(q("[data-wave]"), { x: 0 }, { x: -240, duration: 3.2 }, 5.4)
          .to(q("[data-heap]"), { opacity: 0, scaleX: 1.4, scaleY: 0.4, svgOrigin: HEAP_ORIGIN, duration: 1.4 }, 5.6)
          .to(q("[data-fill]"), { attr: { fill: "#5b3a28" }, duration: 2.4 }, 5.6)
          .fromTo(q("[data-foam]"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.8, stagger: 0.05, transformOrigin: "50% 50%" }, 7.6)
          // 03 Refuel — the spout flips open.
          .to(steps[1], { opacity: 0.3, duration: 0.2 }, 8.4)
          .to(steps[2], { opacity: 1, duration: 0.2 }, 8.4)
          .to(caps[1], { autoAlpha: 0, y: -8, duration: 0.2 }, 8.4)
          .to(caps[2], { autoAlpha: 1, y: 0, duration: 0.25 }, 8.55)
          .fromTo(q("[data-spout]"), { rotation: 0 }, { rotation: -120, duration: 0.8, ease: "back.out(1.6)", svgOrigin: "152 40" }, 8.6)
          .fromTo(q("[data-ready]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 9.2)
          .to({}, { duration: 0.8 }, 9.2);
        return tl;
      };

      // The section pins full-screen; the whole routine plays across the pinned scroll.
      mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767px)" }, (ctx) => {
        const tl = build({
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (ctx.conditions.desktop ? 4 : 3.4)}`,
          pin: true,
          invalidateOnRefresh: true,
        });
        // Text column behind the shaker scrolls up from below the fold to above it.
        const col = q("[data-scroller]")[0];
        tl.fromTo(
          col,
          { y: () => window.innerHeight * 0.55 },
          { y: () => -(col.offsetHeight - window.innerHeight * 0.35), duration: 10, ease: "none" },
          0
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-labelledby="philosophy-title" className="palette-fixed relative h-svh overflow-hidden bg-warm text-obsidian">
      {/* Layer 1 — text that scrolls up behind the shaker */}
      <div aria-hidden={false} className="pointer-events-none absolute inset-0 z-0">
        <div data-scroller className="shell flex flex-col items-center text-center will-change-transform motion-reduce:pt-32">
          <h2 id="philosophy-title" className="display max-w-[16ch] text-[9vw] leading-[0.92] md:text-[5vw] lg:text-[4.4vw]">
            {statement}
          </h2>
          {beats.map((b, i) => (
            <div key={b.n} className="flex min-h-[85svh] flex-col items-center justify-center">
              <span className="font-mono text-xs text-obsidian/50">{b.n}</span>
              <p
                className={`display mt-2 text-[30vw] leading-[0.82] md:text-[19vw] ${
                  i === 1 ? "outline-text [--stroke:rgba(9,9,9,0.35)]" : "text-obsidian/[0.13]"
                }`}
              >
                {b.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top strip */}
      <div className="shell absolute inset-x-0 top-20 z-20 flex items-center justify-between gap-4 md:top-24">
        <span className="eyebrow text-obsidian/60">(08) Philosophy</span>
        <span className="hidden md:block">
          <Placeholder className="text-obsidian/60">Draft copy — edit in Philosophy.jsx</Placeholder>
        </span>
      </div>

      {/* Layer 2 — the shaker, centred */}
      <div className="absolute inset-0 z-10 flex -translate-y-[5svh] flex-col items-center justify-center">
        <Shaker />
        <div className="mt-4 w-[min(300px,80vw)] md:mt-6">
          <div className="flex justify-between">
            {beats.map((b) => (
              <span key={b.n} data-step className="eyebrow bg-warm/80 px-1 text-obsidian">
                {b.n} {b.title}
              </span>
            ))}
          </div>
          <div className="mt-2 h-px bg-obsidian/15">
            <div data-progress className="h-px origin-left bg-obsidian" />
          </div>
        </div>
        {/* Caption for the current beat, swapped as the steps change */}
        <div className="relative mt-3 h-12 w-[min(440px,88vw)] text-center">
          {beats.map((b, i) => (
            <p
              key={b.n}
              data-caption
              className={`absolute inset-x-0 top-0 text-[0.95rem] leading-snug text-obsidian/75 ${i === 0 ? "" : "opacity-0"}`}
            >
              {b.body}
            </p>
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
const TILT_ORIGIN = `${SCOOP_LIP.x + 30} ${SCOOP_LIP.y}`;
// The shaker rocks around a point low in the cup, like a hand holding it.
const SHAKER_ORIGIN = "120 330";
// The powder pile grows up from where the pour hits the water (bottom centre of the heap).
const HEAP_ORIGIN = "152 184";

// Falling column of powder from the scoop lip down to the water.
const POUR = "M140 44 Q154 40 168 44 L163 120 Q160 160 157 184 L149 184 Q146 160 143 120 Z";

const foam = [70, 92, 112, 133, 152, 172].map((cx, i) => ({ cx, cy: 176 + (i % 2) * 3, r: 5 + (i % 3) * 2 }));

const CUP = "M24 112 L216 112 L202 488 Q200 504 184 504 L56 504 Q40 504 38 488 Z";
const INNER = "M30 116 L210 116 L196.5 484 Q195 498 182 498 L58 498 Q45 498 43.5 484 Z";

function Shaker() {
  return (
    <div className="relative w-[min(44vw,calc((100svh-380px)*0.4375))] md:w-[min(34vw,320px,calc((100svh-320px)*0.4375))] lg:w-[min(24vw,320px,calc((100svh-320px)*0.4375))]">
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
            {/* Frosted backing so the text scrolling behind doesn't show through the cup */}
            <rect x="0" y="0" width="240" height="520" fill="#f3f2ed" opacity="0.88" />
            <g data-liquid>
              <path data-wave data-fill d={wavePath(178)} fill="#5b3a28" />
              {foam.map((f, i) => (
                <circle key={i} data-foam cx={f.cx} cy={f.cy} r={f.r} fill="#e8dccb" />
              ))}
            </g>
            {/* Powder floating on the water before it's shaken in */}
            <g data-heap opacity="0">
              <ellipse cx="152" cy="184" rx="42" ry="9" fill="#8a6446" />
              <path d="M116 184 Q134 166 152 168 Q172 166 188 184 Z" fill="#a47b58" />
            </g>
          </g>
          {/* Powder column */}
          <path data-pour d={POUR} fill="#a47b58" opacity="0" />

          {/* Scoop: slides in, tips at its lip, slides back out */}
          <g data-scoop opacity="0">
            <g data-scoop-tilt>
             <g transform="translate(162 42) scale(1.45) translate(-162 -42)">
              <rect x="186" y="41" width="82" height="13" rx="6.5" fill="#ffb300" stroke="#090909" strokeWidth="2.5" />
              <path d="M132 42 L192 42 L188 80 Q186 92 174 92 L150 92 Q138 92 136 80 Z" fill="#ffb300" stroke="#090909" strokeWidth="3" strokeLinejoin="round" />
              <path d="M140 50 L142 78" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="3.5" strokeLinecap="round" />
              <g data-mound>
                <path d="M134 42 Q162 20 190 42 Z" fill="#a47b58" />
                <circle cx="150" cy="36" r="2.4" fill="#8a6446" />
                <circle cx="168" cy="32" r="2" fill="#8a6446" />
                <circle cx="178" cy="38" r="2.2" fill="#8a6446" />
              </g>
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
