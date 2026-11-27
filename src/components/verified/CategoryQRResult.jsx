"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export default function CategoryQRResult({ name, href }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace(href), 3000);
    return () => window.clearTimeout(timer);
  }, [href, router]);

  return (
    <section aria-labelledby="category-qr-result" className="shell flex min-h-[70svh] flex-col items-center justify-center gap-5 pb-14 pt-28 text-center">
      <CircleCheck className="size-20 text-green-700 dark:text-green-400" strokeWidth={2} aria-hidden />
      <h1 id="category-qr-result" className="display max-w-3xl text-4xl leading-none sm:text-6xl">
        Authenticated HV Nutrition Product
      </h1>
      <p className="text-soft">Official HV Nutrition category QR for <strong>{name}</strong>.</p>
      <p className="text-sm text-mute">Opening the category page shortly.</p>
      <LinkButton href={href}>Continue to category</LinkButton>
    </section>
  );
}
