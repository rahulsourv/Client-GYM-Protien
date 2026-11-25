"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ProductImage from "./ProductImage";

/**
 * Desktop: vertical thumbnails + large stage with hover zoom that follows the
 * pointer (zoom is capped by source resolution). Mobile: swipeable strip.
 */
export default function ProductGallery({ product }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const strip = useRef(null);
  const imgs = product.images;
  const own = product.brand === "hv-nutrition";
  const img = imgs[i];
  // Don't zoom past ~1.6× the source's native pixels.
  const zoomScale = Math.min(2.2, Math.max(1.3, img.width / 520));

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const onScroll = () => {
    const el = strip.current;
    if (el) setI(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div>
      {/* Mobile strip */}
      <div className="lg:hidden">
        <div ref={strip} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-label="Product images">
          {imgs.map((im, k) => (
            <div key={im.src} className="relative aspect-square w-full shrink-0 snap-center">
              <Stage own={own} image={im} priority={k === 0} />
            </div>
          ))}
        </div>
        {imgs.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {imgs.map((im, k) => (
              <span key={im.src} className={`h-0.5 transition-all duration-500 ${k === i ? "w-8 bg-lime" : "w-4 bg-line"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[76px_1fr]">
        <div className="flex flex-col gap-2" role="tablist" aria-label="Product images">
          {imgs.map((im, k) => (
            <button
              key={im.src}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`Show image ${k + 1}`}
              onClick={() => setI(k)}
              className={`relative aspect-square overflow-hidden border transition-colors ${k === i ? "border-lime" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              {own ? (
                <span className="absolute inset-0 bg-graphite">
                  <Image src={im.src} alt="" fill sizes="76px" className="object-contain p-2" />
                </span>
              ) : (
                <ProductImage image={{ ...im, alt: "" }} sizes="76px" className="absolute inset-0" pad="6%" />
              )}
            </button>
          ))}
        </div>
        <div
          className="relative aspect-[4/5] max-h-[86vh] cursor-zoom-in overflow-hidden"
          onPointerEnter={() => setZoom(true)}
          onPointerLeave={() => setZoom(false)}
          onPointerMove={onMove}
          role="tabpanel"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={img.src}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{ transformOrigin: origin, transform: zoom ? `scale(${zoomScale})` : "scale(1)" }}
              >
                <Stage own={own} image={img} priority={i === 0} />
              </div>
            </motion.div>
          </AnimatePresence>
          <span className="eyebrow pointer-events-none absolute bottom-4 left-4 text-obsidian/50 mix-blend-difference">
            {String(i + 1).padStart(2, "0")} / {String(imgs.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stage({ own, image, priority }) {
  return own ? (
    <div className="grain absolute inset-0 bg-graphite">
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(55% 50% at 50% 45%, rgba(243,242,237,0.14), transparent 70%)" }} />
      <Image src={image.src} alt={image.alt} fill priority={priority} sizes="(min-width:1024px) 50vw, 100vw" className="object-contain p-[10%] drop-shadow-[0_40px_50px_rgba(0,0,0,0.7)]" />
    </div>
  ) : (
    <ProductImage image={image} priority={priority} sizes="(min-width:1024px) 50vw, 100vw" className="absolute inset-0" pad="10%" />
  );
}