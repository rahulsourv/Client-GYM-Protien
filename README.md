This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

The frontend uses the HV Nutrition backend on Render by default. To use a
locally running backend instead, set this in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Next.js uses this backend URL for catalog and login requests. Use `/login` with a seeded admin
account, or enter a product verification code on `/verified`. Product QR links
can open `/verify/product/<productToken>` directly.

The admin profile generates printable category QR codes using the current site
origin. Set `NEXT_PUBLIC_CATALOG_ORIGIN` to your public site origin if you need
to print codes from localhost that will work on other devices.

To enable uploads from **Profile → Add Product**, add these server-only
variables to the backend's ignored `.env`, or to its hosting environment,
then restart the backend.

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

You can also set the single `CLOUDINARY_URL` value from your Cloudinary console.

The product record stores the HTTPS image URLs. The first image is used on
catalog cards, and the product detail page displays all uploaded images.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
