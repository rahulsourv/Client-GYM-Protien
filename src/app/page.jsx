import Hero from "@/components/sections/Hero";
import ProductReveal from "@/components/sections/ProductReveal";
import Philosophy from "@/components/sections/Philosophy";
import Categories from "@/components/sections/Categories";
import Signature from "@/components/sections/Signature";
import Marketplace from "@/components/sections/Marketplace";
import Featured from "@/components/sections/Featured";
import Discovery from "@/components/sections/Discovery";
import Trust from "@/components/sections/Trust";
import Journal from "@/components/sections/Journal";
import FinalCta from "@/components/sections/FinalCta";
import { store } from "@/data/catalog";

export const metadata = {
  alternates: { canonical: "/" },
};

// Organization data limited to facts published on the current site.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: store.name,
  url: "https://hvnutrition.in",
  telephone: store.phone.replace(/\s/g, ""),
  email: store.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ganeshpura Housing, Amroli",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "394107",
    addressCountry: "IN",
  },
  founder: { "@type": "Person", name: store.founder },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <ProductReveal />
      <Philosophy />
      <Categories />
      <Signature />
      <Marketplace />
      <Featured />
      <Discovery />
      <Trust />
      <Journal />
      <FinalCta />
    </>
  );
}
