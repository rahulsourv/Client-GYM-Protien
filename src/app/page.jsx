import Hero from "@/components/sections/Hero";
import ProductReveal from "@/components/sections/ProductReveal";
import Categories from "@/components/sections/Categories";
import Signature from "@/components/sections/Signature";
import Marketplace from "@/components/sections/Marketplace";
import Discovery from "@/components/sections/Discovery";
import Trust from "@/components/sections/Trust";
import Founder from "@/components/sections/Founder";
import Philosophy from "@/components/sections/Philosophy";
import { store } from "@/data/catalog";

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
      <Categories />
      <Marketplace />
      <Signature />
      <Discovery />
      <Trust />
      <Founder />
      <Philosophy />
    </>
  );
}
