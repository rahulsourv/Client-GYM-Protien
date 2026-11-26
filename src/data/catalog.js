/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  HV NUTRITION — CENTRAL CATALOG
 * ─────────────────────────────────────────────────────────────────────────────
 *  Single source of truth for brands, categories and products.
 *
 *  • Fields marked `PLACEHOLDER` are NOT verified and must be confirmed by the
 *    store owner before launch. The UI shows a visible "To be confirmed" tag
 *    wherever `placeholder` data is rendered.
 *
 *  To connect Shopify / WooCommerce / a custom API, replace `products` below
 *  with a fetch + mapping into the same shape (see `Product` typedef).
 * ─────────────────────────────────────────────────────────────────────────────
 */
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
      "HV Nutrition’s house line, from High Voltage Nutrition in Uttarpara, Hooghly.",
  },
];

export const categories = [
  {
    slug: "whey-protein",
    name: "Whey Protein",
    short: "Protein",
    description: "Whey protein powders for your daily protein intake.",
  },
];

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
export const products = [hvWhey];

export const store = {
  name: "HV Nutrition",
  // Name, owner and address as printed on the FSSAI registration certificate.
  legalName: "High Voltage Nutrition",
  founder: "Suvodip Ghosh",
  city: "Uttarpara",
  region: "Hooghly, West Bengal",
  street: "7/1, Drubesh Chatterjee Lane, Uttarpara",
  postcode: "712258",
  address: "7/1, Drubesh Chatterjee Lane, Uttarpara, Hooghly, West Bengal 712258",
  // From hvnutrition.in/contact-us — confirm these are still current.
  phone: "+91 70481 36688",
  phoneHref: "tel:+917048136688",
  email: "hvnutritionservices@hvnutrition.in",
  // PLACEHOLDER — years of experience for the current owner not yet provided.
  yearsInNutrition: null,
  yearsInBodybuilding: null,
  // PLACEHOLDER — shipping terms for the Uttarpara store not yet provided.
  shippingNote: null,
  fssai: {
    number: "22826093000182",
    type: "Registration",
    kind: "Retailer",
    issuedOn: "2 Nov 2026",
    validUntil: "1 Nov 2027",
    authority: "Hooghly, Govt. of West Bengal",
    status: "Registration Certificate issued",
    // Product Annexure of the certificate.
    categories: [
      "13 — Foodstuffs intended for particular nutritional uses",
      "100 — Standardised food products (excluding categories 1–14)",
    ],
    pdf: "/assets/fssai-registration-certificate.pdf",
    portal: "https://foscos.fssai.gov.in",
  },
};
