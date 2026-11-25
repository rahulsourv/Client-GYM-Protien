import { products, brands, categories, HV_WHEY_ID } from "@/data/catalog";

export { products, brands, categories, HV_WHEY_ID };

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export const formatPrice = (n) => inr.format(n);

export const getProduct = (slug) => products.find((p) => p.slug === slug) ?? null;
export const getProductById = (id) => products.find((p) => p.id === id) ?? null;
export const getBrand = (slug) => brands.find((b) => b.slug === slug) ?? null;
export const getCategory = (slug) => categories.find((c) => c.slug === slug) ?? null;
export const hvWhey = () => getProductById(HV_WHEY_ID);

export const byBrand = (slug) => products.filter((p) => p.brand === slug);
export const byCategory = (slug) => products.filter((p) => p.category === slug);
export const featured = () => products.filter((p) => p.featured);

/** Collections are either a brand or a category. */
export function getCollection(slug) {
  const brand = getBrand(slug);
  if (brand) return { type: "brand", slug, title: brand.name, description: brand.description, brand };
  const cat = getCategory(slug);
  if (cat) return { type: "category", slug, title: cat.name, description: cat.description, category: cat };
  return null;
}
export const collectionSlugs = () => [...brands.map((b) => b.slug), ...categories.map((c) => c.slug)];

/** Sibling variants (flavour / size) of a product. */
export function getVariants(product) {
  if (!product.family) return [product];
  return products.filter((p) => p.family === product.family);
}

export function related(product, n = 4) {
  const others = products.filter((p) => p.id !== product.id && p.family !== product.family);
  const score = (p) => (p.category === product.category ? 2 : 0) + (p.brand === product.brand ? 1 : 0);
  // One representative per family keeps the related row varied.
  const seen = new Set();
  return others
    .sort((a, b) => score(b) - score(a))
    .filter((p) => (p.family ? !seen.has(p.family) && seen.add(p.family) : true))
    .slice(0, n);
}

/** Collapse a family to one card (cheapest in-stock first) for browsing views. */
export function onePerFamily(list) {
  const map = new Map();
  for (const p of list) {
    const key = p.family ?? p.id;
    const cur = map.get(key);
    if (!cur || p.price < cur.price) map.set(key, p);
  }
  return [...map.values()];
}

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ");

export function searchProducts(query) {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products
    .map((p) => {
      const hay = norm(
        [p.name, p.fullName, getBrand(p.brand)?.name, getCategory(p.category)?.name, p.flavour, p.size].join(" ")
      );
      const name = norm(`${getBrand(p.brand)?.name} ${p.name} ${p.flavour}`);
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return null;
        score += name.includes(t) ? 2 : 1;
      }
      return { p, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .map((r) => r.p);
}

export const priceBounds = () => {
  const prices = products.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
};

/**
 * Filter + sort used by the shop, collections and homepage discovery.
 * @param {{brands?:string[],categories?:string[],maxPrice?:number,inStockOnly?:boolean,query?:string,sort?:string}} f
 */
export function filterProducts(list, f = {}) {
  let out = f.query ? searchProducts(f.query).filter((p) => list.includes(p)) : [...list];
  if (f.brands?.length) out = out.filter((p) => f.brands.includes(p.brand));
  if (f.categories?.length) out = out.filter((p) => f.categories.includes(p.category));
  if (f.maxPrice != null) out = out.filter((p) => p.price <= f.maxPrice);
  if (f.inStockOnly) out = out.filter((p) => p.availability === "in_stock");
  switch (f.sort) {
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    default:
      // Featured: own brand first, then featured flag, then keep catalog order.
      if (!f.query)
        out.sort(
          (a, b) =>
            (b.brand === "hv-nutrition") - (a.brand === "hv-nutrition") || Number(b.featured) - Number(a.featured)
        );
  }
  return out;
}

export const availabilityLabel = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  unconfirmed: "Availability to be confirmed",
};
