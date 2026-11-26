"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { setupReveals } from "@/components/motion/reveal";
import Lines from "@/components/motion/Lines";
import Placeholder from "@/components/ui/Placeholder";
import { store } from "@/data/catalog";
import FssaiBadge from "@/components/ui/FssaiBadge";

/**
 * 09 — Trust. Only what the current site actually states; everything else is
 * an explicit placeholder for the owner to fill in.
 */
const rows = [
  {
    k: "FSSAI registered",
    v: `${store.legalName} is registered with the Food Safety and Standards Authority of India as a food retailer.`,
    extra: <FssaiBadge className="w-full max-w-xl" />,
  },
  {
    k: "Shipping",
    v: "Delivery areas, rates and timelines from our Uttarpara store.",
    extra: <Placeholder>Owner to provide shipping terms</Placeholder>,
  },
  {
    k: "Talk to a person",
    v: (
      <>
        Call <a href={store.phoneHref} className="text-warm underline decoration-lime underline-offset-4 hover:text-lime">{store.phone}</a> or
        email <a href={`mailto:${store.email}`} className="break-all text-warm underline decoration-lime underline-offset-4 hover:text-lime">{store.email}</a>.
      </>
    ),
    note: `Run by ${store.founder}.`,
  },
  {
    k: "Product sourcing",
    v: "For questions about HV Nutrition Whey Protein or its packaging, contact HV Nutrition.",
    extra: <Placeholder>Owner to provide sourcing statement</Placeholder>,
  },
  {
    k: "How to buy",
    v: "We don’t take orders or payments online. Every product here shows its price — call, email or visit the store to buy.",
    extra: <Placeholder>Owner to provide return policy</Placeholder>,
  },
  {
    k: "Visit",
    v: store.address,
    note: "Address as registered with FSSAI.",
  },
];

export default function Trust() {
  const root = useRef(null);
  useGSAP(() => setupReveals(), { scope: root });
  return (
    <section ref={root} aria-labelledby="trust-title" className="bg-obsidian py-14 md:py-36">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <span className="eyebrow text-mute">(06) Shopping with us</span>
            <Lines as="h2" id="trust-title" className="display mt-4 text-[15vw] md:text-[10vw] lg:text-[6vw]" lines={["Straight", "answers."]} />
          </div>
        </div>
        <dl className="lg:col-span-8">
          {rows.map((r, i) => (
            <div key={r.k} className="relative grid gap-3 py-8 md:grid-cols-[80px_200px_1fr] md:gap-6">
              <span data-reveal="rule" aria-hidden className="absolute inset-x-0 top-0 h-px bg-line" />
              <span className="font-mono text-xs text-mute">{String(i + 1).padStart(2, "0")}</span>
              <dt className="display text-3xl">{r.k}</dt>
              <dd data-reveal="fade" className="flex flex-col items-start gap-3 text-[1rem] leading-relaxed text-soft/85">
                <span>{r.v}</span>
                {r.note && <span className="text-xs text-mute">{r.note}</span>}
                {r.extra}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
