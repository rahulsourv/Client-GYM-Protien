import PageHeader from "@/components/layout/PageHeader";
import VerifiedView from "@/components/verified/VerifiedView";
import { store } from "@/data/catalog";

export const metadata = {
  title: "Verified — FSSAI registered",
  description: `${store.legalName} (HV Nutrition) is FSSAI registered. Registration No. ${store.fssai.number}, valid until ${store.fssai.validUntil}. View the certificate or verify it on FoSCoS.`,
  alternates: { canonical: "/verified" },
};

export default function VerifiedPage() {
  return (
    <>
      <PageHeader
        eyebrow="Verified supplier"
        lines={["FSSAI", <span key="r" className="text-lime">registered.</span>]}
        description="Government-registered under the Food Safety and Standards Act, 2006. Here’s the certificate — and how to check it yourself."
        crumbs={[{ label: "Verified" }]}
      />
      <VerifiedView />
    </>
  );
}
