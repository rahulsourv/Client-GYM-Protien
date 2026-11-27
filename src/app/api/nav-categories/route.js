import { getPublicCatalog } from "@/lib/publicCatalog";

/** Live categories (with listed product counts) for the header, mobile menu and footer. */
export async function GET() {
  const { categories, products } = await getPublicCatalog();
  const list = categories
    .map(({ slug, name }) => ({ slug, name, count: products.filter((p) => p.category === slug).length }))
    .filter((c) => c.count > 0);
  return Response.json(list, { headers: { "Cache-Control": "public, max-age=60" } });
}
