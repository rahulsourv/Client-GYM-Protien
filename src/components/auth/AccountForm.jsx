"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddProductForm from "@/components/auth/AddProductForm";
import AuthScreen from "@/components/auth/AuthScreen";
import CreateAdminForm from "@/components/auth/CreateAdminForm";
import PageHeader from "@/components/layout/PageHeader";
import { Button, LinkButton } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAccount } from "@/store/account";

const inputStyle = "mt-2 w-full border border-line bg-obsidian p-3";

export default function AccountForm({ profile = false, signup = false }) {
  const { session, checkingSession, updateSession } = useAccount();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (session && !profile) router.replace("/profile");
    // Signed-out visitors to /profile go straight to the sign-in screen.
    // (Not while a "Password changed" style notice is showing.)
    if (!session && profile && !checkingSession && !notice) router.replace("/login");
  }, [checkingSession, notice, profile, router, session]);

  async function submit(action, form) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (action === "login" || action === "register") {
        const { user } = await api(`/auth/${action}`, { method: "POST", body: form });
        updateSession({ user });
      } else {
        const changePassword = action === "change-password";
        await api(`/auth/${action}`, {
          method: changePassword ? "PATCH" : "POST",
          token: session.token,
          body: form,
        });
        updateSession(null);
        if (action === "logout") router.push("/login");
        else setNotice(changePassword ? "Password changed. Sign in again." : "Signed out of all sessions.");
      }
    } catch (requestError) {
      if (session && requestError.status === 401 && requestError.code !== "INVALID_CREDENTIALS") {
        updateSession(null);
      }
      setError(
        action === "register" && requestError.status === 409
          ? "An account already exists with this email. Sign in instead."
          : requestError.message
      );
    } finally {
      setBusy(false);
    }
  }

  function submitForm(action, event) {
    event.preventDefault();
    submit(action, Object.fromEntries(new FormData(event.currentTarget)));
  }

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session?.user.role);
  const canCreateAdmin = session?.user.role === "SUPER_ADMIN";
  const title = isAdmin ? "Admin profile" : "Profile";

  if (!profile) {
    // Signed-in visitors are redirected to /profile by the effect above.
    return <AuthScreen signup={signup} busy={busy} error={error} notice={notice} checking={checkingSession || !!session} onSubmit={submit} />;
  }

  return (
    <>
      <PageHeader lines={[title]} crumbs={[{ label: "Profile" }]} />
      <section className="shell grid items-start gap-8 pb-24 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="max-w-lg space-y-5 border border-line p-6">
            {error && <p role="alert">{error}</p>}
            {notice && <p role="status">{notice}</p>}
            {checkingSession ? (
              <p role="status">Checking your session…</p>
            ) : session ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    {session.user.name && <h2 className="display text-3xl">{session.user.name}</h2>}
                    <p className="break-all">Signed in as {session.user.email}</p>
                  </div>
                  <Button type="button" variant="ghost" disabled={busy} onClick={() => submit("logout")}>
                    Log out
                  </Button>
                </div>
                {isAdmin && (
                  <div className="flex flex-wrap gap-4">
                    <a href="#qr" className="underline underline-offset-4 hover:text-lime">Category QR codes</a>
                    <a href="#edit-catalog" className="underline underline-offset-4 hover:text-lime">Edit products &amp; categories</a>
                    {canCreateAdmin && <a href="#admins" className="underline underline-offset-4 hover:text-lime">Create admin</a>}
                  </div>
                )}
                <form method="post" className="space-y-4" onSubmit={(event) => submitForm("change-password", event)}>
                  <label className="block">
                    Current password
                    <input name="currentPassword" type="password" autoComplete="current-password" className={inputStyle} required />
                  </label>
                  <label className="block">
                    New password
                    <input name="newPassword" type="password" autoComplete="new-password" className={inputStyle} minLength={12} required />
                  </label>
                  <Button disabled={busy}>Change password</Button>
                </form>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => submit("logout-all")}>
                  Sign out of all sessions
                </Button>
              </>
            ) : (
              <LinkButton href="/login">Sign in</LinkButton>
            )}
          </div>
          {canCreateAdmin && <CreateAdminForm token={session.token} />}
        </div>
        {isAdmin && <AddProductForm token={session.token} />}
      </section>
    </>
  );
}
