import { backendUrl } from "./src/lib/backendUrl.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: ["/verify/product/:token", "/verify/product/:token/scan"].map((path) => ({
        source: `/api/hv${path}`,
        destination: backendUrl(path),
      })),
    };
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Product sources are mostly AVIF/WebP/JPG at modest resolution.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
