import { useState, useMemo } from 'react';
import styles from './Notifications.module.css';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

// Notification types — drives the colour badge and filter tab
const TYPE = {
  RESOLVED: 'resolved',
  ASSIGNED: 'assigned',
  VOTE:     'vote',
  STATUS:   'status',
  ALERT:    'alert',
  COMMENT:  'comment',
  SYSTEM:   'system',
};

const TYPE_META = {
  [TYPE.RESOLVED]: { label: 'Resolved',   cls: styles.typeResolved, icon: '✅' },
  [TYPE.ASSIGNED]: { label: 'Assigned',   cls: styles.typeAssigned, icon: '⚙️' },
  [TYPE.VOTE]:     { label: 'Upvote',     cls: styles.typeVote,     icon: '👍' },
  [TYPE.STATUS]:   { label: 'Status',     cls: styles.typeStatus,   icon: '📋' },
  [TYPE.ALERT]:    { label: 'Alert',      cls: styles.typeAlert,    icon: '🚨' },
  [TYPE.COMMENT]:  { label: 'Comment',    cls: styles.typeComment,  icon: '💬' },
  [TYPE.SYSTEM]:   { label: 'System',     cls: styles.typeSystem,   icon: 'ℹ️' },
};

// Preference settings
const DEFAULT_PREFS = {
  resolved:  true,
  assigned:  true,
  vote:      true,
  status:    true,
  alert:     true,
  comment:   true,
  system:    false,
};

// Tab definitions
const TABS = ['All', 'Unread', 'Resolved', 'Status', 'Votes', 'Comments', 'System'];

const PAGE_SIZE = 8;

// Defined at module scope so the reference is stable across renders
// (avoids breaking the useMemo dependency and tabCount comparisons)
const TAB_FILTER = {
  'All':      null,
  'Unread':   (n) => n.unread,
  'Resolved': (n) => n.type === TYPE.RESOLVED,
  'Status':   (n) => n.type === TYPE.STATUS || n.type === TYPE.ASSIGNED || n.type === TYPE.ALERT,
  'Votes':    (n) => n.type === TYPE.VOTE,
  'Comments': (n) => n.type === TYPE.COMMENT,
  'System':   (n) => n.type === TYPE.SYSTEM,
};

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
let _idCounter = 1;
function mkId() { return _idCounter++; }

const INITIAL_NOTIFICATIONS = [
  {
    id: mkId(), type: TYPE.RESOLVED,
    icon: '✅', bg: 'rgba(16,185,129,.15)',
    title: 'Issue Resolved',
    desc: 'Your pothole report #CVP-1028 on JEC Road, Garmur has been resolved.',
    ref: '#CVP-1028',
    time: '2 hours ago', timestamp: Date.now() - 2 * 60 * 60 * 1000,
    unread: true, group: 'Today',
  },
  {
    id: mkId(), type: TYPE.ASSIGNED,
    icon: '⚙️', bg: 'rgba(59,130,246,.15)',
    title: 'Team Assigned',
    desc: 'A field team has been assigned to your water pipe report #CVP-1031.',
    ref: '#CVP-1031',
    time: '5 hours ago', timestamp: Date.now() - 5 * 60 * 60 * 1000,
    unread: true, group: 'Today',
  },
  {
    id: mkId(), type: TYPE.ALERT,
    icon: '🚨', bg: 'rgba(239,68,68,.15)',
    title: 'High Priority Alert',
    desc: 'Issue #CVP-1018 (Road cave-in at Thangal Bazaar) has been escalated to high priority.',
    ref: '#CVP-1018',
    time: '8 hours ago', timestamp: Date.now() - 8 * 60 * 60 * 1000,
    unread: true, group: 'Today',
  },
  {
    id: mkId(), type: TYPE.COMMENT,
    icon: '💬', bg: 'rgba(245,158,11,.15)',
    title: 'New Comment on Your Report',
    desc: 'A field officer added a note to #CVP-1042: "Assessment scheduled for tomorrow morning."',
    ref: '#CVP-1042',
    time: '10 hours ago', timestamp: Date.now() - 10 * 60 * 60 * 1000,
    unread: false, group: 'Today',
  },
  {
    id: mkId(), type: TYPE.VOTE,
    icon: '👍', bg: 'rgba(139,92,246,.15)',
    title: 'Community Upvote',
    desc: '12 citizens upvoted your garbage issue near Lachit Bazaar.',
    ref: '#CVP-1037',
    time: 'Yesterday', timestamp: Date.now() - 26 * 60 * 60 * 1000,
    unread: false, group: 'Yesterday',
  },
  {
    id: mkId(), type: TYPE.STATUS,
    icon: '📋', bg: 'rgba(249,115,22,.15)',
    title: 'Status Update',
    desc: 'Issue #CVP-1039 is now under review by the Electricity Department.',
    ref: '#CVP-1039',
    time: 'Yesterday', timestamp: Date.now() - 30 * 60 * 60 * 1000,
    unread: false, group: 'Yesterday',
  },
  {
    id: mkId(), type: TYPE.RESOLVED,
    icon: '✅', bg: 'rgba(16,185,129,.15)',
    title: 'Issue Resolved',
    desc: 'Fallen tree on Lichubari (#CVP-1020) has been fully cleared.',
    ref: '#CVP-1020',
    time: '2 days ago', timestamp: Date.now() - 50 * 60 * 60 * 1000,
    unread: false, group: 'Earlier',
  },
  {
    id: mkId(), type: TYPE.VOTE,
    icon: '👍', bg: 'rgba(139,92,246,.15)',
    title: 'Community Upvote',
    desc: '8 more citizens upvoted the burst pipe issue on Lamphelpat Road.',
    ref: '#CVP-1031',
    time: '2 days ago', timestamp: Date.now() - 52 * 60 * 60 * 1000,
    unread: false, group: 'Earlier',
  },
  {
    id: mkId(), type: TYPE.COMMENT,
    icon: '💬', bg: 'rgba(245,158,11,.15)',
    title: 'New Comment',
    desc: 'A resident commented on #CVP-1037: "This has been going on for weeks, please fix it!"',
    ref: '#CVP-1037',
    time: '3 days ago', timestamp: Date.now() - 72 * 60 * 60 * 1000,
    unread: false, group: 'Earlier',
  },
  {
    id: mkId(), type: TYPE.SYSTEM,
    icon: 'ℹ️', bg: 'rgba(100,116,139,.15)',
    title: 'Welcome to NagarSetu',
    desc: 'Thanks for joining! Start by reporting an issue in your area. Your voice matters.',
    ref: null,
    time: '5 days ago', timestamp: Date.now() - 120 * 60 * 60 * 1000,
    unread: false, group: 'Earlier',
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Highlight a #CVP-XXXX ref inside description */
function DescWithRef({ desc, issueRef }) {
  if (!issueRef || !desc.includes(issueRef)) {
    return <span>{desc}</span>;
  }
  const [before, after] = desc.split(issueRef);
  return (
    <span>
      {before}
      <span className={styles.notifRef}>{issueRef}</span>
      {after}
    </span>
  );
}

/** Type badge pill */
function TypeBadge({ type }) {
  const meta = TYPE_META[type] ?? TYPE_META[TYPE.SYSTEM];
  return (
    <span className={`${styles.typeBadge} ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

/** Preference toggle row */
function PrefToggle({ label, icon, checked, onChange }) {
  return (
    <div className={styles.settingRow}>
      <span className={styles.settingLabel}>
        <span>{icon}</span>
        {label}
      </span>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          className={styles.toggleInput}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.toggleSlider} />
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
/**
 * Notifications — full notification centre for the citizen portal.
 *
 * Props:
 *  - initialNotifs  {array}    optional override of initial notifications
 *  - onNavigate     {function} called with a page key
 */
export default function Notifications({
  initialNotifs = INITIAL_NOTIFICATIONS,
  onNavigate    = () => {},
}) {
  const [notifs,       setNotifs]       = useState(initialNotifs);
  const [activeTab,    setActiveTab]    = useState('All');
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs,        setPrefs]        = useState(DEFAULT_PREFS);
  const [dismissingId, setDismissingId] = useState(null);

  // ── Derived counts ────────────────────────
  const unreadCount = notifs.filter((n) => n.unread).length;

  const summaryPills = [
    { label: 'Unread',    val: notifs.filter(n => n.unread).length,                        color: 'var(--accent)',  pulse: true  },
    { label: 'Resolved',  val: notifs.filter(n => n.type === TYPE.RESOLVED).length,        color: 'var(--accent3)', pulse: false },
    { label: 'Updates',   val: notifs.filter(n => n.type === TYPE.STATUS || n.type === TYPE.ASSIGNED).length, color: 'var(--accent2)', pulse: false },
  ];

  // ── Filtered list ─────────────────────────
  const filtered = useMemo(() => {
    let list = notifs.filter((n) => prefs[n.type] !== false);

    const tabFn = TAB_FILTER[activeTab];
    if (tabFn) list = list.filter(tabFn);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.desc.toLowerCase().includes(q)  ||
          (n.ref && n.ref.toLowerCase().includes(q))
      );
    }

    return list;
  }, [notifs, activeTab, search, prefs]);

  // ── Date grouping ─────────────────────────
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((n) => {
      const g = n.group ?? 'Earlier';
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    });
    // Consistent group order
    const ORDER = ['Today', 'Yesterday', 'Earlier'];
    return ORDER.filter((g) => groups[g]).map((g) => ({ label: g, items: groups[g] }));
  }, [filtered]);

  const allVisible = grouped.flatMap((g) => g.items);
  const paginated  = allVisible.slice(0, page * PAGE_SIZE);
  const hasMore    = paginated.length < allVisible.length;

  // ── Tab count helper ──────────────────────
  function tabCount(tab) {
    const fn = TAB_FILTER[tab];
    if (!fn) return notifs.length;
    return notifs.filter(fn).length;
  }

  // ── Actions ───────────────────────────────
  function markRead(id) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function dismiss(id) {
    setDismissingId(id);
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
      setDismissingId(null);
    }, 250);
  }

  function clearAll() {
    setNotifs([]);
  }

  function updatePref(key, val) {
    setPrefs((prev) => ({ ...prev, [key]: val }));
  }

  // ── Render ────────────────────────────────
  return (
    <div className={styles.root}>
      <div className={styles.page}>

        {/* PAGE HEADER */}
        <div className={styles.pageHdr}>
          <div className={styles.titleBlock}>
            <div className={styles.pageTitle}>Notifications</div>
            <div className={styles.pageSub}>
              Updates on issues you follow
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  background: 'rgba(249,115,22,0.15)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  borderRadius: '99px',
                  padding: '0.1rem 0.55rem',
                  fontSize: '0.72rem',
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className={styles.headerActions}>
            {unreadCount > 0 && (
              <button className={styles.btnGhost} onClick={markAllRead}>
                ✓ Mark all read
              </button>
            )}
            <button
              className={styles.btnGhost}
              onClick={() => setShowSettings((v) => !v)}
              aria-expanded={showSettings}
            >
              ⚙ Preferences
            </button>
            {notifs.length > 0 && (
              <button className={styles.btnDanger} onClick={clearAll}>
                🗑 Clear all
              </button>
            )}
          </div>
        </div>

        {/* SUMMARY PILLS */}
        <div className={styles.summaryStrip}>
          {summaryPills.map((p) => (
            <div key={p.label} className={styles.summaryPill}>
              {p.pulse && (
                <div
                  className={styles.pillDot}
                  style={{ background: p.color }}
                />
              )}
              <span>{p.label}</span>
              <span className={styles.pillVal} style={{ color: p.color }}>
                {p.val}
              </span>
            </div>
          ))}
        </div>

        {/* PREFERENCES PANEL */}
        {showSettings && (
          <div className={styles.settingsPanel}>
            <div className={styles.settingsPanelTitle}>Notification Preferences</div>
            <div className={styles.settingsGrid}>
              <PrefToggle label="Resolved issues"  icon="✅" checked={prefs.resolved} onChange={(v) => updatePref('resolved', v)} />
              <PrefToggle label="Team assignments" icon="⚙️" checked={prefs.assigned} onChange={(v) => updatePref('assigned', v)} />
              <PrefToggle label="Community votes"  icon="👍" checked={prefs.vote}     onChange={(v) => updatePref('vote',     v)} />
              <PrefToggle label="Status updates"   icon="📋" checked={prefs.status}   onChange={(v) => updatePref('status',   v)} />
              <PrefToggle label="Priority alerts"  icon="🚨" checked={prefs.alert}    onChange={(v) => updatePref('alert',    v)} />
              <PrefToggle label="Comments"         icon="💬" checked={prefs.comment}  onChange={(v) => updatePref('comment',  v)} />
              <PrefToggle label="System messages"  icon="ℹ️" checked={prefs.system}   onChange={(v) => updatePref('system',   v)} />
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          {/* Tabs */}
          <div className={styles.tabGroup}>
            {TABS.map((tab) => {
              const count = tabCount(tab);
              return (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                >
                  {tab}
                  {count > 0 && (
                    <span className={activeTab === tab ? styles.tabBadge : styles.tabBadgeInactive}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search notifications…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* NOTIFICATION LIST */}
        {allVisible.length > 0 ? (
          <>
            {grouped.map((group) => {
              const visibleItems = group.items.filter((n) => paginated.includes(n));
              if (visibleItems.length === 0) return null;
              return (
                <div key={group.label} className={styles.dateGroup}>
                  {/* Date separator */}
                  <div className={styles.dateLabel}>
                    {group.label}
                    <div className={styles.dateLabelLine} />
                  </div>

                  {/* Items */}
                  <div className={styles.notifList}>
                    {visibleItems.map((n) => (
                      <div
                        key={n.id}
                        className={`
                          ${styles.notifItem}
                          ${n.unread ? styles.notifUnread : styles.notifRead}
                          ${dismissingId === n.id ? styles.notifDismissing : ''}
                        `}
                        onClick={() => markRead(n.id)}
                      >
                        {/* Icon */}
                        <div
                          className={styles.notifIcon}
                          style={{ background: n.bg }}
                        >
                          {n.icon}
                        </div>

                        {/* Body */}
                        <div className={styles.notifBody}>
                          <div className={styles.notifTitle}>{n.title}</div>
                          <div className={styles.notifDesc}>
                            <DescWithRef desc={n.desc} issueRef={n.ref} />
                          </div>
                          <div className={styles.notifTime}>
                            🕐 {n.time}
                            {n.ref && (
                              <>
                                &nbsp;·&nbsp;
                                <span
                                  className={styles.notifRef}
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate('myissues');
                                  }}
                                >
                                  View report →
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right side */}
                        <div className={styles.notifRight}>
                          <TypeBadge type={n.type} />
                          {n.unread && <div className={styles.unreadDot} />}
                          <button
                            className={styles.dismissBtn}
                            onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                            aria-label="Dismiss notification"
                            title="Dismiss"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Load more */}
            {hasMore && (
              <div className={styles.loadMore}>
                <button
                  className={styles.btnGhost}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load more ↓
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>
              {search ? '🔍' : '🔔'}
            </span>
            <div className={styles.emptyTitle}>
              {search
                ? 'No notifications match your search'
                : activeTab !== 'All'
                ? `No ${activeTab.toLowerCase()} notifications`
                : 'You\'re all caught up!'}
            </div>
            <div className={styles.emptyText}>
              {search
                ? 'Try a different keyword or clear the search.'
                : 'New notifications will appear here as your reports progress through the pipeline.'}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}