"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, CircleAlert, X } from "lucide-react";
import CategoryQRSection from "@/components/auth/CategoryQRSection";
import CatalogEditor from "@/components/auth/CatalogEditor";
import { Button } from "@/components/ui/Button";
import { api, listAdminRecords } from "@/lib/api";
import { imageTypes, maxProductImages, validateProductImage } from "@/lib/productImages";
import { useAccount } from "@/store/account";

const inputStyle = "mt-2 w-full border border-line bg-obsidian p-3";
const imageUploadPath = "/api/hv/admin/product-images";

export default function AddProductForm({ token }) {
  const { updateSession } = useAccount();
  const router = useRouter();
  const [categories, setCategories] = useState(null);
  const [categoryError, setCategoryError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [productRevision, setProductRevision] = useState(0);
  const [uploadProgress, setUploadProgress] = useState("");
  const [imagesConfigured, setImagesConfigured] = useState(null);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const uploadedImages = useRef([]);
  const activeCategories = categories?.filter((category) => category.status === "ACTIVE");

  useEffect(() => {
    const controller = new AbortController();
    fetch(imageUploadPath, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Upload status unavailable");
        const { configured } = await response.json();
        if (!controller.signal.aborted) setImagesConfigured(configured === true);
      })
      .catch(() => {
        if (!controller.signal.aborted) setImagesConfigured("unknown");
      });
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  function showProductError(message) {
    setError(message);
    setToast({ message, error: true });
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadCategories() {
      try {
        const items = await listAdminRecords("categories", { token, signal });
        if (!signal.aborted) setCategories(items.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (requestError) {
        if (!signal.aborted) {
          if (requestError.status === 401) updateSession(null);
          setCategoryError(requestError.message);
        }
      }
    }

    loadCategories();
    return () => controller.abort();
  }, [token, attempt, updateSession]);

  async function submit(event) {
    event.preventDefault();
    if (busy || !activeCategories?.length) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const skipImages = event.nativeEvent.submitter?.value === "without-images";
    const files = skipImages ? [] : fields.getAll("images").filter((file) => file.name);
    const body = {
      name: fields.get("name").trim(),
      sku: fields.get("sku").trim(),
      categoryId: fields.get("categoryId"),
      weight: Number(fields.get("weight")),
      weightUnit: fields.get("weightUnit"),
    };
    const flavour = fields.get("flavour").trim();
    const price = fields.get("price");
    const description = fields.get("description").trim();
    if (flavour) body.flavour = flavour;
    if (price !== "") body.price = Number(price);
    if (description) body.description = description;

    setError("");
    setToast("");
    setImageUploadFailed(false);
    if (!body.name || !body.sku) {
      showProductError("Enter a product name and SKU.");
      return;
    }
    if (body.weight <= 0) {
      showProductError("Enter a weight greater than zero.");
      return;
    }
    if (files.length > maxProductImages) {
      showProductError(`Choose at most ${maxProductImages} images.`);
      return;
    }
    for (const file of files) {
      const issue = validateProductImage(file);
      if (issue) {
        showProductError(issue);
        return;
      }
    }
    setBusy(true);
    let uploading = files.length > uploadedImages.current.length;
    try {
      for (let index = uploadedImages.current.length; index < files.length; index += 1) {
        setUploadProgress(`Uploading image ${index + 1} of ${files.length}…`);
        const response = await fetch(imageUploadPath, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: files[index],
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.url) {
          if (response.status === 401) updateSession(null);
          throw new Error(payload?.message || "Could not upload the product image.");
        }
        uploadedImages.current.push(payload.url);
      }
      if (files.length) body.imageUrls = [...uploadedImages.current];
      uploading = false;
      setUploadProgress("");
      const { product } = await api("/admin/products", { method: "POST", token, body });
      setToast({ message: `Product created successfully. ${product?.name ?? body.name}` });
      setProductRevision((value) => value + 1);
      form.reset();
      uploadedImages.current = [];
      router.refresh();
    } catch (requestError) {
      if (requestError.status === 401) updateSession(null);
      if (uploading) setImageUploadFailed(true);
      showProductError(uploading
        ? `Product was not saved. ${requestError.message}`
        : requestError.code === "DUPLICATE_KEY"
          ? "This SKU already exists. Enter a different SKU or edit the existing product."
          : requestError.message);
    } finally {
      setUploadProgress("");
      setBusy(false);
    }
  }

  function reloadCategories() {
    setCategories(null);
    setCategoryError("");
    setAttempt(attempt + 1);
  }

  async function createCategory(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const name = new FormData(form).get("name").trim();
    setBusy(true);
    setError("");
    setToast("");
    try {
      const category = await api("/admin/categories", { method: "POST", token, body: { name } });
      setCategories((items) => [...items, category].sort((a, b) => a.name.localeCompare(b.name)));
      setToast({ message: `Category created successfully. ${category.name}` });
      form.reset();
      router.refresh();
    } catch (requestError) {
      if (requestError.status === 401) updateSession(null);
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section aria-labelledby="add-product-heading" className="space-y-5 border border-line p-6">
        <h2 id="add-product-heading" className="display text-4xl">Add Product</h2>
        {categoryError ? (
          <p role="alert">{categoryError}</p>
        ) : categories === null ? (
          <p role="status">Loading categories…</p>
        ) : (
          <details className="border-b border-line pb-4">
            <summary className="cursor-pointer font-medium">Add Category</summary>
            <form method="post" className="mt-3 space-y-3" onSubmit={createCategory}>
              {activeCategories.length === 0 && <p>Create an active category to add a product.</p>}
              <label className="block">
                Category name
                <input name="name" className={inputStyle} maxLength={120} required disabled={busy} />
              </label>
              <Button disabled={busy}>Create category</Button>
            </form>
          </details>
        )}
        {categoryError && (
          <Button type="button" variant="ghost" onClick={reloadCategories}>Reload categories</Button>
        )}
        {error && <p role="alert">{error}</p>}
        <div className="fixed inset-x-4 bottom-4 z-[110] sm:left-auto sm:right-6 sm:max-w-md">
          {toast && (
            <div role={toast.error ? "alert" : "status"} className={`flex items-center gap-3 border bg-obsidian px-4 py-3 text-warm shadow-lg ${toast.error ? "border-red-500" : "border-lime"}`}>
              {toast.error ? <CircleAlert className="size-5 shrink-0 text-red-500" aria-hidden /> : <CheckCircle className="size-5 shrink-0 text-lime" aria-hidden />}
              <p>{toast.message}</p>
              <button type="button" aria-label="Dismiss notification" className="ml-auto p-1" onClick={() => setToast("")}>
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
        <form method="post" onSubmit={submit} onInvalid={(event) => {
          if (event.target === event.currentTarget.querySelector(":invalid:not(fieldset)")) {
            const label = event.target.labels?.[0]?.textContent.trim();
            showProductError(label ? `${label}. ${event.target.validationMessage}` : event.target.validationMessage);
          }
        }}>
          <fieldset disabled={busy || !activeCategories?.length} className="grid gap-4 sm:grid-cols-2">
            <label>
              Product name
              <input name="name" className={inputStyle} required maxLength={120} />
            </label>
            <label>
              SKU
              <input name="sku" className={inputStyle} required maxLength={64} pattern="[A-Za-z0-9][A-Za-z0-9_\-]{0,63}" title="Use letters, numbers, underscores or hyphens, starting with a letter or number." />
            </label>
            <label>
              Category
              <select name="categoryId" className={inputStyle} defaultValue="" required>
                <option value="" disabled>Select a category</option>
                {activeCategories?.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
            </label>
            <label>
              Flavour
              <input name="flavour" className={inputStyle} maxLength={80} />
            </label>
            <label>
              Weight
              <input name="weight" type="number" min="0" step="any" className={inputStyle} required />
            </label>
            <label>
              Weight unit
              <select name="weightUnit" className={inputStyle} defaultValue="g" required>
                <option value="g">g</option>
                <option value="kg">kg</option>
              </select>
            </label>
            <label>
              Price
              <input name="price" type="number" min="0" step="any" className={inputStyle} />
            </label>
            <label className="sm:col-span-2">
              Description
              <textarea name="description" className={inputStyle} maxLength={2000} rows={3} />
            </label>
            <label className="sm:col-span-2">
              Product images
              <input
                name="images"
                type="file"
                multiple
                disabled={imagesConfigured === null || imagesConfigured === false}
                accept={imageTypes.join(",")}
                className={inputStyle}
                onChange={() => {
                  uploadedImages.current = [];
                  setImageUploadFailed(false);
                }}
              />
              <span className="mt-2 block text-sm text-mute">
                {imagesConfigured === false
                  ? "Cloudinary setup is required for images. You can still save this product without images."
                  : imagesConfigured === null ? "Checking image upload availability…" : "Up to 10 images, 4 MB each."}
              </span>
            </label>
            {uploadProgress && <p role="status" className="sm:col-span-2">{uploadProgress}</p>}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button disabled={busy || !activeCategories?.length}>{busy ? "Adding product…" : "Add product"}</Button>
              {imageUploadFailed && (
                <Button type="submit" value="without-images" variant="ghost" disabled={busy}>Save without images</Button>
              )}
            </div>
          </fieldset>
        </form>
      </section>
      <CategoryQRSection categories={categories} error={categoryError} />
      <CatalogEditor
        token={token}
        categories={categories}
        categoryError={categoryError}
        productRevision={productRevision}
        onCategoryUpdated={(record) => {
          setCategories((items) => items.map((item) => item._id === record._id ? record : item)
            .sort((a, b) => a.name.localeCompare(b.name)));
        }}
        onSuccess={(message) => {
          setToast({ message });
          router.refresh();
        }}
      />
    </>
  );
}
