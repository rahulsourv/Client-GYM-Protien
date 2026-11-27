"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice, getBrand, getCategory, getVariants } from "@/lib/catalog";
import ProductImage, { isPhoto, PHOTO_BG } from "./ProductImage";

export default function ProductCard({ product: p, index, priority = false, sizes }) {
  const variants = getVariants(p);
  const alt = p.images[1];
  const own = p.brand === "hv-nutrition";
  const photo = own && isPhoto(p.images[0]);
  const brand = p.brandInfo ?? getBrand(p.brand);
  const category = p.categoryInfo ?? getCategory(p.category);

  return (
    <article className="group/card relative flex flex-col">
      <div className="relative">
        <Link href={`/products/${p.slug}`} className="block" aria-label={`${brand?.name} ${p.name}, ${p.flavour ?? ""} ${p.size ?? ""}`}>
          <div className={`relative aspect-[4/5] overflow-hidden ${own ? "bg-graphite" : ""}`}>
            {photo ? (
              <div className="absolute inset-0" style={{ background: PHOTO_BG }}>
                <Image
                  src={p.images[0].src}
                  unoptimized={p.images[0].unoptimized}
                  alt={p.images[0].alt}
                  fill
                  sizes={sizes ?? "(min-width:1024px) 25vw, 50vw"}
                  priority={priority}
                  className="object-contain transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.04]"
                />
              </div>
            ) : own ? (
              <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_40%,#2b2b2b_0%,#111_70%)]">
                <Image
                  src={p.images[0].src}
                  unoptimized={p.images[0].unoptimized}
                  alt={p.images[0].alt}
                  fill
                  sizes={sizes ?? "(min-width:1024px) 25vw, 50vw"}
                  priority={priority}
                  className="object-contain p-[12%] transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.05] group-hover/card:-rotate-2"
                />
              </div>
            ) : (
              <>
                <ProductImage
                  image={p.images[0]}
                  priority={priority}
                  sizes={sizes}
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.06]"
                />
                {alt && (
                  <ProductImage
                    image={{ ...alt, alt: "" }}
                    sizes={sizes}
                    className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover/card:opacity-100 [@media(hover:none)]:hidden"
                  />
                )}
              </>
            )}
            {index != null && (
              <span className={`absolute left-3 top-3 font-mono text-[0.65rem] ${own && !photo ? "text-mute" : "text-obsidian/50"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
            {own && <span className="eyebrow absolute right-3 top-3 bg-lime px-2 py-1 text-ink">HV Original</span>}
            {p.availability === "out_of_stock" && (
              <span className="eyebrow absolute right-3 top-3 bg-obsidian px-2 py-1 text-warm">Sold out</span>
            )}
          </div>
        </Link>

      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`eyebrow ${own ? "text-lime" : "text-mute"}`}>{brand?.name}</span>
          <span className="eyebrow hidden text-mute xl:inline">{category?.short}</span>
        </div>
        <h3 className="text-[0.95rem] leading-snug text-warm">
          <Link href={`/products/${p.slug}`} className="hover:text-lime">
            {p.name}
          </Link>
        </h3>
        <p className="text-xs text-mute">
          {[p.flavour, p.size].filter(Boolean).join(" · ")}
          {variants.length > 1 && <span className="text-warm/60"> · {variants.length} options</span>}
        </p>
        <p className="mt-auto pt-1 font-mono text-sm tabular-nums text-warm">
          {own && p.price != null && "From "}
          {formatPrice(p.price)}
        </p>
      </div>
    </article>
  );
}
