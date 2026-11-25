"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { X } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { useShop } from "@/store/shop";
import { formatPrice, getBrand, getProductById, availabilityLabel } from "@/lib/catalog";
import ProductImage from "./ProductImage";
import VariantPicker from "./VariantPicker";
import { QtyStepper } from "@/components/cart/CartParts";
import { Button } from "@/components/ui/Button";

export default function QuickView() {
  const { quickView, setQuickView } = useShop();
  const close = useCallback(() => setQuickView(null), [setQuickView]);
  const product = quickView ? getProductById(quickView) : null;

  return (
    <Overlay
      open={Boolean(product)}
      onClose={close}
      label={product ? `Quick view: ${product.name}` : "Quick view"}
      side="center"
      className="absolute inset-x-3 top-1/2 mx-auto max-h-[92vh] max-w-5xl -translate-y-1/2 overflow-y-auto border border-line bg-charcoal md:inset-x-8"
    >
      {product && <Body key={product.id} product={product} onClose={close} onSelect={setQuickView} />}
    </Overlay>
  );
}

function Body({ product: p, onClose, onSelect }) {
  const { addToCart, maxQty } = useShop();
  const [qty, setQty] = useState(1);
  return (
    <div className="grid md:grid-cols-2">
      <ProductImage image={p.images[0]} sizes="(min-width:768px) 40vw, 90vw" className="aspect-square md:aspect-auto md:min-h-[520px]" />
      <div className="relative flex flex-col gap-5 p-6 md:p-10">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 grid size-11 place-items-center hover:text-lime" aria-label="Close quick view">
          <X className="size-5" aria-hidden />
        </button>
        <p className="eyebrow text-mute">{getBrand(p.brand)?.name}</p>
        <h2 className="display -mt-2 pr-10 text-5xl">{p.name}</h2>
        <p className="font-mono text-lg tabular-nums">{formatPrice(p.price)}</p>
        <VariantPicker product={p} onSelect={(v) => onSelect(v.id)} />
        <p className="text-xs text-mute">{availabilityLabel[p.availability]}</p>
        <div className="mt-auto flex flex-wrap gap-3">
          <QtyStepper value={qty} onChange={(q) => setQty(Math.max(1, Math.min(maxQty, q)))} max={maxQty} />
          <Button className="flex-1" disabled={p.availability === "out_of_stock"} onClick={() => addToCart(p.id, qty)}>
            Add to cart
          </Button>
        </div>
        <Link href={`/products/${p.slug}`} onClick={onClose} className="eyebrow text-mute underline-offset-4 hover:text-warm hover:underline">
          Full product details →
        </Link>
      </div>
    </div>
  );
}
