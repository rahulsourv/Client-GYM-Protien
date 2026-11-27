#!/usr/bin/env node
/**
 * Loads scripts/catalogue/catalogue.json into the HV Nutrition backend.
 *
 *   node scripts/catalogue/import-catalogue.mjs            # import (asks for admin email + password)
 *   node scripts/catalogue/import-catalogue.mjs --prune    # …and deactivate products and categories
 *                                                          #    that are not in catalogue.json
 *   node scripts/catalogue/import-catalogue.mjs --dry-run  # show the catalogue, no network
 *
 * Options
 *   --images-base=https://site/assets/products/   use images already hosted there
 *                                                 instead of uploading to Cloudinary
 *   HV_API=http://localhost:5000/api/v1           backend to use (defaults to
 *                                                 VITE_API_BASE_URL, then the Render backend)
 *
 * Safe to re-run: categories and SKUs that already exist are updated, not
 * duplicated. Deactivated products can be reactivated from the admin.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const here = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(here, "../../public/assets/products");
const imageCacheFile = join(here, ".uploaded-images.json");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const prune = args.has("--prune");
const imagesBase = process.argv.find((a) => a.startsWith("--images-base="))?.split("=")[1];
const apiBase = (process.env.HV_API || process.env.VITE_API_BASE_URL || "https://hv-backend-1.onrender.com/api/v1").replace(/\/+$/, "");

const catalogue = JSON.parse(await readFile(join(here, "catalogue.json"), "utf8"));
const { products } = catalogue;

if (new Set(products.map((p) => p.sku)).size !== products.length) throw new Error("Two catalogue products share a SKU.");
for (const p of products) {
  if (!catalogue.categories.some((c) => c.name === p.category)) throw new Error(`${p.sku}: unknown category "${p.category}".`);
}

if (dryRun) {
  for (const p of products) {
    console.log(`${p.sku.padEnd(32)} ${p.category.padEnd(18)} ${p.name} · ${p.flavour ?? "—"} · ${p.weight} ${p.weightUnit}${p.price == null ? "" : ` · ₹${p.price}`}`);
  }
  console.log(`\n${catalogue.categories.length} categories, ${products.length} products. Nothing was sent.`);
  process.exit(0);
}

/** Backend fields for a catalogue product (category and image are added separately). */
function productFields(p) {
  return {
    name: p.name,
    sku: p.sku,
    brand: "HV Nutrition",
    weight: p.weight,
    weightUnit: p.weightUnit,
    ...(p.flavour && { flavour: p.flavour }),
    ...(p.price != null && { price: p.price }),
    ...(p.servings && { servingsPerContainer: p.servings }),
    ...(p.servingSize && { servingSize: p.servingSize }),
    ...(p.shortDescription && { shortDescription: p.shortDescription }),
    ...((p.description || p.shortDescription) && { description: p.description || p.shortDescription }),
    ...(p.usage && { usageInstructions: p.usage }),
    ...(p.benefits && { benefits: p.benefits }),
    ...(p.nutritionFacts && { nutritionFacts: p.nutritionFacts.map(([name, amount, unit]) => ({ name, amount, unit })) }),
  };
}

/* ───────── HTTP with login, rate-limit and cold-start handling ───────── */

let credentials;
let token;

async function ask(question, { hidden = false } = {}) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
  }
  const answer = await new Promise((resolve) => rl.question(question, resolve));
  rl.close();
  if (hidden) process.stdout.write("\n");
  return answer.trim();
}

async function login() {
  const response = await call("POST", "/auth/login", { json: credentials, auth: false });
  token = response.accessToken;
  if (!token) throw new Error("The backend did not return an access token.");
}

async function call(method, path, { json, raw, contentType, auth = true } = {}, attempt = 0) {
  const headers = { Accept: "application/json" };
  if (auth) headers.Authorization = `Bearer ${token}`;
  if (json) headers["Content-Type"] = "application/json";
  if (raw) headers["Content-Type"] = contentType;
  let response;
  try {
    response = await fetch(apiBase + path, {
      method,
      headers,
      body: json ? JSON.stringify(json) : raw,
      signal: AbortSignal.timeout(60000),
    });
  } catch (error) {
    // Render's free tier sleeps; the first requests can time out while it wakes.
    if (attempt < 4) {
      console.log(`  backend not reachable (${error.cause?.code || error.name}), retrying…`);
      await sleep(10000);
      return call(method, path, { json, raw, contentType, auth }, attempt + 1);
    }
    throw error;
  }
  const payload = await response.json().catch(() => null);

  if (response.status === 429 && attempt < 20) {
    const reset = Number(response.headers.get("retry-after") || response.headers.get("ratelimit-reset")) || 60;
    console.log(`  rate limited by the backend, waiting ${reset}s…`);
    await sleep((reset + 1) * 1000);
    return call(method, path, { json, raw, contentType, auth }, attempt + 1);
  }
  if (response.status === 401 && auth && attempt === 0) {
    await login();
    return call(method, path, { json, raw, contentType, auth }, attempt + 1);
  }
  if (response.status >= 500 && response.status !== 503 && attempt < 3) {
    await sleep(5000);
    return call(method, path, { json, raw, contentType, auth }, attempt + 1);
  }
  if (!response.ok) {
    const error = new Error(`${method} ${path} → ${response.status}: ${payload?.message || "request failed"}`);
    error.status = response.status;
    error.code = payload?.code;
    throw error;
  }
  return payload?.data ?? payload;
}

async function listAll(resource) {
  const items = [];
  for (let page = 1, pages = 1; page <= pages; page += 1) {
    const data = await call("GET", `/admin/${resource}?limit=100&page=${page}`);
    items.push(...data.items);
    pages = data.pagination.totalPages;
  }
  return items;
}

/* ───────── Import ───────── */

console.log(`Backend: ${apiBase}`);
credentials = {
  email: process.env.HV_ADMIN_EMAIL || (await ask("Admin email: ")),
  password: process.env.HV_ADMIN_PASSWORD || (await ask("Admin password: ", { hidden: true })),
};
await login();
console.log("Signed in.");

// Images: upload each file once (keyed by its content) and remember the URL.
const imageUrls = {};
const previousUploads = new Set();
if (imagesBase) {
  for (const p of products) imageUrls[p.image] = new URL(p.image, imagesBase.endsWith("/") ? imagesBase : `${imagesBase}/`).href;
} else {
  const { configured } = await call("GET", "/admin/product-images");
  if (!configured) {
    console.log("! Image uploads are not configured on the backend (Cloudinary). Products will be saved without images.");
    console.log("  Set Cloudinary on the backend and re-run, or pass --images-base=<public URL of public/assets/products/>.");
  } else {
    const cache = JSON.parse(await readFile(imageCacheFile, "utf8").catch(() => "{}"));
    // Everything this script ever uploaded counts as ours, so older versions get replaced.
    for (const url of Object.values(cache)) previousUploads.add(url);
    for (const file of new Set(products.map((p) => p.image))) {
      const bytes = await readFile(join(imagesDir, file));
      const key = `${file}#${createHash("sha1").update(bytes).digest("hex").slice(0, 12)}`;
      if (!cache[key]) {
        const contentType = /\.jpe?g$/i.test(file) ? "image/jpeg" : /\.webp$/i.test(file) ? "image/webp" : "image/png";
        const { url } = await call("POST", "/admin/product-images", { raw: bytes, contentType });
        cache[key] = url;
        await writeFile(imageCacheFile, JSON.stringify(cache, null, 2));
        console.log(`  uploaded ${file}`);
      }
      imageUrls[file] = cache[key];
    }
  }
}

const id = (record) => record._id ?? record.id;

// Categories: create missing ones, reactivate and describe existing ones.
const categories = await listAll("categories");
const categoryIds = {};
for (const c of catalogue.categories) {
  let category = categories.find((x) => x.name.toLowerCase() === c.name.toLowerCase());
  if (!category) {
    category = await call("POST", "/admin/categories", { json: { name: c.name, description: c.description } });
    console.log(`+ category ${c.name}`);
  } else if (category.status !== "ACTIVE" || category.description !== c.description) {
    await call("PATCH", `/admin/categories/${id(category)}`, { json: { status: "ACTIVE", description: c.description } });
    console.log(`~ category ${c.name}`);
  }
  categoryIds[c.name] = id(category);
}

// Products.
const all = await listAll("products");
const existing = new Map(all.map((product) => [product.sku, product]));
const ourImages = new Set([...previousUploads, ...Object.values(imageUrls)]);
const summary = { created: 0, updated: 0, deactivated: 0, failed: 0 };
for (const [index, p] of products.entries()) {
  const label = `[${index + 1}/${products.length}] ${p.sku}`;
  const image = imageUrls[p.image];
  const body = { ...productFields(p), categoryId: categoryIds[p.category], ...(image && { imageUrls: [image] }) };
  try {
    const current = existing.get(p.sku);
    if (!current) {
      await call("POST", "/admin/products", { json: body });
      summary.created += 1;
      console.log(`+ ${label} ${p.name}`);
      continue;
    }
    const { sku: _sku, ...patch } = body;
    // Keep photos added by hand in the admin; only replace our own uploads.
    if (current.imageUrls?.some((url) => !ourImages.has(url))) delete patch.imageUrls;
    await call("PATCH", `/admin/products/${id(current)}`, { json: { ...patch, status: "ACTIVE" } });
    summary.updated += 1;
    console.log(`~ ${label} ${p.name}`);
  } catch (error) {
    summary.failed += 1;
    console.log(`! ${label}: ${error.message}`);
  }
}

// --prune: deactivate (not delete) everything that is no longer in the catalogue.
if (prune) {
  const keep = new Set(products.map((p) => p.sku));
  for (const product of all.filter((x) => x.status === "ACTIVE" && !keep.has(x.sku))) {
    try {
      await call("PATCH", `/admin/products/${id(product)}/deactivate`);
      summary.deactivated += 1;
      console.log(`- ${product.sku} ${product.name}`);
    } catch (error) {
      summary.failed += 1;
      console.log(`! ${product.sku}: ${error.message}`);
    }
  }
  const keepCategories = new Set(Object.values(categoryIds));
  for (const category of categories.filter((x) => x.status === "ACTIVE" && !keepCategories.has(id(x)))) {
    try {
      await call("PATCH", `/admin/categories/${id(category)}/deactivate`);
      console.log(`- category ${category.name}`);
    } catch (error) {
      summary.failed += 1;
      console.log(`! category ${category.name}: ${error.message}`);
    }
  }
}

console.log(`\nDone. ${summary.created} created, ${summary.updated} updated, ${summary.deactivated} deactivated, ${summary.failed} failed.`);
if (summary.failed) process.exitCode = 1;
