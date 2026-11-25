import PageHeader from "@/components/layout/PageHeader";
import CatalogBrowser from "@/components/shop/CatalogBrowser";
import { products, brands } from "@/lib/catalog";

export const metadata = {
  title: "Shop all supplements",
  description: "Shop whey protein, creatine, pre-workout and L-carnitine from HV Nutrition, Wellcore, MuscleBlaze and Rebuild.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow={`${products.length} products · ${brands.length} brands`}
        lines={["The shop", <span key="a" className="outline-text">everything.</span>]}
        description="Our own whey and every product we stock from Wellcore, MuscleBlaze and Rebuild. Filter, sort and search below."
        crumbs={[{ label: "Shop" }]}
      />
      <section className="shell pb-28" aria-label="Products">
        <CatalogBrowser />
      </section>
    </>
  );
}
