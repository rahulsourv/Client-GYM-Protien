"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";

export default function CategoryQRSection({ categories, error }) {
  return (
    <section id="qr" aria-labelledby="category-qr-heading" className="scroll-mt-28 space-y-5 border border-line p-6 lg:col-span-2">
      <h2 id="category-qr-heading" className="display text-4xl">QR</h2>
      {error ? (
        <p role="alert">Category QR codes could not be loaded.</p>
      ) : !categories ? (
        <p role="status">Loading category QR codes…</p>
      ) : categories.length === 0 ? (
        <p>No categories yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => <CategoryQR key={category._id} category={category} />)}
        </ul>
      )}
    </section>
  );
}

function CategoryQR({ category }) {
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const origin = process.env.NEXT_PUBLIC_CATALOG_ORIGIN || window.location.origin;
        const url = new URL(`/categories/qr/${category._id}`, origin).href;
        const image = await QRCode.toDataURL(url, { width: 600, margin: 4, errorCorrectionLevel: "M" });
        if (!cancelled) setCode({ url, image });
      } catch {
        if (!cancelled) setError("This QR code could not be generated.");
      }
    }
    generate();
    return () => { cancelled = true; };
  }, [category._id]);

  async function print() {
    setError("");
    const preview = window.open("", "_blank");
    if (!preview) {
      setError("Allow pop-ups in your browser to print this QR code.");
      return;
    }
    preview.opener = null;
    const doc = preview.document;
    doc.title = `${category.name} QR`;
    const style = doc.createElement("style");
    style.textContent = "body { margin: 2cm; text-align: center; font: 16px system-ui; color: #000; } img { width: 65mm; height: 65mm; display: block; margin: 0 auto; } p { overflow-wrap: anywhere; }";
    doc.head.append(style);
    const heading = doc.createElement("h1");
    heading.textContent = category.name;
    const image = doc.createElement("img");
    image.alt = `QR code for ${category.name}`;
    image.src = code.image;
    const url = doc.createElement("p");
    url.textContent = code.url;
    doc.body.append(heading, image, url);
    try {
      await image.decode();
      if (!preview.closed) {
        preview.focus();
        preview.print();
      }
    } catch {
      preview.close();
      setError("The print preview could not load. Download the PNG to print it.");
    }
  }

  return (
    <li className="flex flex-col items-start gap-3 border border-line p-4">
      <h3 className="text-xl font-medium">{category.name}</h3>
      {category.status === "INACTIVE" && <p className="text-sm text-mute">Inactive</p>}
      {code && (
        <>
          <Image src={code.image} alt={`QR code for ${category.name}`} width={180} height={180} unoptimized className="bg-white" />
          <div className="mt-auto flex flex-wrap gap-2">
            <a href={code.image} download={`${category.slug}-qr.png`} className="inline-flex h-14 items-center bg-gold px-7 font-mono text-xs font-medium uppercase tracking-widest text-ink hover:bg-warm hover:text-obsidian">
              Download PNG
            </a>
            <Button type="button" variant="ghost" onClick={print}>Print</Button>
          </div>
        </>
      )}
      {error && <p role="alert" className="text-sm">{error}</p>}
    </li>
  );
}
