"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "@/store/shop";
import { formatPrice, getBrand, getVariants } from "@/lib/catalog";
import { store } from "@/data/catalog";
import { CHECKOUT_ENABLED, orderEnquiryMailto } from "@/lib/checkout";
import ProductImage from "@/components/product/ProductImage";
import Placeholder from "@/components/ui/Placeholder";
import { Button, LinkButton } from "@/components/ui/Button";

export function QtyStepper({ value, onChange, max = 10, label = "Quantity", size = "md" }) {
  const h = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={`inline-flex ${h} items-stretch border border-line`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="grid w-10 place-items-center text-warm transition-colors hover:bg-graphite disabled:opacity-30"
        aria-label="Decrease quantity"
        disabled={value <= 1 && size !== "sm"}
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <output aria-live="polite" className="grid w-9 place-items-center font-mono text-sm tabular-nums">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="grid w-10 place-items-center text-warm transition-colors hover:bg-graphite disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function CartLine({ line, onNavigate, large = false }) {
  const { setQty, removeFromCart, swapVariant, maxQty } = useShop();
  const p = line.product;
  const variants = getVariants(p);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4 border-b border-line py-5"
    >
      <Link href={`/products/${p.slug}`} onClick={onNavigate} className={`shrink-0 ${large ? "w-28 md:w-36" : "w-24"}`}>
        <ProductImage image={p.images[0]} sizes="150px" className="aspect-square" pad="10%" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-mute">{getBrand(p.brand)?.name}</p>
            <Link href={`/products/${p.slug}`} onClick={onNavigate} className="mt-1 block text-[0.95rem] leading-snug text-warm hover:text-lime">
              {p.name}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => removeFromCart(p.id)}
            className="-mr-2 -mt-1 grid size-9 shrink-0 place-items-center text-mute transition-colors hover:text-warm"
            aria-label={`Remove ${p.name} from cart`}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {variants.length > 1 ? (
          <label className="mt-2 block">
            <span className="sr-only">Variant for {p.name}</span>
            <select
              value={p.id}
              onChange={(e) => swapVariant(p.id, e.target.value)}
              className="w-full max-w-64 truncate border-b border-line bg-transparent py-1 pr-6 text-xs text-mute outline-none focus-visible:border-lime"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id} className="bg-charcoal text-warm">
                  {[v.flavour, v.size].filter(Boolean).join(" · ")} — {formatPrice(v.price)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="mt-2 text-xs text-mute">{[p.flavour, p.size].filter(Boolean).join(" · ")}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <QtyStepper size="sm" value={line.qty} max={maxQty} onChange={(q) => setQty(p.id, q)} label={`Quantity of ${p.name}`} />
          <p className="font-mono text-sm tabular-nums">{formatPrice(line.lineTotal)}</p>
        </div>
      </div>
    </motion.li>
  );
}

export function CartSummary({ compact = false }) {
  const { lines, subtotal } = useShop();
  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-mute">Subtotal</dt>
          <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-mute">Shipping</dt>
          <dd className="text-right text-xs text-mute">
            {store.shippingNote}
            <br />
            Other locations: <Placeholder className="ml-1 mt-1">rates to be confirmed</Placeholder>
          </dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="eyebrow">Estimated total</span>
        <span className="display text-4xl tabular-nums">{formatPrice(subtotal)}</span>
      </div>

      {CHECKOUT_ENABLED ? (
        <Button className="w-full">Checkout</Button>
      ) : (
        <div className="flex flex-col gap-3">
          <Button className="w-full" disabled aria-describedby="checkout-note">
            Online checkout — coming soon
          </Button>
          <p id="checkout-note" className="text-xs leading-relaxed text-mute">
            Online payment isn’t connected yet, so no order is placed from this page. Send your cart to the store and
            they’ll confirm availability, delivery and payment with you.
          </p>
          <LinkButton href={orderEnquiryMailto(lines, subtotal)} variant="ghost" className="w-full">
            Email this order to HV
          </LinkButton>
          {!compact && (
            <a href={store.phoneHref} className="text-center font-mono text-xs uppercase tracking-widest text-mute hover:text-lime">
              Or call {store.phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
