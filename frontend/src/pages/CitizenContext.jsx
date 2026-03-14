import { useState, useCallback, useMemo } from 'react';
import { MOCK_USERS, PORTAL_CONFIG }                     from './mockDate';
import { CitizenContext } from './CitizenContextValue';

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
   * login — select a portal role and load the matching mock user.
   * @param {'citizen' | 'authority' | 'admin'} role
   */
  const login = useCallback((role) => {
    const matchedUser = MOCK_USERS.find((u) => u.role === role);
    const config      = PORTAL_CONFIG[role];

    if (!matchedUser || !config) {
      console.error(`[CitizenContext] Unknown role: "${role}"`);
      return;
    }

    // Lazy-import notifications to avoid a circular dependency
    // if other modules ever import from mockData directly.
    import('./mockDate').then(({ notifications: seedNotifs }) => {
      setNotifs(seedNotifs);
    });

    setUser(matchedUser);
    setPortalConfig(config);
    setActivePage(config.defaultPage);
  }, []);

  /**
   * logout — clear all session state and return to landing.
   */
  const logout = useCallback(() => {
    setUser(null);
    setPortalConfig(null);
    setActivePage('');
    setNotifs([]);
  }, []);

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