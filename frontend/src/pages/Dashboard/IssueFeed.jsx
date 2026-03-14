import { useState, useMemo } from 'react';
import styles from './IssueFeed.module.css';

// ─────────────────────────────────────────────
// MOCK DATA  (replace with API / context)
// ─────────────────────────────────────────────
const ALL_ISSUES = [
  {
    id: 'CVP-1042', cat: 'Potholes',    icon: '🕳️',
    title: 'Deep pothole near bus stop',
    loc: 'Manik Nagar, Jorhat',        date: 'Mar 10',
    status: 'progress', priority: 'high', votes: 34,
    color: '#ef4444',
  },
  {
    id: 'CVP-1039', cat: 'Street Light', icon: '💡',
    title: 'Street light out for 2 weeks',
    loc: 'Mariani Junction',       date: 'Mar 8',
    status: 'open',     priority: 'med',  votes: 21,
    color: '#f59e0b',
  },
  {
    id: 'CVP-1037', cat: 'Garbage',      icon: '🗑️',
    title: 'Illegal dumping near school',
    loc: 'Lachit Bazaar',       date: 'Mar 7',
    status: 'open',     priority: 'high', votes: 56,
    color: '#8b5cf6',
  },
  {
    id: 'CVP-1031', cat: 'Water',        icon: '💧',
    title: 'Burst pipe flooding street',
    loc: 'Lamphelpat Road',        date: 'Mar 5',
    status: 'review',   priority: 'high', votes: 41,
    color: '#3b82f6',
  },
  {
    id: 'CVP-1028', cat: 'Potholes',    icon: '🕳️',
    title: 'Multiple potholes in colony',
    loc: 'JEC Road, Garmur',      date: 'Mar 3',
    status: 'resolved', priority: 'low',  votes: 12,
    color: '#10b981',
  },
  {
    id: 'CVP-1020', cat: 'Fallen Tree',  icon: '🌳',
    title: 'Tree blocking footpath',
    loc: 'Lichubari',           date: 'Feb 28',
    status: 'resolved', priority: 'med',  votes: 8,
    color: '#10b981',
  },
  {
    id: 'CVP-1018', cat: 'Potholes',    icon: '🕳️',
    title: 'Road cave-in at intersection',
    loc: 'Thangal Bazaar',         date: 'Feb 26',
    status: 'open',     priority: 'high', votes: 72,
    color: '#ef4444',
  },
  {
    id: 'CVP-1015', cat: 'Street Light', icon: '💡',
    title: 'Entire block without lighting',
    loc: 'Uripok Road',            date: 'Feb 24',
    status: 'progress', priority: 'med',  votes: 29,
    color: '#f59e0b',
  },
  {
    id: 'CVP-1011', cat: 'Water',        icon: '💧',
    title: 'No water supply for 3 days',
    loc: 'Kongba, Imphal East',    date: 'Feb 21',
    status: 'review',   priority: 'high', votes: 88,
    color: '#3b82f6',
  },
  {
    id: 'CVP-1008', cat: 'Garbage',      icon: '🗑️',
    title: 'Overflowing bin near market',
    loc: 'New Checkon Area',       date: 'Feb 19',
    status: 'resolved', priority: 'low',  votes: 15,
    color: '#10b981',
  },
];

const PAGE_SIZE = 6;

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const CATEGORIES = ['All Categories', 'Potholes', 'Street Light', 'Garbage', 'Water', 'Fallen Tree'];
const STATUSES   = ['All Statuses',   'Open',     'In Progress',  'Resolved', 'Under Review'];
const SORTS      = ['Sort: Recent',   'Most Votes', 'Nearest'];

const STATUS_META = {
  open:     { cls: styles.sOpen,     label: 'Open'         },
  progress: { cls: styles.sProgress, label: 'In Progress'  },
  resolved: { cls: styles.sResolved, label: 'Resolved'     },
  review:   { cls: styles.sReview,   label: 'Under Review' },
};

const PRIORITY_COLOR = {
  high: 'var(--danger)',
  med:  'var(--warn)',
  low:  'var(--accent3)',
};
const PRIORITY_LABEL = { high: 'High', med: 'Medium', low: 'Low' };

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Coloured status pill */
function StatusBadge({ status }) {
  const s = STATUS_META[status] ?? STATUS_META.open;
  return (
    <span className={`${styles.statusBadge} ${s.cls}`}>
      {s.label}
    </span>
  );
}

/** Single skeleton card shown while loading */
function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonThumb} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '40%' }} />
        <div className={styles.skeletonLine} style={{ width: '75%' }} />
        <div className={styles.skeletonLine} style={{ width: '55%' }} />
      </div>
    </div>
  );
}

/**
 * Single issue card.
 *
 * Props:
 *  - issue       {object}   issue data object
 *  - onVote      {function} called with issue id when thumbs-up is clicked
 *  - votedIds    {Set}      set of issue ids the user has already voted on
 *  - onNavigate  {function} called with ('report') when Comment clicked etc.
 */
function IssueCard({ issue, onVote, votedIds = new Set(), onNavigate }) {
  const voted = votedIds.has(issue.id);

  return (
    <div className={styles.issueCard}>
      {/* Thumb */}
      <div
        className={styles.issueThumb}
        style={{ background: `${issue.color}22` }}
      >
        {issue.icon}
      </div>

      {/* Body */}
      <div className={styles.issueBody}>
        {/* Top row: id + title + badge */}
        <div className={styles.issueTop}>
          <div className={styles.issueTitleWrap}>
            <div className={styles.issueId}>{issue.id}</div>
            <div className={styles.issueTitle}>{issue.title}</div>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Meta row */}
        <div className={styles.issueMeta}>
          <span className={styles.metaItem}>📍 {issue.loc}</span>
          <span className={styles.metaItem}>🏷 {issue.cat}</span>
          <span className={styles.metaItem}>📅 {issue.date}</span>
          <span
            className={styles.priorityDot}
            style={{ color: PRIORITY_COLOR[issue.priority] }}
          >
            ● {PRIORITY_LABEL[issue.priority]} Priority
          </span>
        </div>

        {/* Vote / action row */}
        <div className={styles.voteRow}>
          <button
            className={voted ? styles.voteBtnActive : styles.voteBtn}
            onClick={(e) => { e.stopPropagation(); onVote?.(issue.id); }}
            aria-label="Upvote this issue"
          >
            👍 {voted ? issue.votes + 1 : issue.votes} votes
          </button>
          <button
            className={styles.voteBtn}
            onClick={(e) => { e.stopPropagation(); onNavigate?.('report'); }}
          >
            💬 Comment
          </button>
          <button
            className={styles.voteBtn}
            onClick={(e) => {
              e.stopPropagation();
              navigator.share?.({ title: issue.title, text: `Check out ${issue.id}` });
            }}
          >
            📤 Share
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
/**
 * IssueFeed — filterable, searchable, paginated list of civic issues.
 *
 * Props:
 *  - issues      {array}    optional override of the issue list (defaults to ALL_ISSUES)
 *  - loading     {boolean}  show skeleton state
 *  - onNavigate  {function} navigate to another page: onNavigate('report')
 */
export default function IssueFeed({
  issues      = ALL_ISSUES,
  loading     = false,
  onNavigate  = () => {},
}) {
  const [search,       setSearch]       = useState('');
  const [catFilter,    setCatFilter]    = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy,       setSortBy]       = useState('Sort: Recent');
  const [page,         setPage]         = useState(1);
  const [votedIds,     setVotedIds]     = useState(new Set());

  // ── Derived list ──────────────────────────
  const filtered = useMemo(() => {
    let list = [...issues];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.loc.toLowerCase().includes(q)   ||
          i.id.toLowerCase().includes(q)    ||
          i.cat.toLowerCase().includes(q)
      );
    }

    // Category
    if (catFilter !== 'All Categories') {
      list = list.filter((i) => i.cat === catFilter);
    }

    // Status
    if (statusFilter !== 'All Statuses') {
      list = list.filter(
        (i) => STATUS_META[i.status]?.label === statusFilter
      );
    }

    // Sort
    if (sortBy === 'Most Votes') {
      list.sort((a, b) => b.votes - a.votes);
    }
    // 'Sort: Recent' — already ordered by date descending in source data
    // 'Nearest'       — would use geolocation; left as-is for now

    return list;
  }, [issues, search, catFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible    = filtered.slice(0, page * PAGE_SIZE);

  // Active filter chips
  const activeFilters = [
    catFilter    !== 'All Categories' && { key: 'cat',    label: catFilter,    clear: () => { setCatFilter('All Categories'); resetPage(); } },
    statusFilter !== 'All Statuses'   && { key: 'status', label: statusFilter, clear: () => { setStatusFilter('All Statuses');   resetPage(); } },
    sortBy       !== 'Sort: Recent'   && { key: 'sort',   label: sortBy,       clear: () => { setSortBy('Sort: Recent');         resetPage(); } },
  ].filter(Boolean);

  function resetPage() { setPage(1); }

  function handleVote(id) {
    setVotedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Render ────────────────────────────────
  return (
    <div className={styles.root}>
      <div className={styles.feed}>

        {/* PAGE HEADER */}
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

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search issues, locations, IDs…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            />
          </div>

          <div className={styles.filterDivider} />

          {/* Category */}
          <select
            className={styles.filterSelect}
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); resetPage(); }}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* Status */}
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
            aria-label="Sort issues"
          >
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>

          {/* Result count */}
          {!loading && (
            <span className={styles.resultCount}>
              {filtered.length} issue{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {activeFilters.length > 0 && (
          <div className={styles.chipRow}>
            {activeFilters.map((f) => (
              <button
                key={f.key}
                className={styles.chip}
                onClick={f.clear}
                aria-label={`Remove ${f.label} filter`}
              >
                {f.label}
                <span className={styles.chipX}>✕</span>
              </button>
            ))}
            <button
              className={styles.chip}
              onClick={() => {
                setCatFilter('All Categories');
                setStatusFilter('All Statuses');
                setSortBy('Sort: Recent');
                setSearch('');
                resetPage();
              }}
            >
              Clear all <span className={styles.chipX}>✕</span>
            </button>
          </div>
        )}

        {/* SKELETONS */}
        {loading && (
          <div className={styles.issueGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ISSUE LIST */}
        {!loading && visible.length > 0 && (
          <div className={styles.issueGrid}>
            {visible.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onVote={handleVote}
                votedIds={votedIds}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && visible.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <div className={styles.emptyTitle}>No issues found</div>
            <div className={styles.emptyText}>
              Try adjusting your filters or search query.
            </div>
            <div className={styles.emptyAction}>
              <button
                className={styles.btnGhost}
                onClick={() => {
                  setCatFilter('All Categories');
                  setStatusFilter('All Statuses');
                  setSortBy('Sort: Recent');
                  setSearch('');
                  resetPage();
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* LOAD MORE */}
        {!loading && page < totalPages && (
          <div className={styles.loadMore}>
            <button
              className={styles.btnGhost}
              onClick={() => setPage((p) => p + 1)}
            >
              Load more issues ↓
            </button>
          </div>
        )}

      </div>
    </div>
  );
}