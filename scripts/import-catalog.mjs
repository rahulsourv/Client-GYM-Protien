/**
 * One-off importer: pulls the public WooCommerce Store API catalog from
 * hvnutrition.in, downloads product images into /public/products and writes a
 * raw snapshot to src/data/source/hvnutrition-products.json.
 *
 * The app never reads the live site at runtime. Re-run to refresh:
 *   node scripts/import-catalog.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const API = "https://hvnutrition.in/wp-json/wc/store/v1/products?per_page=100";
const IMG_DIR = path.join(ROOT, "public", "products");
const OUT = path.join(ROOT, "src", "data", "source", "hvnutrition-products.json");

const decode = (s) =>
  s
    .replace(/&#8211;/g, "–")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "");
const strip = (h) => decode(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const all = (re, h) => [...h.matchAll(re)].map((m) => strip(m[1])).filter(Boolean);

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // Normalise every source (avif/webp/jpg) to high-quality webp with known dimensions.
  const img = sharp(buf);
  const meta = await img.metadata();
  await img.webp({ quality: 92 }).toFile(dest);
  return { width: meta.width, height: meta.height };
}

const products = await (await fetch(API)).json();
await fs.mkdir(IMG_DIR, { recursive: true });
await fs.mkdir(path.dirname(OUT), { recursive: true });

const snapshot = [];
for (const p of products) {
  const seen = new Set();
  const images = [];
  for (const [i, im] of p.images.entries()) {
    if (seen.has(im.src)) continue; // the store lists some images twice
    seen.add(im.src);
    const file = `${p.id}-${i}.webp`;
    const dims = await download(im.src, path.join(IMG_DIR, file));
    images.push({ src: `/products/${file}`, ...dims, sourceUrl: im.src });
  }
  const minor = p.prices.currency_minor_unit;
  const toRupees = (v) => (v ? Number(v) / 10 ** minor : null);
  snapshot.push({
    sourceId: p.id,
    sourceSlug: p.slug,
    sourceUrl: p.permalink,
    name: decode(p.name),
    price: toRupees(p.prices.price),
    regularPrice: toRupees(p.prices.regular_price),
    inStock: p.is_in_stock,
    categories: p.categories.map((c) => decode(c.name)),
    features: all(/<li[^>]*>([\s\S]*?)<\/li>/g, p.short_description).concat(
      /<li/.test(p.short_description)
        ? []
        : strip(p.short_description).split("✔").slice(1).map((s) => s.trim())
    ),
    description: all(/<p[^>]*>([\s\S]*?)<\/p>/g, p.description),
    images,
  });
  console.log("✓", p.id, images.length, "images");
}

await fs.writeFile(OUT, JSON.stringify({ importedAt: new Date().toISOString(), source: API, products: snapshot }, null, 2));

// Brand logo from the live site.
await fs.mkdir(path.join(ROOT, "public", "brand"), { recursive: true });
const logo = await fetch("https://hvnutrition.in/wp-content/uploads/2026/06/logo-hv.png");
await fs.writeFile(path.join(ROOT, "public", "brand", "logo-hv.png"), Buffer.from(await logo.arrayBuffer()));
console.log("done →", OUT);
