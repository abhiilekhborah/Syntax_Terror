import { useState, useCallback, useEffect, useRef } from 'react';
import { useContext } from 'react';
import { CitizenContext } from '../CitizenContextValue';
import styles from './AppShell.module.css';

// ─────────────────────────────────────────────
// CITIZEN NAV CONFIG
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
// TOP BAR
// ─────────────────────────────────────────────
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
        <button
          className={styles.hamburger}
          onClick={onHamburgerClick}
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>

        <div
          className={styles.logo}
          onClick={onLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onLogoClick?.()}
          aria-label="NagarSetu home"
        >
          Nagar<span className={styles.logoAccent}>Setu</span>
        </div>

        <div className={`${styles.portalPill} ${styles.pillCitizen}`}>
          Citizen Portal
        </div>
      </div>

      {/* Right */}
      <div className={styles.topbarRight}>
        <button
          className={styles.notifBtn}
          onClick={onNotifClick}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && <span className={styles.notifDot} aria-hidden="true" />}
        </button>

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

          {avatarOpen && (
            <div className={styles.avatarMenu} role="menu">
              <div className={styles.avatarMenuHeader}>
                <div className={styles.avatarMenuName}>{user.name}</div>
                <div className={styles.avatarMenuRole}>{user.zone}</div>
              </div>

              <button
                className={styles.avatarMenuItem}
                role="menuitem"
                onClick={() => setAvatarOpen(false)}
              >
                👤 My Profile
              </button>
              <button
                className={styles.avatarMenuItem}
                role="menuitem"
                onClick={() => setAvatarOpen(false)}
              >
                ⚙ Settings
              </button>
              <button
                className={styles.avatarMenuItem}
                role="menuitem"
                onClick={() => setAvatarOpen(false)}
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


      </div>
    </header>
  );
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
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
    collapsed  ? styles.sidebarCollapsed  : '',
    mobileOpen ? styles.sidebarMobileOpen : '',
  ].join(' ');

  return (
    <>
      {mobileOpen && (
        <div
          className={`${styles.backdrop} ${styles.backdropVisible}`}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <nav className={sidebarCls} aria-label="Main navigation">
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

        <div className={styles.sidebarFooter}>
          {!collapsed && (
            <div className={styles.sidebarVersion}>NagarSetu v1.0</div>
          )}
        </div>
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AppShell({ children }) {
  const { user, activePage, setActivePage, logout, unreadCount } = useContext(CitizenContext);

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Navigate — opens map externally, everything else internally ──
  const handleNavigate = useCallback((page) => {
    if (page === 'map') {
      window.open('http://127.0.0.1:5001', '_blank');
      return;  // do NOT change activePage — stay on current page
    }
    setActivePage(page);
    setMobileOpen(false);
  }, [setActivePage]);

  // Close mobile sidebar on resize
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 900) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile sidebar on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const shellUser = user ?? { name: 'User', initials: 'U', zone: '' };

  return (
    <div className={`${styles.root} ${styles.shell}`}>
      <TopBar
        user={shellUser}
        unreadCount={unreadCount ?? 0}
        onNotifClick={() => handleNavigate('notifications')}
        onLogoClick={()  => handleNavigate('feed')}
        onSwitchPortal={logout}
        onHamburgerClick={() => setMobileOpen((v) => !v)}
        isMobileOpen={mobileOpen}
      />

      <div className={styles.appBody}>
        <Sidebar
          navItems={CITIZEN_NAV}
          activePage={activePage}
          onNavigate={handleNavigate}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main className={styles.main} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}