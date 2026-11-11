import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { TOKEN_KEY, USER_KEY } from '../api/httpClient';
import { loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // corrupt JSON must not crash the app
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  const saveSession = useCallback((authResponse) => {
    localStorage.setItem(TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    setToken(authResponse.accessToken);
    setUser(authResponse.user);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const auth = await loginUser({ email: email.trim().toLowerCase(), password });
      saveSession(auth);
      return auth.user;
    },
    [saveSession]
  );

  const register = useCallback(
    async (form) => {
      const auth = await registerUser({
        ...form,
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      saveSession(auth);
      return auth.user;
    },
    [saveSession]
  );

  // Logout is client-only (contract 10.2). CartProvider is keyed by the user id,
  // so it discards the cart by itself as soon as `user` becomes null.
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Only the display name may change from the profile screen. Role and id never do.
  const updateFullName = useCallback(
    (fullName) => {
      if (!user) return;
      const next = { ...user, fullName };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      setUser(next);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      saveSession,
      logout,
      updateFullName, // <- was missing: ProfileForm calls it after a successful save
    }),
    [user, token, login, register, saveSession, logout, updateFullName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook deliberately lives next to its provider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}