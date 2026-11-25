"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import ProductGallery from "./ProductGallery";
import VariantPicker from "./VariantPicker";
import { LinkButton } from "@/components/ui/Button";
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
  const brand = getBrand(p.brand);
  const category = getCategory(p.category);
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
    ["Price", `${brand.own ? "From " : ""}${formatPrice(p.price)}${isPlaceholder("price") ? " (to be confirmed)" : ""}`],
    ["Listed MRP", p.listedMrp && formatPrice(p.listedMrp)],
    ["Availability", availabilityLabel[p.availability]],
    ["Other options", variants.length > 1 && `${variants.length} flavours / sizes`],
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
      {/* ── Summary ───────────────────────────────────────────── */}
      <div className="shell grid gap-10 pb-20 pt-24 md:pt-28 lg:grid-cols-12 lg:gap-12">
        <div className="mx-auto w-full max-w-xl lg:col-span-7 lg:max-w-none">
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
                <li><Link href={`/collections/${p.category}`} className="hover:text-warm">{category.name}</Link></li>
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

            {/* How to buy */}
            <div ref={buyRef} className="border border-line bg-charcoal p-5 md:p-6">
              <p className="eyebrow text-lime">How to buy</p>
              <p className="mt-3 text-sm leading-relaxed text-soft/80">
                We don’t sell online. Call or email us to order this product, or pick it up at our {store.city} store.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <LinkButton href={store.phoneHref} arrow={false} className="sm:flex-1">
                  <span className="flex items-center gap-2"><Phone className="size-4" aria-hidden /> Call to order</span>
                </LinkButton>
                <LinkButton href={enquiry} variant="ghost" arrow={false} className="sm:flex-1">
                  <span className="flex items-center gap-2"><Mail className="size-4" aria-hidden /> Email enquiry</span>
                </LinkButton>
              </div>
              <p className="mt-4 font-mono text-xs text-mute">{store.phone}</p>
            </div>

            <a href="#details" className="eyebrow self-start text-mute underline decoration-line underline-offset-4 hover:text-warm">
              Full product details ↓
            </a>
          </div>
        </div>
      </div>

      {/* ── Full details ──────────────────────────────────────── */}
      <section id="details" aria-label="Product details" className="border-t border-line bg-charcoal">
        <div className="shell grid gap-10 py-20 md:py-28 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow text-mute">Product details</p>
              <p className="display mt-4 text-5xl md:text-6xl">{p.name}</p>
              <nav aria-label="On this page" className="mt-8 hidden lg:block">
                <ol className="flex flex-col border-t border-line">
                  {sections.map((s, i) => (
                    <li key={s.id} className="border-b border-line">
                      <a href={`#${s.id}`} className="flex gap-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-soft/70 transition-colors hover:text-lime">
                        <span className="text-mute">{String(i + 1).padStart(2, "0")}</span>
                        {s.label}
                      </a>
                    </li>
                  ))}
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
                There’s no online checkout — prices are shown so you know what to expect. {store.shippingNote}
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
            className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-line bg-obsidian/95 px-4 py-3 backdrop-blur lg:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{p.name}</p>
              <p className="font-mono text-xs text-mute">
                {[p.flavour, p.size].filter(Boolean).join(" · ")} · {formatPrice(p.price)}
              </p>
            </div>
            <a
              href={store.phoneHref}
              className="flex h-12 items-center gap-2 bg-lime px-5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink active:scale-95"
            >
              <Phone className="size-4" aria-hidden /> Call
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Block({ id, title, children }) {
  return (
    <div id={id} className="scroll-mt-28">
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
