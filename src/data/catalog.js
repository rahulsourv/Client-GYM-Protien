/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  HV NUTRITION — CENTRAL CATALOG
 * ─────────────────────────────────────────────────────────────────────────────
 *  Single source of truth for brands, categories and products.
 *
 *  • Third-party products come from a snapshot of the public WooCommerce Store
 *    API on hvnutrition.in (see scripts/import-catalog.mjs). Names, prices,
 *    listed MRPs, feature bullets, descriptions and images are as listed there.
 *  • Fields marked `PLACEHOLDER` are NOT verified and must be confirmed by the
 *    store owner before launch. The UI shows a visible "To be confirmed" tag
 *    wherever `placeholder` data is rendered.
 *
 *  To connect Shopify / WooCommerce / a custom API, replace `products` below
 *  with a fetch + mapping into the same shape (see `Product` typedef).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import source from "./source/hvnutrition-products.json";

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} name          Short display name
 * @property {string} fullName      Full listing title
 * @property {string} brand         brand slug
 * @property {string} category      category slug
 * @property {number} price         INR
 * @property {number|null} listedMrp  "Original price" as listed on the old site (unverified MRP)
 * @property {{src:string,width:number,height:number,alt:string}[]} images
 * @property {string[]} description paragraphs
 * @property {string[]} features
 * @property {string|null} flavour
 * @property {string|null} size     net weight / volume
 * @property {number|null} servings
 * @property {string|null} family   products sharing a family are presented as variants
 * @property {"in_stock"|"out_of_stock"|"unconfirmed"} availability
 * @property {boolean} featured
 * @property {Object|null} nutrition    null = not provided
 * @property {string[]|null} ingredients null = not provided
 * @property {string|null} usage        null = not provided
 * @property {string[]} placeholderFields  names of fields that are unverified
 */

export const brands = [
  {
    slug: "hv-nutrition",
    name: "HV Nutrition",
    own: true,
    tagline: "Our own formula.",
    description:
      "HV Nutrition’s house line. Built in Surat by a team with a decade in sports nutrition and fifteen years in bodybuilding.",
  },
  {
    slug: "wellcore",
    name: "Wellcore",
    own: false,
    tagline: "Micronised creatine, in every flavour on our shelf.",
    description:
      "Wellcore (by Wellversed) is an independent brand. HV Nutrition stocks its micronised creatine range in multiple flavours and pack sizes.",
  },
  {
    slug: "rebuild",
    name: "Rebuild",
    own: false,
    tagline: "Pre-workout from Rebuild Sports Nutrition.",
    description:
      "Rebuild Sports Nutrition is an independent brand. HV Nutrition stocks its PUMP-AF pre-workout.",
  },
];

export const categories = [
  {
    slug: "whey-protein",
    name: "Whey Protein",
    short: "Protein",
    description: "Whey protein powders for your daily protein intake.",
  },
  {
    slug: "creatine",
    name: "Creatine",
    short: "Creatine",
    description: "Micronised creatine monohydrate — flavoured and unflavoured, small and large packs.",
  },
  {
    slug: "pre-workout",
    name: "Pre-Workout",
    short: "Pre",
    description: "Pre-workout formulas taken before training.",
  },
];

/* ── Enrichment for imported products, keyed by the store's product ID ─────── */
const enrich = {
  1402: { brand: "rebuild", category: "pre-workout", name: "PUMP-AF Pre-Workout", flavour: "Pineapple", size: "450g", servings: 30, family: "rebuild-pump-af", featured: true },
  // Wellcore micronised creatine — one family, flavour × pack-size variants.
  1092: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Tropical Tango", size: "122g", servings: 33, family: "wellcore-creatine", featured: true },
  1265: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Watermelon Wave", size: "122g", servings: 33, family: "wellcore-creatine" },
  1270: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Unflavoured", size: "100g", servings: 33, family: "wellcore-creatine" },
  1274: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Fruit Fusion", size: "122g", servings: 33, family: "wellcore-creatine" },
  1279: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Kiwi Kick", size: "122g", servings: 33, family: "wellcore-creatine" },
  1311: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Lemon Lime", size: "149g", servings: 33, family: "wellcore-creatine" },
  1283: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Watermelon Wave", size: "307g", servings: 83, family: "wellcore-creatine", featured: true },
  1288: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Unflavoured", size: "250g", servings: 83, family: "wellcore-creatine" },
  1293: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Tropical Tango", size: "307g", servings: 83, family: "wellcore-creatine" },
  1298: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Fruit Fusion", size: "307g", servings: 83, family: "wellcore-creatine" },
  1303: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Kiwi Kick", size: "307g", servings: 83, family: "wellcore-creatine" },
  1307: { brand: "wellcore", category: "creatine", name: "Micronised Creatine", flavour: "Lemon Lime", size: "374g", servings: 83, family: "wellcore-creatine" },
};

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const brandName = (slug) => brands.find((b) => b.slug === slug)?.name ?? slug;

const imported = source.products
  .filter((p) => enrich[p.sourceId])
  .map((p) => {
    const e = enrich[p.sourceId];
    const fullName = p.name.replace(/\s*\|\s*$/, "").trim();
    return {
      id: String(p.sourceId),
      slug: slugify(`${brandName(e.brand)} ${e.name} ${e.flavour ?? ""} ${e.size ?? ""}`),
      legacySlug: p.sourceSlug,
      name: e.name,
      fullName,
      brand: e.brand,
      category: e.category,
      price: p.price,
      listedMrp: p.regularPrice && p.regularPrice > p.price ? p.regularPrice : null,
      images: p.images
        .filter((im) => im.width >= 200) // drop tiny thumbnails from the source
        .map((im, i) => ({
          src: im.src,
          width: im.width,
          height: im.height,
          alt: `${brandName(e.brand)} ${e.name}${e.flavour ? ` ${e.flavour}` : ""}${e.size ? ` ${e.size}` : ""} — image ${i + 1}`,
        })),
      description: p.description,
      features: p.features,
      flavour: e.flavour ?? null,
      size: e.size ?? null,
      servings: e.servings ?? null,
      family: e.family ?? null,
      availability: p.inStock ? "in_stock" : "out_of_stock",
      featured: Boolean(e.featured),
      // Not published on the source listing → intentionally null (UI says "not provided").
      nutrition: null,
      ingredients: null,
      usage: null,
      placeholderFields: [],
      source: p.sourceUrl,
    };
  });

/* ── HV Nutrition’s own product ───────────────────────────────────────────────
 * Not listed in the live store’s product catalog. Facts below come from:
 *   • the packaging artwork supplied by the owner (public/assets/…Tub.png)
 *   • the live homepage tile “Whey Protien — From ₹999”
 * Everything else is PLACEHOLDER — confirm before launch.
 */
export const HV_WHEY_ID = "hv-whey";

const hvWhey = {
  id: HV_WHEY_ID,
  slug: "hv-nutrition-whey-protein-chocolate-1kg",
  legacySlug: null,
  name: "Whey Protein",
  fullName: "HV Nutrition Whey Protein — Chocolate, 1kg",
  brand: "hv-nutrition",
  category: "whey-protein",
  price: 999, // PLACEHOLDER — from the homepage tile “From ₹999”; confirm price for the 1kg tub.
  listedMrp: null,
  images: [
    {
      src: "/assets/HV Nutrition Whey Protein Tub.png",
      width: 1170,
      height: 1344,
      alt: "HV Nutrition Whey Protein tub, chocolate flavour, 1kg",
    },
  ],
  description: [
    // PLACEHOLDER copy — draft for the owner to edit. No claims beyond the label.
    "HV Nutrition’s own whey protein. One tub, one job: help you hit your daily protein with a scoop you actually look forward to.",
    "The label lists 24g protein, 5.5g BCAAs and 4g glutamine. Full nutrition panel, ingredients and serving guidance will be published here once confirmed.",
  ],
  // From the packaging artwork.
  features: [
    "100% Premium Whey Protein (as printed on pack)",
    "24g protein (as printed on pack)",
    "5.5g BCAAs (as printed on pack)",
    "4g glutamine (as printed on pack)",
    "Chocolate flavour",
    "Net wt. 1kg",
  ],
  labelStats: [
    { value: 24, unit: "g", label: "Protein" },
    { value: 5.5, unit: "g", label: "BCAAs" },
    { value: 4, unit: "g", label: "Glutamine" },
  ],
  flavour: "Chocolate",
  size: "1kg",
  servings: null,
  family: "hv-whey",
  availability: "unconfirmed", // PLACEHOLDER — not listed in the live store
  featured: true,
  nutrition: null,
  ingredients: null,
  usage: null,
  placeholderFields: ["price", "description", "availability"],
  source: null,
};

/** @type {Product[]} */
export const products = [hvWhey, ...imported];

export const store = {
  name: "HV Nutrition",
  founder: "Harsh Parmar",
  city: "Surat",
  // From hvnutrition.in/contact-us
  address: "Ganeshpura Housing, Amroli, Surat, Gujarat 394107",
  phone: "+91 70481 36688",
  phoneHref: "tel:+917048136688",
  email: "hvnutritionservices@hvnutrition.in",
  // From hvnutrition.in/about-us
  yearsInNutrition: 10,
  yearsInBodybuilding: 15,
  // From the homepage service strip
  shippingNote: "Free shipping on all Surat orders.",
};
