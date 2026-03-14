import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AppShell.module.css';

// ─────────────────────────────────────────────
// CITIZEN NAV CONFIG
// (Only citizen role — authority and admin removed per project scope)
// ─────────────────────────────────────────────
const CITIZEN_NAV = [
  { page: 'feed',          icon: '📋', label: 'Community Feed', badge: ''  },
  { page: 'map',           icon: '🗺️', label: 'Issue Map',       badge: ''  },
  { page: 'report',        icon: '➕', label: 'Report Issue',    badge: ''  },
  { page: 'myissues',      icon: '📂', label: 'My Reports',      badge: '3' },
  { page: 'notifications', icon: '🔔', label: 'Notifications',   badge: '2' },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Close a dropdown when user clicks outside its ref element */
function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/**
 * TopBar — sticky header with logo, portal pill, notification
 * bell, avatar menu, and switch/hamburger buttons.
 */
function TopBar({
  user,
  unreadCount,
  onNotifClick,
  onLogoClick,
  onSwitchPortal,
  onHamburgerClick,
  isMobileOpen,
}) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  useClickOutside(avatarRef, () => setAvatarOpen(false));

  return (
    <header className={styles.topbar}>
      {/* Left */}
      <div className={styles.topbarLeft}>
        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={onHamburgerClick}
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>

        {/* Logo */}
        <div
          className={styles.logo}
          onClick={onLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onLogoClick?.()}
          aria-label="CivicPulse home"
        >
          Civic<span className={styles.logoAccent}>Pulse</span>
        </div>

        {/* Portal pill */}
        <div className={`${styles.portalPill} ${styles.pillCitizen}`}>
          Citizen Portal
        </div>
      </div>

      {/* Right */}
      <div className={styles.topbarRight}>
        {/* Notification bell */}
        <button
          className={styles.notifBtn}
          onClick={onNotifClick}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && <span className={styles.notifDot} aria-hidden="true" />}
        </button>

        {/* Avatar + dropdown */}
        <div
          ref={avatarRef}
          className={styles.avatar}
          onClick={() => setAvatarOpen((v) => !v)}
          role="button"
          tabIndex={0}
          aria-label="Account menu"
          aria-haspopup="true"
          aria-expanded={avatarOpen}
          onKeyDown={(e) => e.key === 'Enter' && setAvatarOpen((v) => !v)}
        >
          {user.initials}

          {/* Dropdown menu */}
          {avatarOpen && (
            <div className={styles.avatarMenu} role="menu">
              {/* User info */}
              <div className={styles.avatarMenuHeader}>
                <div className={styles.avatarMenuName}>{user.name}</div>
                <div className={styles.avatarMenuRole}>{user.zone}</div>
              </div>

              <button
                className={styles.avatarMenuItem}
                role="menuitem"
                onClick={() => { setAvatarOpen(false); }}
              >
                👤 My Profile
              </button>
              <button
                className={styles.avatarMenuItem}
                role="menuitem"
                onClick={() => { setAvatarOpen(false); }}
              >
                ⚙ Settings
              </button>
              <button
                className={styles.avatarMenuItem}
                role="menuitem"
                onClick={() => { setAvatarOpen(false); }}
              >
                🌐 Language
              </button>

              <div className={styles.avatarMenuDivider} />

              <button
                className={styles.avatarMenuItemDanger}
                role="menuitem"
                onClick={() => { setAvatarOpen(false); onSwitchPortal?.(); }}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Switch portal */}
        <button
          className={styles.switchBtn}
          onClick={onSwitchPortal}
        >
          ← Switch Portal
        </button>
      </div>
    </header>
  );
}

/**
 * Sidebar — sticky left nav with collapsible icon-only mode,
 * active indicator bar, badges, and a bottom version footer.
 */
function Sidebar({
  navItems,
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) {
  const sidebarCls = [
    styles.sidebar,
    collapsed ? styles.sidebarCollapsed : '',
    mobileOpen ? styles.sidebarMobileOpen : '',
  ].join(' ');

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className={`${styles.backdrop} ${styles.backdropVisible}`}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <nav className={sidebarCls} aria-label="Main navigation">
        {/* Collapse toggle (desktop only) */}
        <button
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <em className={`${styles.collapseBtnIcon} ${collapsed ? styles.collapseBtnIconRotated : ''}`}>
            ‹‹
          </em>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = activePage === item.page;
          return (
            <button
              key={item.page}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => {
                onNavigate(item.page);
                onMobileClose?.();
              }}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge ? (
                <span className={styles.navBadge}>{item.badge}</span>
              ) : null}
            </button>
          );
        })}

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <div className={styles.sidebarVersion}>
              CivicPulse v1.0
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
/**
 * AppShell — top-level layout wrapper for the citizen portal.
 *
 * Renders the sticky TopBar + collapsible Sidebar + scrollable
 * main content area. All navigation state lives here and is
 * passed down as props/callbacks.
 *
 * Props:
 *  user           {object}    { name, initials, zone }
 *  activePage     {string}    current page key e.g. 'feed'
 *  onNavigate     {function}  called with a page key on nav clicks
 *  onSwitchPortal {function}  called when "Switch Portal" is clicked
 *  unreadCount    {number}    notification badge count
 *  children       {ReactNode} the active page component
 *
 * Usage:
 *  <AppShell
 *    user={{ name: 'Khuraijam Mani', initials: 'KM', zone: 'Zone A, Imphal' }}
 *    activePage={activePage}
 *    onNavigate={setActivePage}
 *    onSwitchPortal={() => setView('landing')}
 *    unreadCount={2}
 *  >
 *    <Dashboard onNavigate={setActivePage} />
 *  </AppShell>
 */
export default function AppShell({
  user           = { name: 'Khuraijam Mani', initials: 'KM', zone: 'Zone A, Imphal' },
  activePage     = 'feed',
  onNavigate     = () => {},
  onSwitchPortal = () => {},
  unreadCount    = 2,
  children,
}) {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Close mobile sidebar on page navigation
  const handleNavigate = useCallback((page) => {
    onNavigate(page);
    setMobileOpen(false);
  }, [onNavigate]);

  // Close mobile sidebar on resize back to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 900) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`${styles.root} ${styles.shell}`}>
      {/* TOP BAR */}
      <TopBar
        user={user}
        unreadCount={unreadCount}
        onNotifClick={() => handleNavigate('notifications')}
        onLogoClick={()  => handleNavigate('feed')}
        onSwitchPortal={onSwitchPortal}
        onHamburgerClick={() => setMobileOpen((v) => !v)}
        isMobileOpen={mobileOpen}
      />

      {/* BODY */}
      <div className={styles.appBody}>
        {/* SIDEBAR */}
        <Sidebar
          navItems={CITIZEN_NAV}
          activePage={activePage}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* MAIN CONTENT */}
        <main className={styles.main} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}