import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface AuthUser {
  name: string;
  email: string;
  picture: string;
  googleId: string;
}

interface StoredSession {
  user: AuthUser;
  isPaid: boolean;
  freeMatchesUsed: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isPaid: boolean;
  freeMatchesUsed: number;
  freeMatchesRemaining: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (googleCredential: string) => Promise<void>;
  logout: () => void;
  markMatchViewed: () => void;
  setIsPaid: (paid: boolean) => void;
}

/* ─── Storage helpers ───────────────────────────────────────────────────── */

const STORAGE_KEY = "maidan-session";

function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function saveSession(s: StoredSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/* ─── Context ───────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE_URL = "https://maidan-iq-api-production.up.railway.app";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [freeMatchesUsed, setFreeMatchesUsedState] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Bootstrap: validate stored session ─────────────────────────────── */
  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    // Restore optimistically, then validate with backend
    setUser(stored.user);
    setIsPaid(stored.isPaid);
    setFreeMatchesUsedState(stored.freeMatchesUsed);

    fetch(`${BASE_URL}/auth/me`, {
      headers: { "X-User-Email": stored.user.email },
    })
      .then((r) => {
        if (!r.ok) throw new Error("session invalid");
        return r.json();
      })
      .then((data: { isPaid: boolean; freeMatchesUsed: number }) => {
        const updated: StoredSession = {
          user: stored.user,
          isPaid: data.isPaid,
          freeMatchesUsed: data.freeMatchesUsed,
        };
        setIsPaid(data.isPaid);
        setFreeMatchesUsedState(data.freeMatchesUsed);
        saveSession(updated);
      })
      .catch(() => {
        // Backend unreachable — keep optimistic state rather than logging out
        // If backend explicitly returned 401/403, clear session
      })
      .finally(() => setIsLoading(false));
  }, []);

  /* ── Login ───────────────────────────────────────────────────────────── */
  const login = useCallback(async (googleCredential: string) => {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: googleCredential }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);

    const data = (await res.json()) as {
      user: AuthUser;
      isPaid: boolean;
      freeMatchesUsed: number;
    };

    setUser(data.user);
    setIsPaid(data.isPaid);
    setFreeMatchesUsedState(data.freeMatchesUsed);
    saveSession({
      user: data.user,
      isPaid: data.isPaid,
      freeMatchesUsed: data.freeMatchesUsed,
    });
  }, []);

  /* ── Logout ──────────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    setUser(null);
    setIsPaid(false);
    setFreeMatchesUsedState(0);
    clearSession();
  }, []);

  /* ── Mark a free match as viewed ─────────────────────────────────────── */
  const markMatchViewed = useCallback(() => {
    if (!user || isPaid) return;
    setFreeMatchesUsedState((prev) => {
      const next = Math.min(prev + 1, 2);
      const stored = loadSession();
      if (stored) saveSession({ ...stored, freeMatchesUsed: next });
      return next;
    });
  }, [user, isPaid]);

  /* ── setIsPaid (called after successful Razorpay payment) ────────────── */
  const handleSetIsPaid = useCallback((paid: boolean) => {
    setIsPaid(paid);
    const stored = loadSession();
    if (stored) saveSession({ ...stored, isPaid: paid });
  }, []);

  const freeMatchesRemaining = Math.max(0, 2 - freeMatchesUsed);

  return (
    <AuthContext.Provider
      value={{
        user,
        isPaid,
        freeMatchesUsed,
        freeMatchesRemaining,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
        markMatchViewed,
        setIsPaid: handleSetIsPaid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
