import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductView from "@/components/product/ProductView";
import RelatedProducts from "@/components/product/RelatedProducts";
import { products, getProduct, getBrand, related } from "@/lib/catalog";
import { getPublicCatalog } from "@/lib/publicCatalog";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const brand = getBrand(p.brand).name;
  const title = `${brand} ${p.name}${p.flavour ? ` — ${p.flavour}` : ""}${p.size ? `, ${p.size}` : ""}`;
  return {
    title,
    description: (p.description[0] ?? p.fullName).slice(0, 160),
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title, images: [{ url: p.images[0].src, width: p.images[0].width, height: p.images[0].height, alt: p.images[0].alt }] },
  };
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<p className="shell pb-24 pt-32" role="status">Loading product…</p>}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }) {
  const { slug } = await params;
  const catalog = slug.startsWith("catalog-") ? await getPublicCatalog() : null;
  const p = catalog ? catalog.allProducts.find((product) => product.slug === slug) : getProduct(slug);
  if (!p && catalog?.unavailable) return <p className="shell pb-24 pt-32" role="status">The live catalog is temporarily unavailable.</p>;
  if (!p) notFound();
  const brand = p.brandInfo ?? getBrand(p.brand);

  // Structured data: only fields we actually have. Unconfirmed price/availability are omitted.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.fullName,
    image: p.images.map((i) => new URL(i.src, "https://hvnutrition.in").href),
    brand: { "@type": "Brand", name: brand.name },
    ...(p.description[0] && { description: p.description[0] }),
    ...(p.price != null && !p.placeholderFields.includes("price") && {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: p.price,
        ...(p.availability !== "unconfirmed" && {
          availability: p.availability === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        }),
        url: `https://hvnutrition.in/products/${p.slug}`,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductView product={p} />
      <RelatedProducts products={catalog
        ? catalog.products.filter((product) => product.family !== p.family && product.category === p.category).slice(0, 4)
        : related(p)} />
    </>
  );
}
