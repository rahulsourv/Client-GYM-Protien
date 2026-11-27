"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { onIntroDone } from "@/components/motion/reveal";
import ProductImage from "./ProductImage";
import Placeholder from "@/components/ui/Placeholder";
import { formatPrice, getBrand } from "@/lib/catalog";

const EASE = [0.16, 1, 0.3, 1];

/** Split a name into at most two balanced lines. */
function toLines(name) {
  const words = name.split(" ");
  if (words.length < 2) return [name];
  let best = [name];
  let bestMax = Infinity;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).join(" ");
    const b = words.slice(k).join(" ");
    const m = Math.max(a.length, b.length);
    if (m < bestMax) [best, bestMax] = [[a, b], m];
  }
  return best;
}

function TitleLayer({ line, fontSize, align, outline = false }) {
  return (
    <div
      data-title
      aria-hidden
      className={`display pointer-events-none absolute inset-x-0 inset-y-3 flex select-none flex-col items-center uppercase leading-[0.82] ${align}`}
      style={{ fontSize }}
    >
      <span data-line className="block overflow-hidden whitespace-nowrap px-[0.04em] pb-[0.04em]">
        {[...line].map((c, ci) => (
          <span key={ci} data-char className={`inline-block ${outline ? "outline-text" : "text-warm"}`}>
            {c === " " ? " " : c}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * Magazine-cover product hero: the product name set huge behind a large,
 * centred packshot, with cover-line annotations either side.
 */
export default function ProductCover({ product: p, brand, category }) {
  const root = useRef(null);
  const [i, setI] = useState(0);
  const imgs = p.images;
  const img = imgs[i];
  const own = brand.own;
  const lines = toLines(p.name);
  const longest = Math.max(...lines.map((l) => l.length));
  // Condensed display face: ~0.46em per glyph. Keep each line inside ~92vw.
  const fontSize = `${Math.min(23, 205 / longest).toFixed(2)}vw`;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const chars = q("[data-char]");
      const meta = q("[data-meta]");

      gsap.set(chars, { yPercent: 115 });
      gsap.set(q("[data-intro]"), { clipPath: "inset(100% 0% 0% 0%)", scale: 1.18 });
      gsap.set(meta, { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-rule]"), { scaleX: 0 });

      const stop = onIntroDone(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(q("[data-rule]"), { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0)
          .to(chars, { yPercent: 0, duration: 1.4, stagger: { each: 0.035, from: "start" } }, 0.1)
          .to(q("[data-intro]"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, 0.25)
          .to(q("[data-intro]"), { scale: 1, duration: 2 }, 0.25)
          .to(meta, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07 }, 0.8);
      });

      // Gentle idle float.
      gsap.to(q("[data-float]"), { y: -14, rotation: 0.6, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // Scroll: title lines part ways, packshot rises and settles.
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      const titleLines = q("[data-line]");
      gsap.to(titleLines[0], { xPercent: -10, ease: "none", scrollTrigger: st });
      if (titleLines[1]) gsap.to(titleLines[1], { xPercent: 10, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-par]"), { yPercent: -12, scale: 0.92, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-meta-col]"), { yPercent: -40, ease: "none", scrollTrigger: st });

      // Pointer: packshot tilts toward the cursor, title drifts the other way.
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine)", () => {
        const tilt = q("[data-tilt]")[0];
        const title = q("[data-title]");
        const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" });
        const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
        const tx = gsap.quickTo(title, "x", { duration: 1.2, ease: "power3.out" });
        const ty = gsap.quickTo(title, "y", { duration: 1.2, ease: "power3.out" });
        const move = (e) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          ry(nx * 14);
          rx(-ny * 10);
          tx(-nx * 30);
          ty(-ny * 16);
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });

      return stop;
    },
    { scope: root }
  );

  const meta = [
    ["Flavour", p.flavour],
    ["Size", p.size],
    ["Servings", p.servings],
    ["Category", category.name],
  ].filter(([, v]) => v);

  return (
    <section ref={root} aria-labelledby="product-title" className="relative overflow-hidden pt-24 md:pt-28">
      {/* Masthead */}
      <div className="shell">
        <div className="flex items-end justify-between gap-6 pb-4">
          <nav aria-label="Breadcrumb">
            <ol className="eyebrow flex flex-wrap gap-2 text-mute">
              <li><Link href="/shop" className="hover:text-warm">Shop</Link></li>
              <li aria-hidden>/</li>
              <li>
                {getBrand(p.brand)
                  ? <Link href={`/collections/${p.brand}`} className="hover:text-warm">{brand.name}</Link>
                  : brand.name}
              </li>
              <li aria-hidden className="hidden sm:inline">/</li>
              <li className="hidden sm:inline"><Link href={`/collections/${p.category}`} className="hover:text-warm">{category.name}</Link></li>
            </ol>
          </nav>
          <p className={`eyebrow shrink-0 ${own ? "text-lime" : "text-mute"}`}>
            {own ? "House brand" : "Independent brand"}
          </p>
        </div>
        <span data-rule aria-hidden className="block h-px origin-left bg-line" />
      </div>

      {/* Cover */}
      <div className="relative mx-auto h-[74svh] min-h-[480px] max-h-[980px] md:h-[80svh] lg:h-[calc(100svh-150px)] lg:min-h-[620px]">
        {/* Giant title */}
        <h1 id="product-title" className="sr-only">
          {brand.name} {p.name}
        </h1>
        <TitleLayer line={lines[0]} fontSize={fontSize} align={lines.length > 1 ? "justify-start" : "justify-center"} />

        {/* Packshot */}
        <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
          <div
            data-par
            className={`relative ${own ? "h-[68%] md:h-[72%] lg:h-[80%]" : "h-[60%] md:h-[64%] lg:h-[68%]"}`}
            style={{ aspectRatio: "3 / 4" }}
          >
            {own && (
              <div
                data-meta
                aria-hidden
                className="absolute -inset-[35%]"
                style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--color-lime) 28%, transparent), transparent 72%)" }}
              />
            )}
            <div data-tilt className="relative h-full w-full [transform-style:preserve-3d]">
              <div data-float className="relative h-full w-full">
                <div data-intro className="relative h-full w-full">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={img.src}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.9, y: 30, filter: "blur(8px)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 1.06, y: -20, filter: "blur(8px)" }}
                      transition={{ duration: 0.8, ease: EASE }}
                    >
                      {own ? (
                        <Image
                          src={img.src}
                          unoptimized={img.unoptimized}
                          alt={img.alt}
                          fill
                          priority={i === 0}
                          sizes="(min-width:1024px) 40vw, 70vw"
                          className="object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.55)]"
                        />
                      ) : (
                        <ProductImage
                          image={img}
                          priority={i === 0}
                          sizes="(min-width:1024px) 40vw, 70vw"
                          className="absolute inset-0 rounded-t-[999px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]"
                          pad="14%"
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second line sits over the packshot, like a cover line */}
        {lines[1] && <TitleLayer line={lines[1]} fontSize={fontSize} align="justify-end" outline />}

        {/* Cover lines (desktop) */}
        <div data-meta-col className="pointer-events-none absolute inset-y-0 left-[var(--gutter)] hidden flex-col justify-center gap-6 lg:flex">
          {meta.map(([k, v]) => (
            <div key={k} data-meta className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-lime" />
              <div>
                <p className="eyebrow text-mute">{k}</p>
                <p className="mt-1 text-lg text-warm">{v}</p>
              </div>
            </div>
          ))}
        </div>
        <div data-meta-col className="absolute inset-y-0 right-[var(--gutter)] hidden flex-col items-end justify-center gap-3 text-right lg:flex">
          <p data-meta className="eyebrow text-mute">{own && p.price != null ? "Cover price — from" : "Cover price"}</p>
          <p data-meta className="display text-[5.5vw] leading-none tabular-nums">{formatPrice(p.price)}</p>
          {p.listedMrp && <p data-meta className="font-mono text-xs text-mute">Listed MRP {formatPrice(p.listedMrp)}</p>}
          {p.placeholderFields.includes("price") && (
            <div data-meta>
              <Placeholder>Price to be confirmed</Placeholder>
            </div>
          )}
        </div>

      </div>

      {/* Image switcher */}
      {imgs.length > 1 && (
          <div data-meta role="tablist" aria-label="Product images" className="relative z-10 flex justify-center gap-1 py-3">
            {imgs.map((im, k) => (
              <button
                key={im.src}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={`Show image ${k + 1}`}
                onClick={() => setI(k)}
                className="group flex h-10 items-center px-1.5"
              >
                <span className={`font-mono text-[0.68rem] tracking-[0.14em] transition-colors ${k === i ? "text-warm" : "text-mute group-hover:text-warm"}`}>
                  {String(k + 1).padStart(2, "0")}
                </span>
                <span className={`ml-1.5 h-px transition-all duration-500 ${k === i ? "w-6 bg-lime" : "w-2 bg-line"}`} />
              </button>
            ))}
          </div>
      )}

      {/* Cover lines (mobile / tablet) */}
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4 lg:hidden">
        <div data-meta className="col-span-2 flex flex-wrap items-end gap-x-3 gap-y-2 sm:col-span-4">
          <p className="display text-6xl leading-none tabular-nums">
            {own && p.price != null && <span className="text-2xl">From </span>}
            {formatPrice(p.price)}
          </p>
          {p.listedMrp && <p className="pb-1 font-mono text-xs text-mute">Listed MRP {formatPrice(p.listedMrp)}</p>}
          {p.placeholderFields.includes("price") && <Placeholder className="mb-1">Price to be confirmed</Placeholder>}
        </div>
        {meta.map(([k, v]) => (
          <div key={k} data-meta>
            <p className="eyebrow text-mute">{k}</p>
            <p className="mt-1 text-warm">{v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
