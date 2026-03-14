import { useState, useCallback, useMemo, useEffect } from 'react';
import { MOCK_USERS, PORTAL_CONFIG }                     from './mockDate';
import { CitizenContext } from './CitizenContextValue';
import { TOKEN_KEY, USER_KEY } from '../api/auth';

// Re-export so App.jsx can import both provider and context from one module
export { CitizenContext };

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

/**
 * CitizenProvider
 *
 * Wrap the entire app (or the portal subtree) with this
 * provider. useAuth() and any direct CitizenContext consumer
 * must be inside this boundary.
 *
 * Props:
 *  children {ReactNode}
 *
 * Usage (App.jsx):
 *
 *   import { CitizenProvider } from './CitizenContext';
 *
 *   export default function App() {
 *     return (
 *       <CitizenProvider>
 *         <AppShell />
 *       </CitizenProvider>
 *     );
 *   }
 */
export function CitizenProvider({ children }) {

  // ── Core auth state ───────────────────────
  const [user,         setUser]         = useState(null);
  const [portalConfig, setPortalConfig] = useState(null);
  const [activePage,   setActivePage]   = useState('');

  // ── Notifications state ───────────────────
  // Seeded from mockData on login; mutations (markAllRead)
  // live here so they're shared across all consumers.
  const [notifs, setNotifs] = useState([]);

  // ── Actions ───────────────────────────────

  /**
   * Normalize API user to app user shape (id, name, initials, zone, role, email).
   */
  const normalizeUser = useCallback((apiUser) => {
    if (!apiUser) return null;
    const name = apiUser.name || '';
    const initials = name.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase() || '?';
    return {
      id: apiUser.id,
      name,
      initials,
      zone: apiUser.zone || '',
      role: apiUser.role,
      email: apiUser.email,
    };
  }, []);

  /**
   * login — use real user from localStorage if present; otherwise fall back to mock user by role.
   * @param {'citizen' | 'authority' | 'admin'} role
   */
  const login = useCallback((role) => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    let matchedUser = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        matchedUser = normalizeUser(parsed);
        if (matchedUser && matchedUser.role !== role) {
          matchedUser = null;
        }
      } catch {
        matchedUser = null;
      }
    }
    if (!matchedUser) {
      matchedUser = MOCK_USERS.find((u) => u.role === role) ?? null;
    }

    const config = PORTAL_CONFIG[role];
    if (!matchedUser || !config) {
      console.error(`[CitizenContext] Unknown role: "${role}"`);
      return;
    }

    import('./mockDate').then(({ notifications: seedNotifs }) => {
      setNotifs(seedNotifs);
    });

    setUser(matchedUser);
    setPortalConfig(config);
    setActivePage(config.defaultPage);
  }, [normalizeUser]);

  /**
   * logout — clear all session state and localStorage, return to landing.
   */
  const logout = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setUser(null);
    setPortalConfig(null);
    setActivePage('');
    setNotifs([]);
  }, []);

  // ── Auto-login from localStorage on load ───
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const user = normalizeUser(parsed);
        if (user && user.role) {
          const config = PORTAL_CONFIG[user.role];
          if (config) {
            setUser(user);
            setPortalConfig(config);
            setActivePage(config.defaultPage);
          }
        }
      } catch {
        // ignore invalid stored user
      }
    }
  }, [normalizeUser]);

  /**
   * markAllRead — set unread:false on every notification.
   * Both the TopBar bell badge and the Notifications page
   * consume `unreadCount`/`notifications` from context, so
   * a single call here keeps them in sync.
   */
  const markAllRead = useCallback(() => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  // ── Derived values ────────────────────────
  const unreadCount = notifs.filter((n) => n.unread).length;

  // ── Context value ─────────────────────────
  // Memoised so components that read the whole context object
  // only re-render when something inside it actually changes.
  const value = useMemo(() => ({
    // Auth
    user,
    portalConfig,
    login,
    logout,

    // Routing
    activePage,
    setActivePage,

    // Notifications
    notifications: notifs,
    unreadCount,
    markAllRead,
  }), [
    user,
    portalConfig,
    login,
    logout,
    activePage,
    notifs,
    unreadCount,
    markAllRead,
  ]);

  return (
    <CitizenContext.Provider value={value}>
      {children}
    </CitizenContext.Provider>
  );
}