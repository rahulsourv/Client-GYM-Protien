import PageHeader from "@/components/layout/PageHeader";
import CatalogBrowser from "@/components/shop/CatalogBrowser";

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
        description="Explore our chocolate whey protein."
        crumbs={[{ label: "Products" }]}
      />
      <section className="shell pb-28" aria-label="Products">
        <CatalogBrowser />
      </section>
    </>
  );
}
