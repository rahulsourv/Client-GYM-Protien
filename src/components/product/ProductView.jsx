"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import ProductGallery from "./ProductGallery";
import VariantPicker from "./VariantPicker";
import { QtyStepper } from "@/components/cart/CartParts";
import { Button } from "@/components/ui/Button";
import Placeholder from "@/components/ui/Placeholder";
import { useShop } from "@/store/shop";
import { formatPrice, getBrand, getCategory, availabilityLabel } from "@/lib/catalog";
import { store } from "@/data/catalog";

export default function ProductView({ product: p }) {
  const router = useRouter();
  const { addToCart, maxQty } = useShop();
  const [qty, setQty] = useState(1);
  const [barVisible, setBarVisible] = useState(false);
  const buyRef = useRef(null);
  const brand = getBrand(p.brand);
  const soldOut = p.availability === "out_of_stock";
  const isPlaceholder = (f) => p.placeholderFields.includes(f);

  // Mobile sticky bar appears once the main buy button scrolls away.
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = () => addToCart(p.id, qty);

  return (
    <>
      <div className="shell grid gap-10 pb-24 pt-24 md:pt-28 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <ProductGallery key={p.id} product={p} />
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-col gap-7 lg:sticky lg:top-28">
            <nav aria-label="Breadcrumb">
              <ol className="eyebrow flex flex-wrap gap-2 text-mute">
                <li><Link href="/shop" className="hover:text-warm">Shop</Link></li>
                <li aria-hidden>/</li>
                <li><Link href={`/collections/${p.brand}`} className="hover:text-warm">{brand.name}</Link></li>
                <li aria-hidden>/</li>
                <li><Link href={`/collections/${p.category}`} className="hover:text-warm">{getCategory(p.category).name}</Link></li>
              </ol>
            </nav>

            <div>
              <p className={`eyebrow ${brand.own ? "text-lime" : "text-mute"}`}>
                {brand.name}
                {!brand.own && " · independent brand"}
              </p>
              <h1 className="display mt-3 text-[15vw] sm:text-7xl">{p.name}</h1>
              <p className="mt-3 text-soft/75">{[p.flavour, p.size, p.servings && `${p.servings} servings`].filter(Boolean).join(" · ")}</p>
            </div>

            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <p className="display text-6xl tabular-nums">
                {brand.own && <span className="text-3xl">From </span>}
                {formatPrice(p.price)}
              </p>
              {p.listedMrp && <p className="pb-2 font-mono text-xs text-mute">Listed MRP {formatPrice(p.listedMrp)}</p>}
              {isPlaceholder("price") && <Placeholder className="mb-2">Price to be confirmed</Placeholder>}
            </div>

            <VariantPicker product={p} onSelect={(v) => router.replace(`/products/${v.slug}`, { scroll: false })} />

            <div className="flex items-center gap-2 text-sm">
              <span className={`size-2 rounded-full ${p.availability === "in_stock" ? "bg-lime" : p.availability === "out_of_stock" ? "bg-red-500" : "bg-mute"}`} aria-hidden />
              <span className="text-soft/80">{availabilityLabel[p.availability]}</span>
              {isPlaceholder("availability") && <Placeholder className="ml-2">Not yet listed in store</Placeholder>}
            </div>

            <div ref={buyRef} className="flex gap-3">
              <QtyStepper value={qty} max={maxQty} onChange={(q) => setQty(Math.max(1, Math.min(maxQty, q)))} />
              <Button className="flex-1" disabled={soldOut} onClick={add}>
                {soldOut ? "Sold out" : `Add to cart — ${formatPrice(p.price * qty)}`}
              </Button>
            </div>
            <p className="-mt-4 text-xs text-mute">{store.shippingNote} Online payment isn’t connected yet — you can send your cart to the store from the cart.</p>

            <div className="border-t border-line">
              <Accordion title="Description" defaultOpen>
                <div className="flex flex-col gap-3">
                  {p.description.map((d, k) => (
                    <p key={k}>{d}</p>
                  ))}
                  {isPlaceholder("description") && <Placeholder>Draft description</Placeholder>}
                </div>
              </Accordion>
              {p.features.length > 0 && (
                <Accordion title="Key features">
                  <ul className="flex flex-col gap-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-1 shrink-0 bg-lime" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!brand.own && <p className="mt-4 text-xs text-mute">Feature list as provided on the product listing.</p>}
                </Accordion>
              )}
              <Accordion title="Nutrition & ingredients">
                {p.nutrition || p.ingredients ? null : (
                  <div className="flex flex-col items-start gap-3">
                    <p>The full nutrition panel and ingredient list haven’t been published for this listing yet. Please refer to the label on the product.</p>
                    <Placeholder>Owner to add label data</Placeholder>
                  </div>
                )}
              </Accordion>
              <Accordion title="How to use">
                {p.usage ?? (
                  <div className="flex flex-col items-start gap-3">
                    <p>Follow the directions printed on the product label. If you have a medical condition, are pregnant or take medication, check with a doctor first.</p>
                    <Placeholder>Owner to add usage directions</Placeholder>
                  </div>
                )}
              </Accordion>
              <Accordion title="Shipping & questions">
                <p>
                  {store.shippingNote} For anything else, call{" "}
                  <a href={store.phoneHref} className="text-warm underline decoration-lime underline-offset-4">{store.phone}</a>.
                </p>
              </Accordion>
            </div>
            {p.fullName !== p.name && <p className="text-xs text-mute">Listed as: {p.fullName}</p>}
          </div>
        </div>
      </div>

      {/* Mobile sticky add-to-cart */}
      <AnimatePresence>
        {barVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-line bg-obsidian/95 px-4 py-3 backdrop-blur lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{p.name}</p>
              <p className="font-mono text-xs text-mute">
                {[p.flavour, p.size].filter(Boolean).join(" · ")} · {formatPrice(p.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={add}
              disabled={soldOut}
              className="flex h-12 items-center gap-2 bg-lime px-5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-obsidian active:scale-95 disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden /> Add
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `acc-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="border-b border-line">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between py-5 text-left"
        >
          <span className="eyebrow text-warm">{title}</span>
          <span aria-hidden className="relative size-3">
            <span className="absolute inset-x-0 top-1/2 h-px bg-warm" />
            <span className={`absolute inset-y-0 left-1/2 w-px bg-warm transition-transform duration-500 ${open ? "scale-y-0" : ""}`} />
          </span>
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm leading-relaxed text-soft/80">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
