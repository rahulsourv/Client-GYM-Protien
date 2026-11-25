export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart"] },
    sitemap: "https://hvnutrition.in/sitemap.xml",
  };
}
