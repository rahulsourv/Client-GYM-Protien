"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAccount } from "@/store/account";

const inputStyle = "mt-2 w-full border border-line bg-obsidian p-3";
const unavailableMessage = "Creating admins needs the latest backend update. Ask the backend developer to deploy it.";

export default function CreateAdminForm({ token }) {
  const { updateSession } = useAccount();
  const [admins, setAdmins] = useState(null);
  const [listError, setListError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleError = useCallback((requestError, setMessage) => {
    if (requestError.status === 401) updateSession(null);
    setMessage(requestError.status === 404 ? unavailableMessage : requestError.message);
  }, [updateSession]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadAdmins() {
      try {
        const list = await api("/admin/users", { token, signal });
        if (!signal.aborted) setAdmins(list);
      } catch (requestError) {
        if (!signal.aborted) handleError(requestError, setListError);
      }
    }

    loadAdmins();
    return () => controller.abort();
  }, [handleError, reloadKey, token]);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const { confirmPassword, ...body } = Object.fromEntries(new FormData(form));
    setError("");
    setNotice("");
    if (body.password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const admin = await api("/admin/users", { method: "POST", token, body });
      form.reset();
      setNotice(`${admin.email} can now sign in as an admin.`);
      setAdmins((list) => (list ? [...list, admin] : list));
    } catch (requestError) {
      handleError(requestError, setError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="admins" aria-labelledby="admins-heading" className="max-w-lg scroll-mt-28 space-y-5 border border-line p-6">
      <h2 id="admins-heading" className="display text-4xl">Create Admin</h2>
      <p className="text-mute">New admins can manage products, categories and QR codes. Share the password with them privately; they can change it after signing in.</p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      <form method="post" className="space-y-4" onSubmit={submit}>
        <fieldset disabled={busy} className="space-y-4">
          <label className="block">
            Name
            <input name="name" autoComplete="off" className={inputStyle} maxLength={120} required />
          </label>
          <label className="block">
            Email
            <input name="email" type="email" autoComplete="off" className={inputStyle} maxLength={254} required />
          </label>
          <label className="block">
            Password
            <input name="password" type="password" autoComplete="new-password" className={inputStyle} minLength={12} maxLength={72} required />
          </label>
          <label className="block">
            Confirm password
            <input name="confirmPassword" type="password" autoComplete="new-password" className={inputStyle} minLength={12} maxLength={72} required />
          </label>
          <Button>{busy ? "Creating admin…" : "Create admin"}</Button>
        </fieldset>
      </form>
      <div className="space-y-3 border-t border-line pt-5">
        <h3 className="font-medium">Current admins</h3>
        {listError ? (
          <>
            <p role="alert">{listError}</p>
            <Button type="button" variant="ghost" onClick={() => {
              setListError("");
              setReloadKey((key) => key + 1);
            }}>Reload admins</Button>
          </>
        ) : admins === null ? (
          <p role="status">Loading admins…</p>
        ) : (
          <ul className="divide-y divide-line">
            {admins.map((admin) => (
              <li key={admin.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-2">
                <span>
                  {admin.name} <span className="text-mute">{admin.email}</span>
                </span>
                <span className="text-sm text-mute">
                  {admin.role === "SUPER_ADMIN" ? "Super admin" : "Admin"}
                  {admin.status !== "ACTIVE" && " · inactive"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
