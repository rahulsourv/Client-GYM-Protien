"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import ProductHero from "./ProductHero";
import Placeholder from "@/components/ui/Placeholder";
import { formatPrice, getBrand, getCategory, getVariants, availabilityLabel } from "@/lib/catalog";
import { store } from "@/data/catalog";

/**
 * Product detail page. HV Nutrition doesn't sell online: the page shows the
 * product, its price and full details, and tells you how to buy it in person.
 */
export default function ProductView({ product: p }) {
  const router = useRouter();
  const [barVisible, setBarVisible] = useState(false);
  const buyRef = useRef(null);
  const [active, setActive] = useState("overview");
  const details = useRef(null);
  useGSAP(() => setupReveals(), { scope: details });
  const brand = p.brandInfo ?? getBrand(p.brand);
  const category = p.categoryInfo ?? getCategory(p.category);
  const variants = getVariants(p);
  const isPlaceholder = (f) => p.placeholderFields.includes(f);
  const title = [brand.name, p.name, p.flavour, p.size].filter(Boolean).join(" ");
  const enquiry = `mailto:${store.email}?subject=${encodeURIComponent(`Enquiry: ${title}`)}&body=${encodeURIComponent(
    `Hi HV Nutrition,\n\nI'd like to buy: ${title} (${formatPrice(p.price)}).\nIs it available?\n\nName:\nPhone:\n`
  )}`;
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}`)}`;

  // Mobile sticky bar appears once the "how to buy" box scrolls away.
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const specs = [
    ["Brand", brand.own ? `${brand.name} (house brand)` : `${brand.name} (independent brand)`],
    ["Product", p.name],
    ["Category", category.name],
    ["Flavour", p.flavour],
    ["Size", p.size],
    ["Servings", p.servings && `${p.servings}`],
    ["Price", `${brand.own && p.price != null ? "From " : ""}${formatPrice(p.price)}${isPlaceholder("price") ? " (to be confirmed)" : ""}`],
    ["Listed MRP", p.listedMrp && formatPrice(p.listedMrp)],
    ["Availability", availabilityLabel[p.availability]],
    ["Other options", variants.length > 1 && `${variants.length} ${new Set(variants.map((v) => v.flavour)).size > 1 ? "flavours / sizes" : "sizes"}`],
    ["Listed as", p.fullName !== p.name && p.fullName],
  ].filter(([, v]) => v);

  const sections = [
    { id: "overview", label: "Overview" },
    p.features.length > 0 && { id: "features", label: "Key features" },
    { id: "specs", label: "Specifications" },
    { id: "nutrition", label: "Nutrition & ingredients" },
    { id: "usage", label: "How to use" },
    { id: "buying", label: "How to buy" },
  ].filter(Boolean);

  return (
    <>
      <ScrollSpy ids={sections.map((s) => s.id)} onChange={setActive} />
      {/* ── Gallery · details · order ─────────────────────── */}
      <ProductHero
        key={p.id}
        product={p}
        brand={brand}
        category={category}
        buyRef={buyRef}
        onSelectVariant={(v) => router.replace(`/products/${v.slug}`, { scroll: false })}
      />

      {/* ── Full details ──────────────────────────────────────── */}
      <section ref={details} id="details" aria-label="Product details" className="border-t border-line bg-charcoal">
        <div className="shell grid gap-10 py-20 md:py-28 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow text-mute">Product details</p>
              <p className="display mt-4 text-5xl md:text-6xl">{p.name}</p>
              <nav aria-label="On this page" className="mt-8 hidden lg:block">
                <ol className="flex flex-col border-t border-line">
                  {sections.map((s, i) => {
                    const on = active === s.id;
                    return (
                      <li key={s.id} className="relative border-b border-line">
                        {on && (
                          <motion.span
                            layoutId="details-nav-active"
                            aria-hidden
                            className="absolute inset-0 bg-lime shadow-[0_0_28px_-6px_var(--color-lime)]"
                            transition={{ type: "spring", stiffness: 380, damping: 36 }}
                          />
                        )}
                        <a
                          href={`#${s.id}`}
                          aria-current={on ? "location" : undefined}
                          className={`relative flex gap-4 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-[color,padding] duration-500 ${on ? "pl-4 font-bold text-ink" : "text-soft/70 hover:text-lime"}`}
                        >
                          <span className={on ? "text-ink" : "text-mute"}>{String(i + 1).padStart(2, "0")}</span>
                          {s.label}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>
          </aside>

          <div className="flex flex-col gap-16 lg:col-span-8">
            <Block id="overview" title="Overview">
              <div className="flex max-w-2xl flex-col gap-4 text-[1.02rem] leading-relaxed text-soft/85">
                {p.description.length ? p.description.map((d, k) => <p key={k}>{d}</p>) : <p>A description for this product hasn’t been published yet.</p>}
                {isPlaceholder("description") && <Placeholder className="self-start">Draft description</Placeholder>}
              </div>
            </Block>

            {p.features.length > 0 && (
              <Block id="features" title="Key features">
                <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
                  {p.features.map((f, i) => (
                    <li key={f} className="flex gap-4 bg-charcoal p-5 text-sm leading-relaxed text-soft/85">
                      <span className="font-mono text-xs text-lime">{String(i + 1).padStart(2, "0")}</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {!brand.own && <p className="mt-4 text-xs text-mute">Feature list as provided on the product listing.</p>}
              </Block>
            )}

            <Block id="specs" title="Specifications">
              <dl className="border-t border-line">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-line py-4 text-sm">
                    <dt className="eyebrow text-mute">{k}</dt>
                    <dd className="text-soft/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </Block>

            <Block id="nutrition" title="Nutrition & ingredients">
              {p.labelStats?.length ? (
                <>
                  <dl className="grid grid-cols-3 border-y border-line">
                    {p.labelStats.map((s) => (
                      <div key={s.label} className="border-r border-line py-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                        <dd className="display text-5xl">
                          {s.value}
                          <span className="normal-case text-lime">{s.unit}</span>
                        </dd>
                        <dt className="eyebrow mt-2 text-mute">{s.label}</dt>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-xs text-mute">As printed on the pack. The full nutrition panel and ingredient list will be added here.</p>
                </>
              ) : (
                <p className="max-w-2xl text-sm leading-relaxed text-soft/80">
                  The full nutrition panel and ingredient list haven’t been published for this listing yet. Please refer to the label on the product.
                </p>
              )}
              {!p.nutrition && <Placeholder className="mt-4">Owner to add label data</Placeholder>}
            </Block>

            <Block id="usage" title="How to use">
              <p className="max-w-2xl text-sm leading-relaxed text-soft/80">
                {p.usage ?? "Follow the directions printed on the product label. If you have a medical condition, are pregnant or take medication, check with a doctor first."}
              </p>
              {!p.usage && <Placeholder className="mt-4">Owner to add usage directions</Placeholder>}
            </Block>

            <Block id="buying" title="How to buy">
              <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
                <Contact icon={Phone} label="Call" value={store.phone} href={store.phoneHref} />
                <Contact icon={Mail} label="Email" value={store.email} href={enquiry} />
                <Contact icon={MapPin} label="Visit" value={store.address} href={directions} external />
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-soft/80">
                There’s no online checkout — prices are shown so you know what to expect.{store.shippingNote && ` ${store.shippingNote}`}
              </p>
            </Block>
          </div>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <AnimatePresence>
        {barVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-line bg-obsidian/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{p.name}</p>
              <p className="font-mono text-xs text-mute">
                {[p.flavour, p.size].filter(Boolean).join(" · ")} · {formatPrice(p.price)}
              </p>
            </div>
            <a
              href={store.phoneHref}
              className="flex h-12 items-center gap-2 bg-gold px-5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink active:scale-95"
            >
              <Phone className="size-4" aria-hidden /> Call
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Reports which details block sits under the reading line (~35% down the screen). */
function ScrollSpy({ ids, onChange }) {
  const key = ids.join(",");
  useEffect(() => {
    const els = key.split(",").map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      // At the very bottom, the last block wins even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = els[els.length - 1].id;
      onChange(current);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [key, onChange]);
  return null;
}

function Block({ id, title, children }) {
  return (
    <div id={id} data-reveal="fade" className="scroll-mt-28">
      <h2 className="eyebrow mb-6 flex items-center gap-3 text-warm">
        <span aria-hidden className="h-px w-6 bg-lime" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Contact({ icon: Icon, label, value, href, external }) {
  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      className="group flex flex-col gap-3 bg-charcoal p-5 transition-colors hover:bg-graphite"
    >
      <Icon className="size-4 text-lime" aria-hidden />
      <span className="eyebrow text-mute">{label}</span>
      <span className="break-words text-sm text-soft/90 group-hover:text-warm">{value}</span>
    </a>
  );
}
