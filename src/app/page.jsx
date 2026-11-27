import { Suspense } from "react";
import Hero from "@/components/sections/Hero";
import ProductReveal from "@/components/sections/ProductReveal";
import Categories from "@/components/sections/Categories";
import Signature from "@/components/sections/Signature";
import Discovery from "@/components/sections/Discovery";
import Trust from "@/components/sections/Trust";
import Founder from "@/components/sections/Founder";
import Philosophy from "@/components/sections/Philosophy";
import { store } from "@/data/catalog";
import { getPublicCatalog } from "@/lib/publicCatalog";

export const metadata = {
  alternates: { canonical: "/" },
};

// Organization data limited to facts published on the current site.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: store.name,
  legalName: store.legalName,
  url: "https://hvnutrition.in",
  telephone: store.phone.replace(/\s/g, ""),
  email: store.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: store.street,
    addressLocality: store.city,
    addressRegion: "West Bengal",
    postalCode: store.postcode,
    addressCountry: "IN",
  },
  identifier: { "@type": "PropertyValue", propertyID: "FSSAI Registration Number", value: store.fssai.number },
  founder: { "@type": "Person", name: store.founder },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <ProductReveal />
      <Suspense fallback={<p className="shell py-12" role="status">Loading categories…</p>}>
        <HomeCategories />
      </Suspense>
      <Signature />
      <Suspense fallback={<p className="shell py-12" role="status">Loading products…</p>}>
        <HomeDiscovery />
      </Suspense>
      <Trust />
      <Founder />
      <Philosophy />
    </>
  );
}

async function HomeCategories() {
  const { categories, products } = await getPublicCatalog();
  return <Categories categoryList={categories} productList={products} />;
}

async function HomeDiscovery() {
  const { categories, products, unavailable } = await getPublicCatalog();
  return <Discovery categories={categories} products={products} unavailable={unavailable} />;
}
