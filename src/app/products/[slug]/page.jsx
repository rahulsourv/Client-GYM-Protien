import { notFound } from "next/navigation";
import ProductView from "@/components/product/ProductView";
import RelatedProducts from "@/components/product/RelatedProducts";
import { products, getProduct, getBrand, related } from "@/lib/catalog";

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

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  // Structured data: only fields we actually have. Unconfirmed price/availability are omitted.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.fullName,
    image: p.images.map((i) => `https://hvnutrition.in${encodeURI(i.src)}`),
    brand: { "@type": "Brand", name: getBrand(p.brand).name },
    ...(p.description[0] && { description: p.description[0] }),
    ...(!p.placeholderFields.includes("price") && {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: p.price,
        availability: p.availability === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: `https://hvnutrition.in/products/${p.slug}`,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView product={p} />
      <RelatedProducts products={related(p)} />
    </>
  );
}
