import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Categories from "@/components/sections/Categories";
import { getPublicCatalog } from "@/lib/publicCatalog";

export const metadata = {
  title: "Categories",
  description: "Browse HV Nutrition supplements by category.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="HV Nutrition"
        lines={["Shop by", <span key="a" className="outline-text">category.</span>]}
        description="Everything on our shelf, sorted by what it does in your routine."
        crumbs={[{ label: "Categories" }]}
      />
      <Suspense fallback={<p className="shell pb-24" role="status">Loading categories…</p>}>
        <CatalogCategories />
      </Suspense>
    </>
  );
}

async function CatalogCategories() {
  const catalog = await getPublicCatalog();
  return (
    <>
      {catalog.unavailable && <p role="status" className="shell mb-6 text-mute">The live catalog is temporarily unavailable.</p>}
      <Categories bare categoryList={catalog.categories} productList={catalog.products} />
    </>
  );
}
