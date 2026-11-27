"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddProductForm from "@/components/auth/AddProductForm";
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
  }, [profile, router, session]);

  async function submit(action, form) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (action === "login" || action === "register") {
        const { accessToken } = await api(`/auth/${action}`, { method: "POST", body: form });
        if (!accessToken) throw new Error("The API did not return an access token.");
        const account = await api("/auth/me", { token: accessToken });
        const user = account.user ?? account;
        const accountType = ["ADMIN", "SUPER_ADMIN"].includes(user.role) ? "ADMIN" : user.role;
        const expectedType = action === "register" ? "CUSTOMER" : form.accountType;
        if (accountType !== expectedType) {
          throw new Error("Select the account type that matches your account.");
        }
        updateSession({ token: accessToken, user });
      } else {
        const changePassword = action === "change-password";
        await api(`/auth/${action}`, {
          method: changePassword ? "PATCH" : "POST",
          token: session.token,
          body: form,
        });
        updateSession(null);
        setNotice(changePassword ? "Password changed. Sign in again." : "Signed out of all sessions.");
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
  const title = profile ? (isAdmin ? "Admin profile" : "Profile") : signup ? "Customer signup" : "Login";

  return (
    <>
      <PageHeader lines={[title]} crumbs={[{ label: profile ? "Profile" : signup ? "Sign up" : "Login" }]} />
      <section className="shell grid items-start gap-8 pb-24 lg:grid-cols-2">
        <div className="max-w-lg space-y-5 border border-line p-6">
          {error && <p role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          {checkingSession ? (
            <p role="status">Checking your session…</p>
          ) : !profile && session ? (
            <LinkButton href="/profile">Open profile</LinkButton>
          ) : session ? (
            <>
              {session.user.name && <h2 className="display text-3xl">{session.user.name}</h2>}
              <p>Signed in as {session.user.email}</p>
              {isAdmin && (
                <div className="flex flex-wrap gap-4">
                  <a href="#qr" className="underline underline-offset-4 hover:text-lime">Category QR codes</a>
                  <a href="#edit-catalog" className="underline underline-offset-4 hover:text-lime">Edit products &amp; categories</a>
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
          ) : profile ? (
            <LinkButton href="/login">Sign in</LinkButton>
          ) : (
            <form method="post" className="space-y-4" onSubmit={(event) => submitForm(signup ? "register" : "login", event)}>
              {signup ? (
                <label className="block">
                  Full name
                  <input name="name" autoComplete="name" className={inputStyle} maxLength={120} required />
                </label>
              ) : (
                <label className="block">
                  Sign in as
                  <select name="accountType" defaultValue="" className={inputStyle} required>
                    <option value="" disabled>Select account type</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
              )}
              <label className="block">
                Email
                <input name="email" type="email" autoComplete="username" className={inputStyle} required />
              </label>
              <label className="block">
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete={signup ? "new-password" : "current-password"}
                  className={inputStyle}
                  minLength={signup ? 12 : undefined}
                  maxLength={72}
                  aria-describedby={signup ? "signup-password-hint" : undefined}
                  required
                />
              </label>
              {signup && <p id="signup-password-hint" className="text-sm">Use at least 12 characters.</p>}
              <Button disabled={busy}>{signup ? (busy ? "Creating account?" : "Create account") : (busy ? "Signing in?" : "Sign in")}</Button>
              <div>
                <LinkButton href={signup ? "/login" : "/signup"} variant="ghost">
                  {signup ? "Already have an account? Sign in" : "Create a customer account"}
                </LinkButton>
              </div>
            </form>
          )}
        </div>
        {profile && isAdmin && <AddProductForm token={session.token} />}
      </section>
    </>
  );
}
