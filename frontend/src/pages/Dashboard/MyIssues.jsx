import { useState, useMemo } from 'react';
import styles from './MyIssues.module.css';

// ─────────────────────────────────────────────
// CONSTANTS & STATIC DATA
// ─────────────────────────────────────────────

// Pipeline steps — shared across every issue card
const PIPELINE_STEPS = [
  { key: 'submitted',  icon: '📋', label: 'Submitted'   },
  { key: 'verified',   icon: '✓',  label: 'Verified'    },
  { key: 'assigned',   icon: '⚙',  label: 'Assigned'    },
  { key: 'inprogress', icon: '🔨', label: 'In Progress' },
  { key: 'resolved',   icon: '✅', label: 'Resolved'    },
];

// Maps an issue's status → which pipeline step is "active"
const STATUS_TO_PIPE_STEP = {
  open:     'submitted',
  review:   'verified',
  progress: 'assigned',
  resolved: 'resolved',
};

const STATUS_META = {
  open:     { sCls: styles.sOpen,     label: 'Open',         accentColor: 'var(--danger)',  },
  progress: { sCls: styles.sProgress, label: 'In Progress',  accentColor: 'var(--warn)',    },
  resolved: { sCls: styles.sResolved, label: 'Resolved',     accentColor: 'var(--accent3)', },
  review:   { sCls: styles.sReview,   label: 'Under Review', accentColor: 'var(--accent2)', },
};

const PRIORITY_COLOR = { high: 'var(--danger)', med: 'var(--warn)', low: 'var(--accent3)' };
const PRIORITY_LABEL = { high: 'High',          med: 'Medium',      low: 'Low'            };

const STATUS_TAB_MAP = {
  'Open':         'open',
  'In Progress':  'progress',
  'Under Review': 'review',
  'Resolved':     'resolved',
};

const PRIORITY_ORDER = { high: 0, med: 1, low: 2 };

// ─── Mock issue data ──────────────────────────
const MY_ISSUES_DATA = [
  {
    id: 'CVP-1042', cat: 'Potholes', icon: '🕳️',
    title: 'Deep pothole near bus stop',
    loc: 'MG Road, Imphal', date: 'Mar 10', status: 'progress',
    priority: 'high', votes: 34, color: '#ef4444',
    eta: 'ETA 2 days',
    lastUpdate: 'Field team assigned — Dept. of Roads',
    timeline: [
      { event: 'Report submitted',         time: 'Mar 10, 9:14 AM',  note: 'Your report has been received.',                         state: 'done'   },
      { event: 'Verified by moderator',    time: 'Mar 10, 11:30 AM', note: 'Issue confirmed as high priority.',                      state: 'done'   },
      { event: 'Assigned to Dept. of Roads', time: 'Mar 11, 9:00 AM', note: 'Field team scheduled for assessment.',                  state: 'active' },
      { event: 'Work in progress',         time: 'Pending',           note: '',                                                      state: ''       },
      { event: 'Resolved',                 time: 'Pending',           note: '',                                                      state: ''       },
    ],
  },
  {
    id: 'CVP-1039', cat: 'Street Light', icon: '💡',
    title: 'Street light out for 2 weeks',
    loc: 'Keishampat Junction', date: 'Mar 8', status: 'review',
    priority: 'med', votes: 21, color: '#f59e0b',
    eta: null,
    lastUpdate: 'Issue under review by Electricity Dept.',
    timeline: [
      { event: 'Report submitted',      time: 'Mar 8, 6:52 PM',  note: 'Your report has been received.',             state: 'done'   },
      { event: 'Verified by moderator', time: 'Mar 9, 10:05 AM', note: 'Forwarded to Electricity Department.',       state: 'active' },
      { event: 'Assigned to team',      time: 'Pending',          note: '',                                          state: ''       },
      { event: 'Work in progress',      time: 'Pending',          note: '',                                          state: ''       },
      { event: 'Resolved',              time: 'Pending',          note: '',                                          state: ''       },
    ],
  },
  {
    id: 'CVP-1037', cat: 'Garbage', icon: '🗑️',
    title: 'Illegal dumping near school',
    loc: 'Singjamei Bazaar', date: 'Mar 7', status: 'open',
    priority: 'high', votes: 56, color: '#8b5cf6',
    eta: null,
    lastUpdate: 'Awaiting initial review.',
    timeline: [
      { event: 'Report submitted', time: 'Mar 7, 2:10 PM', note: 'Your report has been received. A moderator will review shortly.', state: 'active' },
      { event: 'Verification',     time: 'Pending',         note: '',  state: '' },
      { event: 'Assigned to team', time: 'Pending',         note: '',  state: '' },
      { event: 'Work in progress', time: 'Pending',         note: '',  state: '' },
      { event: 'Resolved',         time: 'Pending',         note: '',  state: '' },
    ],
  },
  {
    id: 'CVP-1028', cat: 'Potholes', icon: '🕳️',
    title: 'Multiple potholes in colony',
    loc: 'Hafta Market Area', date: 'Mar 3', status: 'resolved',
    priority: 'low', votes: 12, color: '#10b981',
    eta: null,
    lastUpdate: 'Road resurfaced and verified. Issue closed.',
    timeline: [
      { event: 'Report submitted',         time: 'Mar 3, 8:00 AM',  note: 'Your report has been received.',              state: 'done' },
      { event: 'Verified by moderator',    time: 'Mar 3, 1:15 PM',  note: 'Confirmed valid.',                             state: 'done' },
      { event: 'Assigned to Dept. of Roads', time: 'Mar 4, 9:00 AM', note: 'Field team dispatched.',                     state: 'done' },
      { event: 'Work in progress',         time: 'Mar 4, 3:30 PM',  note: 'Road resurfacing begun.',                      state: 'done' },
      { event: 'Resolved',                 time: 'Mar 6, 11:00 AM', note: 'Potholes filled. Area verified by inspector.', state: 'done' },
    ],
  },
  {
    id: 'CVP-1020', cat: 'Fallen Tree', icon: '🌳',
    title: 'Tree blocking footpath',
    loc: 'Paona Bazaar', date: 'Feb 28', status: 'resolved',
    priority: 'med', votes: 8, color: '#10b981',
    eta: null,
    lastUpdate: 'Tree cleared and footpath reopened.',
    timeline: [
      { event: 'Report submitted',      time: 'Feb 28, 7:20 AM',  note: 'Your report has been received.',   state: 'done' },
      { event: 'Verified by moderator', time: 'Feb 28, 9:45 AM',  note: 'Confirmed. Parks Dept. notified.', state: 'done' },
      { event: 'Assigned to Parks Dept.', time: 'Feb 28, 11:00 AM', note: 'Crew dispatched.',               state: 'done' },
      { event: 'Work in progress',      time: 'Feb 28, 2:00 PM',  note: 'Clearing in progress.',            state: 'done' },
      { event: 'Resolved',              time: 'Mar 1, 8:30 AM',   note: 'Footpath fully cleared.',          state: 'done' },
    ],
  },
];

const TAB_OPTIONS = ['All', 'Open', 'In Progress', 'Under Review', 'Resolved'];
const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Most Votes', 'Priority'];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Coloured status badge */
function StatusBadge({ status }) {
  const s = STATUS_META[status] ?? STATUS_META.open;
  return <span className={`${styles.statusBadge} ${s.sCls}`}>{s.label}</span>;
}

/**
 * 5-step pipeline tracker for one issue.
 * Derives done / active / pending from the issue's current status.
 */
function Pipeline({ status }) {
  const activeKey = STATUS_TO_PIPE_STEP[status] ?? 'submitted';
  const activeIdx = PIPELINE_STEPS.findIndex((s) => s.key === activeKey);
  const allDone   = status === 'resolved';

  return (
    <div className={styles.pipelineInner}>
      {PIPELINE_STEPS.map((step, i) => {
        const isDone   = allDone || i < activeIdx;
        const isActive = !allDone && i === activeIdx;

        return (
          <div key={step.key} style={{ display: 'contents' }}>
            {i > 0 && (
              <div
                className={`${styles.pipeLine} ${
                  (allDone || i <= activeIdx) ? styles.pipeLineDone : ''
                }`}
              />
            )}
            <div
              className={`${styles.pipeStep} ${
                isDone   ? (allDone ? styles.pipeResolved : styles.pipeDone)   :
                isActive ? styles.pipeActive : ''
              }`}
            >
              <div className={styles.pipeCircle}>
                {isDone ? '✓' : step.icon}
              </div>
              <div className={styles.pipeLbl}>{step.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Collapsible activity timeline for one issue.
 */
function Timeline({ entries }) {
  return (
    <div className={styles.timeline}>
      {entries.map((entry, i) => (
        <div key={i} className={styles.timelineItem}>
          <div
            className={`${styles.timelineDot} ${
              entry.state === 'done'   ? styles.timelineDotDone   :
              entry.state === 'active' ? styles.timelineDotActive : ''
            }`}
          />
          <div className={styles.timelineEvent}>{entry.event}</div>
          <div className={styles.timelineTime}>{entry.time}</div>
          {entry.note && (
            <div className={styles.timelineNote}>{entry.note}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Single issue report card with pipeline, collapsible timeline,
 * ETA, and action buttons.
 */
function IssueCard({ issue, onWithdraw }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const s           = STATUS_META[issue.status] ?? STATUS_META.open;
  const isResolved  = issue.status === 'resolved';

  return (
    <div className={styles.issueCard}>
      {/* Top colour bar */}
      <div
        className={styles.issueCardAccent}
        style={{ background: s.accentColor }}
      />

      <div className={styles.issueCardBody}>
        {/* Card header */}
        <div className={styles.cardHdr}>
          <div className={styles.cardLeft}>
            <div
              className={styles.issueThumb}
              style={{ background: `${issue.color}22` }}
            >
              {issue.icon}
            </div>
            <div>
              <div className={styles.issueId}>{issue.id}</div>
              <div className={styles.issueTitle}>{issue.title}</div>
              <div className={styles.issueMeta}>
                <span>📍 {issue.loc}</span>
                <span>📅 {issue.date}</span>
                <span>🏷 {issue.cat}</span>
                <span style={{ color: PRIORITY_COLOR[issue.priority] }}>
                  ● {PRIORITY_LABEL[issue.priority]} Priority
                </span>
              </div>
            </div>
          </div>

          <div className={styles.cardRight}>
            <StatusBadge status={issue.status} />
            {issue.eta && (
              <span className={styles.etaBadge}>⏱ {issue.eta}</span>
            )}
          </div>
        </div>

        {/* Pipeline */}
        <div className={styles.pipelineWrap}>
          <Pipeline status={issue.status} />
        </div>

        {/* Last-update / ETA strip */}
        <div className={styles.pipelineEta}>
          <span className={styles.etaText}>
            📌 {issue.lastUpdate}
          </span>
          {/* Timeline toggle */}
          <button
            className={styles.timelineToggle}
            onClick={() => setShowTimeline((v) => !v)}
            aria-expanded={showTimeline}
          >
            <span
              className={`${styles.timelineToggleIcon} ${
                showTimeline ? styles.timelineToggleOpen : ''
              }`}
            >
              ▶
            </span>
            {showTimeline ? 'Hide' : 'View'} activity log
          </button>
        </div>

        {/* Collapsible timeline */}
        {showTimeline && <Timeline entries={issue.timeline} />}

        {/* Action row */}
        <div className={styles.cardActions}>
          <button className={styles.btnGhost}>💬 Add Comment</button>
          <button className={styles.btnGhost}>📤 Share</button>

          {!isResolved && (
            <button
              className={styles.btnDanger}
              onClick={() => onWithdraw(issue.id)}
            >
              🗑 Withdraw
            </button>
          )}

          {isResolved && (
            <button className={styles.btnPrimary}>⭐ Rate Resolution</button>
          )}

          <span className={styles.votePill}>👍 {issue.votes} community votes</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
/**
 * MyIssues — personal issue tracker for the logged-in citizen.
 * Shows summary stats, filterable/sortable issue cards each with
 * a pipeline tracker, collapsible activity timeline, and actions.
 *
 * Props:
 *  - issues     {array}    optional override (defaults to MY_ISSUES_DATA)
 *  - onNavigate {function} navigate to another page e.g. onNavigate('report')
 */
export default function MyIssues({
  issues      = MY_ISSUES_DATA,
  onNavigate  = () => {},
}) {
  const [activeTab,   setActiveTab]   = useState('All');
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState('Newest First');
  const [issueList,   setIssueList]   = useState(issues);
  const [withdrawId,  setWithdrawId]  = useState(null); // confirm dialog

  // ── Summary stats ──────────────────────────
  const stats = [
    { label: 'Total Reports',  val: issueList.length,                                                    color: 'var(--citizen)',  delta: 'all time'       },
    { label: 'Open',           val: issueList.filter(i => i.status === 'open').length,                   color: 'var(--danger)',   delta: 'awaiting review' },
    { label: 'In Progress',    val: issueList.filter(i => i.status === 'progress' || i.status === 'review').length, color: 'var(--warn)', delta: 'being worked on' },
    { label: 'Resolved',       val: issueList.filter(i => i.status === 'resolved').length,               color: 'var(--accent3)',  delta: 'completed'      },
  ];

  // ── Filtering & sorting ────────────────────

  const filtered = useMemo(() => {
    let list = [...issueList];

    // Tab filter
    if (activeTab !== 'All') {
      const key = STATUS_TAB_MAP[activeTab];
      // "In Progress" should also include "review" visually
      if (activeTab === 'In Progress') {
        list = list.filter(i => i.status === 'progress' || i.status === 'review');
      } else {
        list = list.filter(i => i.status === key);
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)    ||
          i.loc.toLowerCase().includes(q)   ||
          i.cat.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'Newest First') {
      // already newest-first in source data
    } else if (sortBy === 'Oldest First') {
      list = [...list].reverse();
    } else if (sortBy === 'Most Votes') {
      list = [...list].sort((a, b) => b.votes - a.votes);
    } else if (sortBy === 'Priority') {
      list = [...list].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      );
    }

    return list;
  }, [issueList, activeTab, search, sortBy]);

  // ── Tab counts ─────────────────────────────
  function tabCount(tab) {
    if (tab === 'All') return issueList.length;
    const key = STATUS_TAB_MAP[tab];
    if (tab === 'In Progress')
      return issueList.filter(i => i.status === 'progress' || i.status === 'review').length;
    return issueList.filter(i => i.status === key).length;
  }

  // ── Withdraw ───────────────────────────────
  function confirmWithdraw() {
    setIssueList(prev => prev.filter(i => i.id !== withdrawId));
    setWithdrawId(null);
  }

  // ── Render ────────────────────────────────
  return (
    <div className={styles.root}>
      <div className={styles.page}>

        {/* PAGE HEADER */}
        <div className={styles.pageHdr}>
          <div>
            <div className={styles.pageTitle}>My Reports</div>
            <div className={styles.pageSub}>Track all the issues you've submitted</div>
          </div>
          <button
            className={styles.btnPrimary}
            onClick={() => onNavigate('report')}
          >
            ＋ New Report
          </button>
        </div>

        {/* SUMMARY STATS */}
        <div className={styles.statsRow}>
          {stats.map((s) => (
            <div
              key={s.label}
              className={styles.statCard}
              style={{ '--statColor': s.color }}
            >
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statVal} style={{ color: s.color }}>
                {s.val}
              </div>
              <div className={styles.statDelta}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          {/* Status tabs */}
          <div className={styles.tabGroup}>
            {TAB_OPTIONS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tabCount(tab) > 0 && (
                  <span style={{
                    marginLeft: '0.35rem',
                    fontSize: '0.65rem',
                    opacity: activeTab === tab ? 0.8 : 0.5,
                  }}>
                    {tabCount(tab)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search your reports…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sort */}
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort reports"
          >
            {SORT_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ISSUE LIST */}
        {filtered.length > 0 ? (
          <div className={styles.issueList}>
            {filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onWithdraw={setWithdrawId}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {search ? '🔍' : '📂'}
            </div>
            <div className={styles.emptyTitle}>
              {search ? 'No matching reports' : 'No reports yet'}
            </div>
            <div className={styles.emptyText}>
              {search
                ? 'Try a different search term or clear the filter.'
                : 'You haven\'t submitted any civic reports yet. Help improve your community!'}
            </div>
            {!search && (
              <button
                className={styles.btnPrimary}
                onClick={() => onNavigate('report')}
              >
                ＋ Report Your First Issue
              </button>
            )}
          </div>
        )}

        {/* WITHDRAW CONFIRM DIALOG */}
        {withdrawId && (
          <div
            className={styles.dialogOverlay}
            onClick={() => setWithdrawId(null)}
          >
            <div
              className={styles.dialog}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.dialogTitle}>Withdraw Report?</div>
              <div className={styles.dialogText}>
                Are you sure you want to withdraw <strong>{withdrawId}</strong>?
                This action cannot be undone and the report will be permanently removed.
              </div>
              <div className={styles.dialogActions}>
                <button
                  className={styles.btnGhost}
                  onClick={() => setWithdrawId(null)}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={confirmWithdraw}
                >
                  Yes, Withdraw
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}