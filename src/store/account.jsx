"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AccountContext = createContext(null);
const storageKey = "hv-admin-token";

export function AccountProvider({ children }) {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function restoreSession() {
      try {
        const token = sessionStorage.getItem(storageKey);
        if (!token) return;
        const account = await api("/auth/me", { token, signal: controller.signal });
        if (!controller.signal.aborted) setSession({ token, user: account.user ?? account });
      } catch (error) {
        if (!controller.signal.aborted && error.status === 401) {
          sessionStorage.removeItem(storageKey);
        }
      } finally {
        if (!controller.signal.aborted) setCheckingSession(false);
      }
    }

    restoreSession();
    return () => controller.abort();
  }, []);

  const updateSession = useCallback((value) => {
    try {
      if (value) sessionStorage.setItem(storageKey, value.token);
      else sessionStorage.removeItem(storageKey);
    } catch {
      // The active page can still use the in-memory session.
    }
    setSession(value);
  }, []);

  return (
    <AccountContext.Provider value={{ session, checkingSession, updateSession }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
