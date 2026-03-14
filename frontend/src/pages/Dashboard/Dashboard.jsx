import { useState } from 'react';
import styles from './Dashboard.module.css';

// ─────────────────────────────────────────────
// MOCK DATA  (replace with real API / context)
// ─────────────────────────────────────────────
const ISSUES = [
  {
    id: 'CVP-1042', cat: 'Potholes', icon: '🕳️',
    title: 'Deep pothole near bus stop',
    loc: 'MG Road, Imphal', date: 'Mar 10',
    status: 'progress', priority: 'high', votes: 34,
    color: '#ef4444',
  },
  {
    id: 'CVP-1039', cat: 'Street Light', icon: '💡',
    title: 'Street light out for 2 weeks',
    loc: 'Keishampat Junction', date: 'Mar 8',
    status: 'open', priority: 'med', votes: 21,
    color: '#f59e0b',
  },
  {
    id: 'CVP-1037', cat: 'Garbage', icon: '🗑️',
    title: 'Illegal dumping near school',
    loc: 'Singjamei Bazaar', date: 'Mar 7',
    status: 'open', priority: 'high', votes: 56,
    color: '#8b5cf6',
  },
  {
    id: 'CVP-1031', cat: 'Water', icon: '💧',
    title: 'Burst pipe flooding street',
    loc: 'Lamphelpat Road', date: 'Mar 5',
    status: 'review', priority: 'high', votes: 41,
    color: '#3b82f6',
  },
  {
    id: 'CVP-1028', cat: 'Potholes', icon: '🕳️',
    title: 'Multiple potholes in colony',
    loc: 'Hafta Market Area', date: 'Mar 3',
    status: 'resolved', priority: 'low', votes: 12,
    color: '#10b981',
  },
  {
    id: 'CVP-1020', cat: 'Fallen Tree', icon: '🌳',
    title: 'Tree blocking footpath',
    loc: 'Paona Bazaar', date: 'Feb 28',
    status: 'resolved', priority: 'med', votes: 8,
    color: '#10b981',
  },
];

const MY_ISSUES = ISSUES.slice(0, 3);

const NOTIFICATIONS = [
  {
    id: 1, icon: '✅', bg: 'rgba(16,185,129,.15)',
    title: 'Issue Resolved',
    desc: 'Your pothole report #CVP-1028 on Hafta Market has been resolved.',
    time: '2 hours ago', unread: true,
  },
  {
    id: 2, icon: '⚙️', bg: 'rgba(59,130,246,.15)',
    title: 'Team Assigned',
    desc: 'A field team has been assigned to your water pipe report #CVP-1031.',
    time: '5 hours ago', unread: true,
  },
  {
    id: 3, icon: '👍', bg: 'rgba(139,92,246,.15)',
    title: 'Community Upvote',
    desc: '12 citizens upvoted your garbage issue near Singjamei School.',
    time: 'Yesterday', unread: false,
  },
  {
    id: 4, icon: '📋', bg: 'rgba(249,115,22,.15)',
    title: 'Status Update',
    desc: 'Issue #CVP-1039 is now under review by the Electricity Department.',
    time: '2 days ago', unread: false,
  },
];

const STATS = [
  { label: 'Reports Filed',   value: '12',  delta: '↑ 2 this month',  deltaType: 'up',   color: 'var(--citizen)' },
  { label: 'In Progress',     value: '4',   delta: 'Being worked on', deltaType: 'up',   color: 'var(--warn)'    },
  { label: 'Resolved',        value: '6',   delta: '↑ 50% rate',      deltaType: 'up',   color: 'var(--accent3)' },
  { label: 'Community Votes', value: '172', delta: '↑ 34 this week',  deltaType: 'up',   color: 'var(--accent2)' },
];

const QUICK_ACTIONS = [
  { icon: '➕', label: 'Report Issue',    sub: 'Submit a new civic issue',   page: 'report'  },
  { icon: '🗺️', label: 'Issue Map',       sub: 'See issues near you',        page: 'map'     },
  { icon: '📂', label: 'My Reports',      sub: 'Track your submissions',     page: 'myissues'},
  { icon: '🔔', label: 'Notifications',   sub: '2 unread updates',           page: 'notifications' },
];

const PIPELINE_STEPS = [
  { label: 'Reported', icon: '📋', state: 'done'   },
  { label: 'Verified', icon: '✓',  state: 'done'   },
  { label: 'Assigned', icon: '⚙',  state: 'active' },
  { label: 'In Progress', icon: '🔨', state: ''     },
  { label: 'Resolved', icon: '✅', state: ''        },
];

const CATEGORIES = ['All Categories', 'Potholes', 'Street Lights', 'Garbage', 'Water'];
const STATUSES   = ['All Statuses', 'Open', 'In Progress', 'Resolved'];
const SORTS      = ['Sort: Recent', 'Most Votes', 'Nearest'];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const STATUS_MAP = {
  open:     { cls: styles.sOpen,     label: 'Open'        },
  progress: { cls: styles.sProgress, label: 'In Progress' },
  resolved: { cls: styles.sResolved, label: 'Resolved'    },
  review:   { cls: styles.sReview,   label: 'Under Review'},
};

const PRIORITY_COLORS = {
  high: 'var(--danger)',
  med:  'var(--warn)',
  low:  'var(--accent3)',
};

const PRIORITY_LABELS = { high: 'High', med: 'Medium', low: 'Low' };

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.open;
  return <span className={`${styles.statusBadge} ${s.cls}`}>{s.label}</span>;
}

function IssueCard({ issue, showVote = true }) {
  return (
    <div className={styles.issueCard}>
      <div
        className={styles.issueThumb}
        style={{ background: `${issue.color}22` }}
      >
        {issue.icon}
      </div>

      <div className={styles.issueBody}>
        <div className={styles.issueTop}>
          <div className={styles.issueTitle}>{issue.title}</div>
          <StatusBadge status={issue.status} />
        </div>

        <div className={styles.issueMeta}>
          <span>📍 {issue.loc}</span>
          <span>🏷 {issue.cat}</span>
          <span>📅 {issue.date}</span>
          <span style={{ color: PRIORITY_COLORS[issue.priority] }}>
            ● {PRIORITY_LABELS[issue.priority]} Priority
          </span>
        </div>

        {showVote && (
          <div className={styles.voteRow}>
            <button className={styles.voteBtn}>👍 {issue.votes} votes</button>
            <button className={styles.voteBtn}>💬 Comment</button>
            <button className={styles.voteBtn}>📤 Share</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Dashboard({
  user = { name: 'Khuraijam Mani', initials: 'KM', zone: 'Zone A, Imphal' },
  onNavigate = () => {},
}) {
  const [catFilter,    setCatFilter]    = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortFilter,   setSortFilter]   = useState('Sort: Recent');

  // Derived feed
  const feed = ISSUES.filter((i) => {
    const catMatch =
      catFilter === 'All Categories' ||
      i.cat.toLowerCase().includes(catFilter.toLowerCase());
    const statusMatch =
      statusFilter === 'All Statuses' ||
      STATUS_MAP[i.status]?.label === statusFilter;
    return catMatch && statusMatch;
  }).sort((a, b) => {
    if (sortFilter === 'Most Votes') return b.votes - a.votes;
    return 0; // default: recent (already ordered)
  });

  return (
    <div className={styles.root}>
      <div className={styles.dashboard}>

        {/* ── PAGE HEADER ─────────────────────── */}
        <div className={styles.pageHdr}>
          <div>
            <div className={styles.pageTitle}>Community Feed</div>
            <div className={styles.pageSub}>Issues reported in your area</div>
          </div>
          <button
            className={styles.btnPrimary}
            onClick={() => onNavigate('report')}
          >
            ＋ Report Issue
          </button>
        </div>

        {/* ── WELCOME BANNER ──────────────────── */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeGlow} />
          <div className={styles.welcomeLeft}>
            <div className={styles.avatarLg}>{user.initials}</div>
            <div>
              <div className={styles.welcomeGreet}>Welcome back</div>
              <div className={styles.welcomeName}>{user.name}</div>
              <div className={styles.welcomeZone}>
                <span>📍</span>{user.zone}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className={styles.btnPrimary}
              onClick={() => onNavigate('report')}
            >
              ＋ New Report
            </button>
            <button
              className={styles.btnGhost}
              onClick={() => onNavigate('myissues')}
            >
              My Reports →
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ──────────────────────── */}
        <div className={styles.statsRow}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statVal} style={{ color: s.color }}>
                {s.value}
              </div>
              <div className={`${styles.statDelta} ${s.deltaType === 'up' ? styles.deltaUp : styles.deltaDown}`}>
                {s.delta}
              </div>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ───────────────────── */}
        <div className={styles.quickActions}>
          {QUICK_ACTIONS.map((q) => (
            <div
              key={q.page}
              className={styles.quickCard}
              onClick={() => onNavigate(q.page)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate(q.page)}
            >
              <div className={styles.quickIcon}>{q.icon}</div>
              <div>
                <div className={styles.quickLabel}>{q.label}</div>
                <div className={styles.quickSub}>{q.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── STATUS PIPELINE (latest report) ─── */}
        <div className={styles.pipelineWrap}>
          <div className={styles.pipelineLabel}>
            Latest Report — #CVP-1042 Pothole on MG Road
          </div>
          <div className={styles.pipeline}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} style={{ display: 'contents' }}>
                {i > 0 && (
                  <div
                    className={`${styles.pipeLine} ${
                      PIPELINE_STEPS[i - 1].state === 'done' ? styles.pipeLineDone : ''
                    }`}
                  />
                )}
                <div
                  className={`${styles.pipeStep} ${
                    step.state === 'done'
                      ? styles.pipeDone
                      : step.state === 'active'
                      ? styles.pipeActive
                      : ''
                  }`}
                >
                  <div className={styles.pipeCircle}>{step.icon}</div>
                  <div className={styles.pipeLbl}>{step.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.pipeEta}>
            Last update: Team assigned — ETA 2 days
          </div>
        </div>

        {/* ── TWO-COLUMN: FEED + NOTIFICATIONS ── */}
        <div className={styles.twoCol}>

          {/* LEFT — Community Feed */}
          <div>
            <div className={styles.sectionHdr}>
              <span className={styles.sectionTitle}>Community Feed</span>
              <button
                className={styles.sectionLink}
                onClick={() => onNavigate('feed')}
              >
                View all →
              </button>
            </div>

            {/* Filter bar */}
            <div className={styles.filterBar}>
              <select
                className={styles.filterSelect}
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>

              <select
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>

              <select
                className={styles.filterSelect}
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
              >
                {SORTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {feed.length > 0 ? (
              <div className={styles.issueGrid}>
                {feed.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} showVote />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <div className={styles.emptyText}>No issues match your filters.</div>
              </div>
            )}
          </div>

          {/* RIGHT — Notifications panel */}
          <div>
            <div className={styles.sectionHdr}>
              <span className={styles.sectionTitle}>Notifications</span>
              <button
                className={styles.sectionLink}
                onClick={() => onNavigate('notifications')}
              >
                Mark all read
              </button>
            </div>

            <div className={styles.panel}>
              <div className={styles.notifList}>
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${n.unread ? styles.notifUnread : ''}`}
                  >
                    <div
                      className={styles.notifIcon}
                      style={{ background: n.bg }}
                    >
                      {n.icon}
                    </div>
                    <div className={styles.notifBody}>
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifDesc}>{n.desc}</div>
                      <div className={styles.notifTime}>{n.time}</div>
                    </div>
                    {n.unread && <div className={styles.unreadDot} />}
                  </div>
                ))}
              </div>
            </div>

            {/* My Reports mini-list */}
            <div className={styles.sectionHdr} style={{ marginTop: '1.5rem' }}>
              <span className={styles.sectionTitle}>My Reports</span>
              <button
                className={styles.sectionLink}
                onClick={() => onNavigate('myissues')}
              >
                View all →
              </button>
            </div>

            <div className={styles.issueGrid}>
              {MY_ISSUES.map((issue) => (
                <IssueCard key={issue.id} issue={issue} showVote={false} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}