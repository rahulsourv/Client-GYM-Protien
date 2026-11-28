import { getPublicCatalog } from "@/lib/publicCatalog";

/** Live products and categories for the site search, trimmed to what search shows. */
export async function GET() {
  const { categories, products } = await getPublicCatalog();
  const list = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    fullName: p.fullName,
    brand: p.brand,
    brandInfo: p.brandInfo && { name: p.brandInfo.name },
    category: p.category,
    categoryInfo: p.categoryInfo && { name: p.categoryInfo.name },
    flavour: p.flavour,
    size: p.size,
    sku: p.sku,
    price: p.price,
    images: p.images.slice(0, 1),
  }));
  const categoryList = categories
    .map(({ slug, name }) => ({ slug, name }))
    .filter((c) => products.some((p) => p.category === c.slug));
  return Response.json(
    { products: list, categories: categoryList },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
