"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import VariantPicker from "./VariantPicker";
import { isPhoto, PHOTO_BG } from "./ProductImage";
import FssaiBadge from "@/components/ui/FssaiBadge";
import Placeholder from "@/components/ui/Placeholder";
import { availabilityLabel, formatPrice } from "@/lib/catalog";
import { store } from "@/data/catalog";

const EASE = [0.16, 1, 0.3, 1];

/** One product image on its own background (photos) or on a dark stage (transparent packshots). */
function Shot({ image, priority, sizes, className = "" }) {
  const photo = isPhoto(image);
  return (
    <div
      className={`relative overflow-hidden ${photo ? "" : "bg-[radial-gradient(70%_55%_at_50%_40%,#2b2b2b_0%,#111_70%)]"} ${className}`}
      style={photo ? { background: PHOTO_BG } : undefined}
    >
      <Image
        src={image.src}
        unoptimized={image.unoptimized}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-contain ${photo ? "" : "p-[10%] drop-shadow-[0_40px_50px_rgba(0,0,0,0.55)]"}`}
      />
    </div>
  );
}

/**
 * Product page top, laid out like a classic shop page: thumbnails, the main
 * image, and a details column with options and how to order.
 * HV Nutrition has no online checkout, so the buttons call or email the store.
 */
export default function ProductHero({ product: p, brand, category, onSelectVariant, buyRef }) {
  const [index, setIndex] = useState(0);
  const images = p.images;
  const image = images[Math.min(index, images.length - 1)];
  const hasThumbs = images.length > 1;

  const title = [brand.name, p.name, p.flavour, p.size].filter(Boolean).join(" ");
  const enquiry = `mailto:${store.email}?subject=${encodeURIComponent(`Order enquiry: ${title}`)}&body=${encodeURIComponent(
    `Hi HV Nutrition,\n\nI'd like to buy: ${title} (${formatPrice(p.price)}).\nIs it available?\n\nName:\nPhone:\n`
  )}`;
  const summary = p.summary ?? p.description[0];
  const meta = [p.flavour, p.size, p.servings && `${p.servings} servings`].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="product-title" className="shell pb-16 pt-24 md:pb-24 md:pt-32">
      <nav aria-label="Breadcrumb">
        <ol className="eyebrow flex flex-wrap gap-2 text-mute">
          <li><Link href="/shop" className="hover:text-warm">Shop</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/collections/${p.category}`} className="hover:text-warm">{category.name}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-warm">{p.name}</li>
        </ol>
      </nav>

      <div
        className={`mt-6 grid gap-6 md:mt-10 lg:items-start lg:gap-12 ${
          hasThumbs ? "lg:grid-cols-[72px_minmax(0,1.1fr)_minmax(0,0.9fr)]" : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
        }`}
      >
        {/* Thumbnails: a column on desktop, a row under the image on phones. */}
        {hasThumbs && (
          <ul role="tablist" aria-label="Product images" className="no-scrollbar order-2 flex gap-3 overflow-x-auto lg:order-none lg:flex-col lg:overflow-visible">
            {images.map((im, k) => (
              <li key={im.src} className="shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={k === index}
                  aria-label={`Show image ${k + 1}`}
                  onClick={() => setIndex(k)}
                  className={`block size-16 border transition-colors lg:size-[72px] ${k === index ? "border-lime" : "border-line hover:border-warm"}`}
                >
                  <Shot image={{ ...im, alt: "" }} sizes="72px" className="size-full" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Main image */}
        <div className="order-1 lg:order-none">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={image.src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Shot image={image} priority sizes="(min-width:1024px) 45vw, 100vw" className="mx-auto aspect-square w-full lg:max-w-[min(100%,calc(100svh-11rem))]" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Details */}
        <div className="order-3 lg:sticky lg:top-28 lg:order-none">
          {brand.own && <p className="eyebrow inline-block bg-lime px-2 py-1 text-ink">HV Original</p>}
          <h1 id="product-title" className="display mt-4 text-5xl md:text-6xl">
            <span className="sr-only">{brand.name} </span>
            {p.name}
          </h1>
          <p className="mt-4 font-mono text-2xl tabular-nums text-warm">
            {brand.own && p.price != null && <span className="text-base text-mute">From </span>}
            {formatPrice(p.price)}
          </p>
          {p.listedMrp && <p className="mt-1 font-mono text-xs text-mute">Listed MRP {formatPrice(p.listedMrp)}</p>}
          {p.placeholderFields.includes("price") && <Placeholder className="mt-2">Price to be confirmed</Placeholder>}
          {meta && <p className="mt-3 text-sm text-mute">{meta}</p>}

          {summary && (
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-soft/85">
              {summary}{" "}
              <a href="#details" className="whitespace-nowrap text-warm underline decoration-lime underline-offset-4 hover:text-lime">
                Read more
              </a>
            </p>
          )}

          <div className="mt-8 border-t border-line pt-6">
            <VariantPicker product={p} onSelect={onSelectVariant} />
          </div>

          <p className="mt-6 flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className={`size-2 rounded-full ${p.availability === "in_stock" ? "bg-lime" : p.availability === "out_of_stock" ? "bg-red-500" : "bg-mute"}`}
            />
            <span className="text-soft/80">{availabilityLabel[p.availability]}</span>
          </p>

          <div ref={buyRef} className="mt-6 flex max-w-md flex-col gap-3">
            <a
              href={store.phoneHref}
              className="flex h-14 items-center justify-center gap-2 bg-gold font-mono text-[0.78rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-warm active:scale-[0.98]"
            >
              <Phone className="size-4" aria-hidden /> Call to order
            </a>
            <a
              href={enquiry}
              className="flex h-14 items-center justify-center gap-2 border border-warm/25 font-mono text-[0.78rem] font-medium uppercase tracking-[0.14em] text-warm transition-colors hover:border-warm hover:bg-warm hover:text-obsidian active:scale-[0.98]"
            >
              <Mail className="size-4" aria-hidden /> Email enquiry
            </a>
            <p className="text-xs leading-relaxed text-mute">
              No online checkout: call or email to order, or pick it up at our {store.city} store. {store.phone}
            </p>
          </div>

          <FssaiBadge compact className="mt-6" />
        </div>
      </div>
    </section>
  );
}
