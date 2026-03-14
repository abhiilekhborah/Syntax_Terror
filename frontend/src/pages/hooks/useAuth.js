import { useContext } from 'react';
import { CitizenContext }          from '../CitizenContextValue';

// ─────────────────────────────────────────────
// useAuth
//
// Thin hook that surfaces authentication state and
// actions from CitizenContext to any component in
// the tree — without those components importing
// CitizenContext directly.
//
// Returns:
//
//  user          {User | null}
//    The currently logged-in user object, or null when
//    no portal has been selected yet (i.e. landing screen).
//    Shape: { id, name, initials, zone, role, email }
//
//  role          {PortalRole | null}
//    Shorthand for user?.role.
//    One of: 'citizen' | 'authority' | 'admin' | null
//
//  isAuthenticated {boolean}
//    true when a user is present.
//
//  login         {(role: PortalRole) => void}
//    Selects the mock user matching `role` and writes
//    them into context. Mirrors the openPortal(p) call
//    in the HTML prototype. In production this would be
//    replaced by a real auth flow (JWT / session cookie).
//
//  logout        {() => void}
//    Clears the current user from context, returning
//    the app to the landing / portal-select screen.
//
//  isCitizen     {boolean}
//  isAuthority   {boolean}
//  isAdmin       {boolean}
//    Convenience role-check flags so components can gate
//    UI without spelling out role string comparisons:
//
//      const { isCitizen } = useAuth();
//      if (!isCitizen) return null;
//
// Usage:
//
//   import useAuth from './useAuth';
//
//   function TopBar() {
//     const { user, role, logout } = useAuth();
//     return (
//       <header>
//         <span>{user?.initials}</span>
//         <button onClick={logout}>Switch Portal</button>
//       </header>
//     );
//   }
// ─────────────────────────────────────────────

export default function useAuth() {
  const context = useContext(CitizenContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside a <CitizenProvider>. ' +
      'Make sure your component tree is wrapped in CitizenProvider (see CitizenContext.jsx).'
    );
  }

  const { user, login, logout } = context;

  // ── Derived values ────────────────────────
  const role            = user?.role ?? null;
  const isAuthenticated = Boolean(user);
  const isCitizen       = role === 'citizen';
  const isAuthority     = role === 'authority';
  const isAdmin         = role === 'admin';

  // ── Stable callbacks ──────────────────────
  // login and logout are already useCallback from CitizenContext,
  // so they're stable references.
  const stableLogin  = login;
  const stableLogout = logout;

  return {
    // State
    user,
    role,
    isAuthenticated,

    // Role flags
    isCitizen,
    isAuthority,
    isAdmin,

    // Actions
    login:  stableLogin,
    logout: stableLogout,
  };
}