import { useState, useCallback } from 'react';
import styles from './Sidebar.module.css';

const CITIZEN_NAV = [
  { page: 'feed',          icon: '📋', label: 'Community Feed', badge: '',  section: 'Explore'  },
  { page: 'map',           icon: '🗺️', label: 'Issue Map',       badge: '',  section: null       },
  { page: 'report',        icon: '➕', label: 'Report Issue',    badge: '',  section: 'Actions'  },
  { page: 'myissues',      icon: '📂', label: 'My Reports',      badge: '3', section: null       },
  { page: 'notifications', icon: '🔔', label: 'Notifications',   badge: '2', section: 'Account'  },
];

// ─── FIX 1: Accept and wire up onKeyDown prop ───
function NavItem({ item, isActive, collapsed, onClick, onKeyDown }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      onClick={onClick}
      onKeyDown={onKeyDown}  // FIX 1: was never wired up — keyboard nav was broken
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <span className={styles.navIcon} aria-hidden="true">
        {item.icon}
      </span>

      <span className={styles.navLabel}>{item.label}</span>

      {item.badge ? (
        <span className={styles.navBadge} aria-label={`${item.badge} unread`}>
          {item.badge}
        </span>
      ) : null}

      {item.badge ? (
        <span className={styles.navBadgeDot} aria-hidden="true" />
      ) : null}

      {collapsed && hovered && (
        <span className={styles.navTooltip} role="tooltip">
          {item.label}
          {item.badge ? ` (${item.badge})` : ''}
        </span>
      )}
    </button>
  );
}

function SectionLabel({ label }) {
  return (
    <div className={styles.section} aria-hidden="true">
      {label}
    </div>
  );
}

// ─── FIX 2: Use the collapsed prop to conditionally render content ───
function UserCard({ user, collapsed, onClick }) {
  return (
    <div className={styles.userCard}>
      <div
        className={styles.userCardInner}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="Account settings"
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        <div className={styles.userAvatar} aria-hidden="true">
          {user.initials}
        </div>
        {/* FIX 2: name/zone/chevron were always rendered — hidden only by CSS.
            Now they are conditionally rendered so collapsed mode is correct
            even if CSS fails to load or is overridden. */}
        {!collapsed && (
          <>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userZone}>{user.zone}</div>
            </div>
            <span className={styles.userChevron} aria-hidden="true">›</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  navItems        = CITIZEN_NAV,
  activePage      = 'feed',
  onNavigate      = () => {},
  user            = { name: 'Khuraijam Mani', initials: 'KM', zone: 'Zone A, Imphal' },
  onUserClick     = () => {},
  mobileOpen      = false,
  onMobileClose   = () => {},
  collapsed: collapsedProp,
  onCollapseChange,
}) {
  const [collapsedInternal, setCollapsedInternal] = useState(false);

  const isControlled = collapsedProp !== undefined;
  const collapsed    = isControlled ? collapsedProp : collapsedInternal;

  const toggleCollapse = useCallback(() => {
    const next = !collapsed;
    if (isControlled) {
      onCollapseChange?.(next);
    } else {
      setCollapsedInternal(next);
    }
  }, [collapsed, isControlled, onCollapseChange]);

  // ─── FIX 3: handleKeyDown is now actually passed to NavItem ───
  function handleKeyDown(e, page) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(page);
      onMobileClose();
    }
    if (e.key === 'Escape') {
      onMobileClose();
    }
  }

  const groups = [];
  let lastSection = null;

  navItems.forEach((item) => {
    if (item.section && item.section !== lastSection) {
      groups.push({ type: 'section', label: item.section, key: `section-${item.section}` });
      lastSection = item.section;
    }
    groups.push({ type: 'item', item, key: item.page });
  });

  const sidebarCls = [
    styles.sidebar,
    collapsed    ? styles.sidebarCollapsed  : '',
    mobileOpen   ? styles.sidebarMobileOpen : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <nav
        className={`${styles.root} ${sidebarCls}`}
        aria-label="Citizen portal navigation"
      >
        <div className={styles.collapseToggle}>
          <button
            className={`${styles.collapseBtn} ${collapsed ? styles.collapseBtnRotated : ''}`}
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            
          </button>
        </div>

        {groups.map((entry) => (
          entry.type === 'section' ? (
            <SectionLabel key={entry.key} label={entry.label} />
          ) : (
            <NavItem
              key={entry.key}
              item={entry.item}
              isActive={activePage === entry.item.page}
              collapsed={collapsed}
              onClick={() => {
                onNavigate(entry.item.page);
                onMobileClose();
              }}
              onKeyDown={(e) => handleKeyDown(e, entry.item.page)}
            />
          )
        ))}

        <div className={styles.divider} />

        <UserCard
          user={user}
          collapsed={collapsed}
          onClick={onUserClick}
        />

        <div className={styles.version}>CivicPulse v1.0</div>
      </nav>
    </>
  );
}