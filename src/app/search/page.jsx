import SearchPanel from "@/components/search/SearchPanel";

export const metadata = {
  title: "Search",
  description: "Search HV Nutrition products by name, brand, category or flavour.",
};

export default function SearchPage() {
  return (
    <section className="shell min-h-[80vh] pb-24 pt-28 md:pt-40" aria-label="Search">
      <h1 className="eyebrow mb-6 text-mute">Search the shop</h1>
      <SearchPanel autoFocus={false} />
    </section>
  );
}
