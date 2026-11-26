import { products, collectionSlugs } from "@/lib/catalog";

const BASE = "https://hvnutrition.in";

export default function sitemap() {
  return [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/shop`, priority: 0.9 },
    { url: `${BASE}/verified`, priority: 0.8 },
    { url: `${BASE}/about` },
    { url: `${BASE}/contact` },
    ...collectionSlugs().map((s) => ({ url: `${BASE}/collections/${s}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${BASE}/products/${p.slug}`, priority: 0.7 })),
  ];
}
