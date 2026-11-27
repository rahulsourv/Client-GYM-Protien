"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api, listAdminRecords } from "@/lib/api";
import { useAccount } from "@/store/account";

const inputStyle = "mt-2 w-full border border-line bg-obsidian p-3";
const resources = { products: "Product", categories: "Category" };

export default function CatalogEditor({ token, categories, categoryError, productRevision, onCategoryUpdated, onSuccess }) {
  const { updateSession } = useAccount();
  const [products, setProducts] = useState(null);
  const [productError, setProductError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [resource, setResource] = useState("products");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isProduct = resource === "products";
  const kind = resources[resource];
  const records = isProduct ? products : categories;
  const listError = isProduct ? productError : categoryError;
  const record = records?.find((item) => item._id === selected);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    listAdminRecords("products", { token, signal }).then((items) => {
      if (!signal.aborted) {
        setProducts(items);
        setProductError("");
      }
    }).catch((requestError) => {
      if (signal.aborted) return;
      if (requestError.status === 401) updateSession(null);
      setProductError(requestError.message);
    });
    return () => controller.abort();
  }, [token, productRevision, attempt, updateSession]);

  async function save(event) {
    event.preventDefault();
    if (!record || busy) return;

    const data = new FormData(event.currentTarget);
    const changes = {};
    for (const [key, input] of data) {
      const value = input.trim();
      if (key === "weight" || key === "price" || key === "servingsPerContainer") {
        if (value === "" && record[key] == null) continue;
        if (value === "") {
          setError(`Enter a value for ${key === "servingsPerContainer" ? "servings per container" : key}.`);
          return;
        }
        if (Number(value) !== record[key]) changes[key] = Number(value);
      } else if (["ingredients", "benefits", "warnings", "imageUrls"].includes(key)) {
        const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        if (JSON.stringify(lines) !== JSON.stringify(record[key] ?? [])) changes[key] = lines;
      } else if (value !== String(record[key] ?? "")) {
        changes[key] = value;
      }
    }
    if (Object.keys(changes).length === 0) {
      setError("Make a change before saving.");
      return;
    }
    await mutate(changes, "", `${kind} updated successfully.`);
  }

  async function toggleStatus() {
    if (!record || busy) return;
    const removing = record.status === "ACTIVE";
    if (removing) {
      const affected = isProduct ? "It will be hidden from the public catalog." : "The category and its products will be hidden from the public catalog.";
      if (!window.confirm(`Remove ${record.name}? ${affected}`)) return;
    }
    await mutate(
      removing ? undefined : { status: "ACTIVE" },
      removing ? "/deactivate" : "",
      `${kind} ${removing ? "removed" : "restored"} successfully.`,
    );
  }

  async function mutate(body, suffix, message) {
    setBusy(true);
    setError("");
    try {
      const updated = await api(`/admin/${resource}/${record._id}${suffix}`, { method: "PATCH", body, token });
      if (isProduct) {
        setProducts((items) => items.map((item) => item._id === updated._id ? updated : item));
        setAttempt((value) => value + 1);
      } else {
        onCategoryUpdated(updated);
      }
      onSuccess(message);
    } catch (requestError) {
      if (requestError.status === 401) updateSession(null);
      setError(requestError.code === "PRODUCT_IDENTITY_LOCKED"
        ? "This product has an issued QR code or unit labels. You can update its price and listing details. Its product identity fields are locked."
        : requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="edit-catalog" aria-labelledby="catalog-editor-heading" className="scroll-mt-28 space-y-5 border border-line p-6 lg:col-span-2">
      <h2 id="catalog-editor-heading" className="display text-4xl">Edit Products &amp; Categories</h2>
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <label>
          Manage
          <select className={inputStyle} value={resource} disabled={busy} onChange={(event) => {
            setResource(event.target.value);
            setSelected("");
            setError("");
          }}>
            <option value="products">Products</option>
            <option value="categories">Categories</option>
          </select>
        </label>
        <label>
          {kind}
          <select className={inputStyle} value={selected} disabled={busy || !records?.length} onChange={(event) => {
            setSelected(event.target.value);
            setError("");
          }}>
            <option value="">Select a {kind.toLowerCase()}</option>
            {records?.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}{item.sku ? ` (${item.sku})` : ""}{item.status === "INACTIVE" ? " · Removed" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      {listError ? (
        <div className="space-y-3">
          <p role="alert">{listError}</p>
          {isProduct && <Button type="button" variant="ghost" onClick={() => setAttempt((value) => value + 1)}>Reload products</Button>}
        </div>
      ) : !records ? (
        <p role="status">Loading {resource}…</p>
      ) : records.length === 0 && (
        <p>No {resource} yet.</p>
      )}
      {error && <p role="alert">{error}</p>}
      {record && (
        <form key={`${resource}-${record._id}-${record.updatedAt}`} method="post" onSubmit={save}>
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Name" record={record} required maxLength={120} />
            {isProduct ? (
              <ProductFields record={record} categories={categories ?? []} />
            ) : (
              <Field name="slug" label="URL slug" record={record} required maxLength={120} />
            )}
            <TextField name="description" label="Description" record={record} maxLength={2000} />
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
              <Button type="button" variant="ghost" onClick={toggleStatus}>
                {record.status === "ACTIVE" ? `Remove ${kind.toLowerCase()}` : `Restore ${kind.toLowerCase()}`}
              </Button>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}

function Field({ name, label, record, ...props }) {
  return (
    <label>
      {label}
      <input name={name} defaultValue={record[name] ?? ""} className={inputStyle} {...props} />
    </label>
  );
}

function TextField({ name, label, record, ...props }) {
  const value = record[name];
  return (
    <label className="sm:col-span-2">
      {label}
      <textarea name={name} defaultValue={Array.isArray(value) ? value.join("\n") : value ?? ""} rows={3} className={inputStyle} {...props} />
    </label>
  );
}

function ProductFields({ record, categories }) {
  const active = categories.filter((category) => category.status === "ACTIVE");
  return (
    <>
      <Field name="sku" label="SKU" record={record} required maxLength={64} />
      <Field name="brand" label="Brand" record={record} required={Boolean(record.brand)} maxLength={120} />
      <label>
        Category
        <select name="categoryId" className={inputStyle} defaultValue={record.categoryId ?? ""}>
          {!active.some((category) => category._id === record.categoryId) && (
            <option value={record.categoryId ?? ""}>{record.category || "Select a category"}</option>
          )}
          {active.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
        </select>
      </label>
      <Field name="flavour" label="Flavour" record={record} required={Boolean(record.flavour)} maxLength={80} />
      <Field name="weight" label="Weight" record={record} type="number" min="0" step="any" required />
      <label>
        Weight unit
        <select name="weightUnit" className={inputStyle} defaultValue={record.weightUnit} required>
          <option value="g">g</option>
          <option value="kg">kg</option>
        </select>
      </label>
      <Field name="price" label="Price" record={record} type="number" min="0" step="any" />
      <Field name="servingSize" label="Serving size" record={record} required={Boolean(record.servingSize)} maxLength={100} />
      <Field name="servingsPerContainer" label="Servings per container" record={record} type="number" min="0" step="any" />
      <Field name="shortDescription" label="Short description" record={record} maxLength={300} />
      <TextField name="usageInstructions" label="Usage instructions" record={record} maxLength={2000} />
      <TextField name="ingredients" label="Ingredients (one per line)" record={record} />
      <TextField name="benefits" label="Benefits (one per line)" record={record} />
      <TextField name="warnings" label="Warnings (one per line)" record={record} />
      <TextField name="imageUrls" label="Image URLs (one per line)" record={record} />
    </>
  );
}
