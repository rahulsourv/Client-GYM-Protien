import Image from "next/image";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CatalogBrowser from "@/components/shop/CatalogBrowser";
import { getCollection, collectionSlugs, byBrand, byCategory, hvWhey } from "@/lib/catalog";

export function generateStaticParams() {
  return collectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return {};
  return {
    title: c.type === "brand" ? `${c.title} collection` : `${c.title} supplements`,
    description: c.description,
    alternates: { canonical: `/collections/${slug}` },
  };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();
  const list = c.type === "brand" ? byBrand(slug) : byCategory(slug);
  const own = c.type === "brand" && c.brand.own;

  return (
    <>
      <PageHeader
        eyebrow={
          c.type === "brand"
            ? own
              ? "House brand"
              : "Independent brand · stocked by HV Nutrition"
            : `Category · ${list.length} products`
        }
        lines={c.title.length > 10 ? c.title.split(" ") : [c.title]}
        description={c.description}
        crumbs={[{ label: "Shop", href: "/shop" }, { label: c.title }]}
        meta={<p className="font-mono text-xs text-mute">{String(list.length).padStart(2, "0")} products</p>}
      >
        {own && (
          <div className="grain relative mt-12 h-[60vh] min-h-[380px] overflow-hidden bg-graphite">
            <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(50% 60% at 50% 50%, rgba(243,242,237,0.12), transparent 70%)" }} />
            <p aria-hidden className="display outline-text absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[22vw] [--stroke:color-mix(in_srgb,var(--color-warm)_20%,transparent)]">
              Original
            </p>
            <div className="absolute inset-[8%]">
              <Image src={hvWhey().images[0].src} alt={hvWhey().images[0].alt} fill priority sizes="60vw" className="object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.7)]" />
            </div>
          </div>
        )}
      </PageHeader>
      <section className="shell pb-28" aria-label={`${c.title} products`}>
        <CatalogBrowser base={list} lock={{ brand: c.type === "brand", category: c.type === "category" }} />
      </section>
    </>
  );
}
