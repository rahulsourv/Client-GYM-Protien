import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import PageHeader from "@/components/layout/PageHeader";
import CatalogBrowser from "@/components/shop/CatalogBrowser";
import { getPublicCatalog } from "@/lib/publicCatalog";

export const metadata = {
  title: "Shop all supplements",
  description: "Shop HV Nutrition Whey Protein.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="HV Nutrition"
        lines={["The shop", <span key="a" className="outline-text">everything.</span>]}
        description="Browse our supplements and sports nutrition products."
        crumbs={[{ label: "Products" }]}
      />
      <section className="shell pb-28" aria-label="Products">
        <Suspense fallback={<div role="status"><span className="sr-only">Loading products…</span><ProductGridSkeleton count={6} /></div>}>
          <ShopCatalog />
        </Suspense>
      </section>
    </>
  );
}

async function ShopCatalog() {
  const { products, categories, unavailable } = await getPublicCatalog();
  return (
    <>
      {unavailable && <p role="status" className="mb-6 text-mute">The live catalog is temporarily unavailable.</p>}
      <CatalogBrowser base={products} categoryList={categories} />
    </>
  );
}
