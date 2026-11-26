import PageHeader from "@/components/layout/PageHeader";
import Categories from "@/components/sections/Categories";

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
      <Categories bare />
    </>
  );
}
