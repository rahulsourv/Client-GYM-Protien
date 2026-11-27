import { cache } from "react";
import { connection } from "next/server";
import { backendUrl } from "@/lib/backendUrl";
import { brands, categories, products } from "@/lib/catalog";

// The backend rate-limits per IP (100 requests / 15 min), and every page view needs
// the catalog, so reuse a recent copy and fall back to the last good one on errors.
const FRESH_MS = 60_000;
let lastGood = null; // { at, data }

async function fetchCatalogData() {
  if (lastGood && Date.now() - lastGood.at < FRESH_MS) return lastGood.data;
  try {
    const response = await fetch(backendUrl("/catalog"), { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
    const { data } = await response.json();
    lastGood = { at: Date.now(), data };
    return data;
  } catch (error) {
    if (lastGood) return lastGood.data;
    throw error;
  }
}

export const getPublicCatalog = cache(async () => {
  await connection();
  try {
    const data = await fetchCatalogData();
    const categoryList = new Map(categories.map((category) => [category.slug, category]));
    const categoryById = new Map();
    const categoryByName = new Map();

    for (const record of data.categories) {
      const slug = brands.some((brand) => brand.slug === record.slug)
        ? `category_${record.slug}`
        : record.slug;
      const category = {
        ...categoryList.get(slug),
        id: record._id,
        slug,
        name: record.name,
        description: record.description || categoryList.get(slug)?.description,
        short: record.name,
      };
      categoryList.set(slug, category);
      categoryById.set(record._id, category);
      categoryByName.set(record.name, category);
    }

    const live = data.products.map((record) => {
      const category = categoryById.get(record.categoryId) ?? categoryByName.get(record.category);
      const brandName = record.brand || "HV Nutrition";
      const knownBrand = brands.find((brand) => brand.name.toLowerCase() === brandName.toLowerCase());
      const brandInfo = knownBrand ?? { name: brandName, slug: brandName.toLowerCase() };
      const images = [...new Set(record.imageUrls ?? [])].map((src) => ({
        src, alt: record.name, width: 800, height: 800, unoptimized: true,
      }));
      // Sizes of the same named product and flavour form one family ("BCAA Lemon" in 100 g and 300 g).
      const name = withoutSize(record.name, record.weight, record.weightUnit);
      const family = ["live", brandName, name, record.flavour ?? ""].join("|").toLowerCase();
      return {
        id: record._id,
        slug: `catalog-${record._id}`,
        family,
        grams: record.weight * (record.weightUnit === "kg" ? 1000 : 1),
        name,
        fullName: record.name,
        brand: brandInfo.slug,
        brandInfo,
        category: category.slug,
        categoryInfo: category,
        flavour: record.flavour,
        size: `${record.weight} ${record.weightUnit}`,
        servings: record.servingsPerContainer,
        price: record.price ?? null,
        availability: "unconfirmed",
        placeholderFields: [],
        images: images.length ? images : [{ src: "/brand/logo-hv.png", alt: "", width: 480, height: 480 }],
        description: [record.description || record.shortDescription].filter(Boolean),
        features: record.benefits ?? [],
        labelStats: record.nutritionFacts?.map(({ name, amount, unit }) => ({ label: name, value: amount, unit })),
        usage: record.usageInstructions,
        sku: record.sku,
      };
    });
    // Each variant carries its siblings (smallest size first) for the size toggle.
    const families = Map.groupBy(live, (product) => product.family);
    for (const product of live) {
      product.variants = families
        .get(product.family)
        .map(({ id, slug, flavour, size, servings, price, grams }) => ({ id, slug, flavour, size, servings, price, grams }))
        .sort((a, b) => a.grams - b.grams);
    }
    // Listings show one card per family: its smallest size.
    const listed = [...families.values()].map((group) => group.reduce((a, b) => (b.grams < a.grams ? b : a)));

    return {
      categories: [...categoryList.values()],
      products: [...listed, ...products],
      allProducts: [...live, ...products],
    };
  } catch (error) {
    console.error("Unable to load the public catalog", error.message);
    return { categories, products, allProducts: products, unavailable: true };
  }
});

/** "BCAA 100g Lemon" → "BCAA Lemon": the size is shown and toggled separately. */
function withoutSize(name, weight, unit) {
  const amount = String(weight).replace(".", "\\.");
  const stripped = name.replace(new RegExp(`\\s*\\b${amount}\\s*${unit}\\b`, "i"), "").replace(/\s{2,}/g, " ").trim();
  return stripped || name;
}
