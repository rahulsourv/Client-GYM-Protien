"use client";

import { AnimatePresence } from "framer-motion";
import { useShop } from "@/store/shop";
import { CartLine, CartSummary } from "@/components/cart/CartParts";
import { LinkButton } from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import { featured } from "@/lib/catalog";

export default function CartView() {
  const { lines, hydrated, clearCart } = useShop();

  if (!hydrated) return <div className="shell min-h-[40vh]" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="shell pb-28">
        <div className="border-y border-line py-16">
          <p className="display text-6xl text-soft md:text-8xl">
            Your cart is <span className="outline-text">empty.</span>
          </p>
          <div className="mt-8 flex flex-col gap-3 xs:flex-row">
            <LinkButton href="/collections/hv-nutrition">Shop HV Protein</LinkButton>
            <LinkButton href="/shop" variant="ghost">Browse the shop</LinkButton>
          </div>
        </div>
        <h2 className="eyebrow mb-6 mt-16 text-mute">You might start with</h2>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
          {featured().slice(0, 4).map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="shell grid gap-12 pb-28 lg:grid-cols-12">
      <section aria-label="Cart items" className="lg:col-span-7">
        <ul className="border-t border-line">
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <CartLine key={l.id} line={l} large />
            ))}
          </AnimatePresence>
        </ul>
        <button type="button" onClick={clearCart} className="eyebrow mt-6 text-mute hover:text-warm">
          Clear cart
        </button>
      </section>
      <aside aria-label="Order summary" className="lg:col-span-4 lg:col-start-9">
        <div className="border border-line bg-charcoal p-6 lg:sticky lg:top-28">
          <h2 className="display mb-6 text-4xl">Summary</h2>
          <CartSummary />
        </div>
      </aside>
    </div>
  );
}
