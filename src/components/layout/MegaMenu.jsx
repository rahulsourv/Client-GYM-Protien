"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { brands, categories, byBrand, byCategory, hvWhey, formatPrice } from "@/lib/catalog";
import ProductImage from "@/components/product/ProductImage";

const ease = [0.16, 1, 0.3, 1];

export default function MegaMenu({ open, onEnter, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const spotlight = [hvWhey()];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mega-menu"
          onMouseEnter={onEnter}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease }}
          className="absolute inset-x-0 top-full hidden border-b border-line bg-obsidian lg:block"
        >
          <div className="shell grid grid-cols-12 gap-8 py-10">
            <Col title="Categories" i={0} className="col-span-3">
              {categories.map((c) => (
                <MenuLink key={c.slug} href={`/collections/${c.slug}`} count={byCategory(c.slug).length}>
                  {c.name}
                </MenuLink>
              ))}
              <MenuLink href="/shop" count={null}>
                Shop all
              </MenuLink>
            </Col>
            <Col title="Brands" i={1} className="col-span-3">
              {brands.map((b) => (
                <MenuLink key={b.slug} href={`/collections/${b.slug}`} count={byBrand(b.slug).length} badge={b.own ? "Ours" : null}>
                  {b.name}
                </MenuLink>
              ))}
            </Col>
            <Col title="In focus" i={2} className="col-span-6">
              <div className="grid grid-cols-2 gap-4">
                {spotlight.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group block">
                    <ProductImage
                      image={p.images[0]}
                      sizes="20vw"
                      className="aspect-[4/3]"
                      imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                    />
                    <div className="mt-3 flex items-baseline justify-between gap-4">
                      <span className="text-sm text-warm">
                        {p.name} <span className="text-mute">· {p.flavour}</span>
                      </span>
                      <span className="font-mono text-xs text-mute">{formatPrice(p.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Col>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Col({ title, i, className, children }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease }}
    >
      <p className="eyebrow mb-5 text-mute">{title}</p>
      <div className="flex flex-col">{children}</div>
    </motion.div>
  );
}

function MenuLink({ href, count, badge, children }) {
  return (
    <Link
      href={href}
      className="group flex items-baseline justify-between border-b border-line py-2.5 text-warm transition-colors hover:text-lime"
    >
      <span className="display text-3xl transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
        {children}
        {badge && <span className="eyebrow ml-3 align-middle text-lime">{badge}</span>}
      </span>
      {count != null && <span className="font-mono text-xs text-mute">{String(count).padStart(2, "0")}</span>}
    </Link>
  );
}
