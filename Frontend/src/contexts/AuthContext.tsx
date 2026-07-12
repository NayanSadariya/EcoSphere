import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { getStoredToken, setStoredToken, clearStoredToken, shouldRememberUser } from '../api/client';
import type { LoginCredentials, SignupData, User } from '../types';

const USER_OVERRIDES_KEY = 'ecosphere_user_overrides';

function loadOverrides(): Partial<User> | null {
  try {
    const raw = localStorage.getItem(USER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveOverrides(overrides: Partial<User>): void {
  try {
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    /* non-fatal */
  }
}

function clearOverrides(): void {
  try {
    localStorage.removeItem(USER_OVERRIDES_KEY);
  } catch {
    /* non-fatal */
  }
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login: if a token exists in storage, fetch the user profile.
  // Wrapped in try/catch so storage access errors never crash the app.
  // Merges any locally-saved profile overrides so edits survive refreshes.
  useEffect(() => {
    try {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      setToken(stored);
      const overrides = loadOverrides();
      authService
        .getMe()
        .then((u) => setUser(overrides ? { ...u, ...overrides } : u))
        .catch(() => {
          clearStoredToken();
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } catch {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await authService.login(credentials);
    setStoredToken(res.token, credentials.remember ?? false);
    setToken(res.token);
    const overrides = loadOverrides();
    setUser(overrides ? { ...res.user, ...overrides } : res.user);
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const res = await authService.signup(data);
    setStoredToken(res.token, true);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    clearOverrides();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...updates } : prev;
      if (next) saveOverrides(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { shouldRememberUser };
