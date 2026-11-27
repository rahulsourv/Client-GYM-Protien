import { Suspense } from "react";
import { notFound } from "next/navigation";
import CategoryQRResult from "@/components/verified/CategoryQRResult";
import { getPublicCatalog } from "@/lib/publicCatalog";

export const metadata = {
  title: "Category QR verification",
  robots: { index: false },
};

const messageStyle = "shell py-32 text-center";

export default function CategoryQRPage({ params }) {
  return (
    <Suspense fallback={<p role="status" className={messageStyle}>Checking category QR code…</p>}>
      <CategoryQRContent params={params} />
    </Suspense>
  );
}

async function CategoryQRContent({ params }) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/.test(id)) notFound();

  const { categories, unavailable } = await getPublicCatalog();
  if (unavailable) {
    return <p role="status" className={messageStyle}>Category verification is temporarily unavailable. Try scanning again shortly.</p>;
  }
  const category = categories.find((item) => item.id === id);
  if (!category) notFound();

  return <CategoryQRResult name={category.name} href={`/collections/${encodeURIComponent(category.slug)}`} />;
}
