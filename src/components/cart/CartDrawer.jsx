"use client";

import Link from "next/link";
import { useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Overlay from "@/components/ui/Overlay";
import { LinkButton } from "@/components/ui/Button";
import { useShop } from "@/store/shop";
import { CartLine, CartSummary } from "./CartParts";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, lines, count } = useShop();
  const close = useCallback(() => setCartOpen(false), [setCartOpen]);

  return (
    <Overlay
      open={cartOpen}
      onClose={close}
      label="Shopping cart"
      side="right"
      className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-line bg-charcoal"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-5">
        <h2 className="display text-4xl">
          Cart <span className="font-mono text-sm align-top text-lime">{String(count).padStart(2, "0")}</span>
        </h2>
        <button type="button" onClick={close} className="grid size-11 place-items-center text-warm hover:text-lime" aria-label="Close cart">
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
          <p className="display text-6xl text-soft">
            Nothing in
            <br />
            <span className="outline-text">the bag yet.</span>
          </p>
          <p className="max-w-xs text-sm text-mute">Start with our own whey, or browse creatine, pre-workout and more.</p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/collections/hv-nutrition" onClick={close}>
              Shop HV Protein
            </LinkButton>
            <LinkButton href="/shop" variant="ghost" onClick={close}>
              Shop all
            </LinkButton>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <CartLine key={l.id} line={l} onNavigate={close} />
              ))}
            </AnimatePresence>
          </ul>
          <div className="border-t border-line bg-obsidian px-6 py-6">
            <CartSummary compact />
            <Link href="/cart" onClick={close} className="mt-4 block text-center font-mono text-xs uppercase tracking-widest text-mute hover:text-warm">
              View full cart
            </Link>
          </div>
        </>
      )}
    </Overlay>
  );
}
