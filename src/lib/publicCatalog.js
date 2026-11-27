import { cache } from "react";
import { connection } from "next/server";
import { backendUrl } from "@/lib/backendUrl";
import { brands, categories, products } from "@/lib/catalog";

export const getPublicCatalog = cache(async () => {
  await connection();
  try {
    const response = await fetch(backendUrl("/catalog"), { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Catalog API returned ${response.status}`);
    const { data } = await response.json();
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
      return {
        id: record._id,
        slug: `catalog-${record._id}`,
        name: record.name,
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
    return {
      categories: [...categoryList.values()],
      products: [...live, ...products],
    };
  } catch (error) {
    console.error("Unable to load the public catalog", error.message);
    return { categories, products, unavailable: true };
  }
});
