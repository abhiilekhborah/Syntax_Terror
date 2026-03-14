import { useState, useRef, useEffect } from 'react';
import styles from './MapView.module.css';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

// Pins are expressed as percentages of the map container (0–100)
// so the layout stays fluid across any container width/height.
const ALL_ISSUES = [
  {
    id: 'CVP-1042', cat: 'Potholes',     icon: '🕳️',
    title: 'Deep pothole near bus stop',
    loc: 'MG Road, Imphal',
    date: 'Mar 10', status: 'progress', priority: 'high', votes: 34,
    color: '#ef4444',
    pin: { x: 33, y: 12 },
  },
  {
    id: 'CVP-1039', cat: 'Street Light', icon: '💡',
    title: 'Street light out for 2 weeks',
    loc: 'Keishampat Junction',
    date: 'Mar 8',  status: 'open',     priority: 'med',  votes: 21,
    color: '#f59e0b',
    pin: { x: 58, y: 38 },
  },
  {
    id: 'CVP-1037', cat: 'Garbage',      icon: '🗑️',
    title: 'Illegal dumping near school',
    loc: 'Singjamei Bazaar',
    date: 'Mar 7',  status: 'open',     priority: 'high', votes: 56,
    color: '#8b5cf6',
    pin: { x: 15, y: 56 },
  },
  {
    id: 'CVP-1031', cat: 'Water',        icon: '💧',
    title: 'Burst pipe flooding street',
    loc: 'Lamphelpat Road',
    date: 'Mar 5',  status: 'review',   priority: 'high', votes: 41,
    color: '#3b82f6',
    pin: { x: 75, y: 20 },
  },
  {
    id: 'CVP-1028', cat: 'Potholes',    icon: '🕳️',
    title: 'Multiple potholes in colony',
    loc: 'Hafta Market Area',
    date: 'Mar 3',  status: 'resolved', priority: 'low',  votes: 12,
    color: '#10b981',
    pin: { x: 68, y: 62 },
  },
  {
    id: 'CVP-1020', cat: 'Fallen Tree',  icon: '🌳',
    title: 'Tree blocking footpath',
    loc: 'Paona Bazaar',
    date: 'Feb 28', status: 'resolved', priority: 'med',  votes: 8,
    color: '#10b981',
    pin: { x: 44, y: 76 },
  },
  {
    id: 'CVP-1018', cat: 'Potholes',    icon: '🕳️',
    title: 'Road cave-in at intersection',
    loc: 'Thangal Bazaar',
    date: 'Feb 26', status: 'open',     priority: 'high', votes: 72,
    color: '#ef4444',
    pin: { x: 22, y: 30 },
  },
  {
    id: 'CVP-1011', cat: 'Water',        icon: '💧',
    title: 'No water supply for 3 days',
    loc: 'Kongba, Imphal East',
    date: 'Feb 21', status: 'open',     priority: 'high', votes: 88,
    color: '#3b82f6',
    pin: { x: 86, y: 44 },
  },
];

// Horizontal roads [top%, height px] and vertical roads [left%, width px]
const H_ROADS = [
  { top: 13,  h: 10, label: 'MG Road',         labelX: 1 },
  { top: 38,  h: 8,  label: 'Keishampat Rd',   labelX: 1 },
  { top: 62,  h: 10, label: 'Lamphelpat Rd',   labelX: 1 },
  { top: 82,  h: 7,  label: 'Paona Bazaar Rd', labelX: 1 },
];

const V_ROADS = [
  { left: 20,  w: 9  },
  { left: 45,  w: 10 },
  { left: 72,  w: 8  },
];

// City block rects [x%, y%, w%, h%]
const BLOCKS = [
  { x: 0,  y: 17, w: 18, h: 19 },
  { x: 22, y: 17, w: 21, h: 19 },
  { x: 47, y: 17, w: 23, h: 19 },
  { x: 74, y: 17, w: 26, h: 19 },
  { x: 0,  y: 42, w: 18, h: 18 },
  { x: 22, y: 42, w: 21, h: 18 },
  { x: 47, y: 42, w: 23, h: 18 },
  { x: 74, y: 42, w: 26, h: 18 },
  { x: 0,  y: 66, w: 18, h: 14 },
  { x: 22, y: 66, w: 21, h: 14 },
  { x: 47, y: 66, w: 23, h: 14 },
  { x: 74, y: 66, w: 26, h: 14 },
];

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const STATUS_FILTER_OPTIONS = ['All Statuses', 'Open', 'In Progress', 'Under Review', 'Resolved'];
const CATEGORY_OPTIONS      = ['All Categories', 'Potholes', 'Street Light', 'Garbage', 'Water', 'Fallen Tree'];

const STATUS_META = {
  open:     { pinCls: styles.pinOpen,     pulseCls: styles.pinPulseOpen,     badgeCls: styles.badgeOpen,     sCls: styles.sOpen,     label: 'Open'         },
  progress: { pinCls: styles.pinProgress, pulseCls: styles.pinPulseProgress, badgeCls: styles.badgeProgress, sCls: styles.sProgress, label: 'In Progress'  },
  resolved: { pinCls: styles.pinResolved, pulseCls: styles.pinPulseResolved, badgeCls: styles.badgeResolved, sCls: styles.sResolved, label: 'Resolved'     },
  review:   { pinCls: styles.pinReview,   pulseCls: styles.pinPulseReview,   badgeCls: styles.badgeReview,   sCls: styles.sReview,   label: 'Under Review' },
};

const PRIORITY_COLORS = { high: 'var(--danger)', med: 'var(--warn)', low: 'var(--accent3)' };
const PRIORITY_LABELS = { high: 'High',          med: 'Medium',      low: 'Low'            };

const LEGEND_ITEMS = [
  { color: 'var(--danger)',  label: 'Open'         },
  { color: 'var(--warn)',    label: 'In Progress'  },
  { color: 'var(--accent2)', label: 'Under Review' },
  { color: 'var(--accent3)', label: 'Resolved'     },
];

const STAT_COUNTS = (issues) => [
  { color: 'var(--danger)',  label: 'Open',        val: issues.filter(i => i.status === 'open').length     },
  { color: 'var(--warn)',    label: 'In Progress', val: issues.filter(i => i.status === 'progress').length },
  { color: 'var(--accent2)', label: 'Under Review',val: issues.filter(i => i.status === 'review').length   },
  { color: 'var(--accent3)', label: 'Resolved',    val: issues.filter(i => i.status === 'resolved').length },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Tooltip that floats above a pin */
function PinTooltip({ issue }) {
  const s = STATUS_META[issue.status] ?? STATUS_META.open;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipId}>{issue.id}</div>
      <div className={styles.tooltipTitle}>{issue.title}</div>
      <div className={styles.tooltipMeta}>
        <span>📍 {issue.loc}</span>
        <span>📅 {issue.date} · 👍 {issue.votes} votes</span>
      </div>
      <span className={`${styles.tooltipBadge} ${s.badgeCls}`}>{s.label}</span>
    </div>
  );
}

/** Status badge pill */
function StatusBadge({ status }) {
  const s = STATUS_META[status] ?? STATUS_META.open;
  return <span className={`${styles.statusBadge} ${s.sCls}`}>{s.label}</span>;
}

/** Issue card in the list below the map */
function IssueCard({ issue, active, onClick }) {
  return (
    <div
      className={`${styles.issueCard} ${active ? styles.issueCardActive : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div
        className={styles.issueThumb}
        style={{ background: `${issue.color}22` }}
      >
        {issue.icon}
      </div>
      <div className={styles.issueBody}>
        <div className={styles.issueTop}>
          <div>
            <div className={styles.issueId}>{issue.id}</div>
            <div className={styles.issueTitle}>{issue.title}</div>
          </div>
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
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
/**
 * MapView — interactive mock city map with issue pins, filters,
 * hover tooltips, active-pin highlighting and a synced issue list below.
 *
 * Props:
 *  - issues     {array}    optional override of the issue list
 *  - onNavigate {function} called with page key e.g. onNavigate('report')
 */
export default function MapView({
  issues      = ALL_ISSUES,
  onNavigate  = () => {},
}) {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [catFilter,    setCatFilter]    = useState('All Categories');
  const [hoveredId,    setHoveredId]    = useState(null);
  const [activeId,     setActiveId]     = useState(null);
  const [showResolved, setShowResolved] = useState(true);
  const cardRefs  = useRef({});
  const listRef   = useRef(null);

  // ── Filtering ─────────────────────────────
  const filtered = issues.filter((i) => {
    const statusMatch =
      statusFilter === 'All Statuses' ||
      STATUS_META[i.status]?.label === statusFilter;
    const catMatch =
      catFilter === 'All Categories' ||
      i.cat === catFilter;
    const resolvedMatch = showResolved || i.status !== 'resolved';
    return statusMatch && catMatch && resolvedMatch;
  });

  // ── Pin click: highlight card + scroll into view ──
  function handlePinClick(id) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  useEffect(() => {
    if (!activeId) return;
    const el = cardRefs.current[activeId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  // ── Stats ─────────────────────────────────
  const stats = STAT_COUNTS(filtered);

  // ── Render ────────────────────────────────
  return (
    <div className={styles.root}>
      <div className={styles.page}>

        {/* PAGE HEADER */}
        <div className={styles.pageHdr}>
          <div className={styles.titleBlock}>
            <div className={styles.pageTitle}>Issue Map</div>
            <div className={styles.pageSub}>Live civic issues near you</div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <select
              className={styles.filterSelect}
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              aria-label="Filter by category"
            >
              {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              {STATUS_FILTER_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>

            <button
              className={showResolved ? styles.btnGhost : styles.btnActive}
              onClick={() => setShowResolved((v) => !v)}
            >
              {showResolved ? '🙈 Hide Resolved' : '👁 Show Resolved'}
            </button>

            <button
              className={styles.btnPrimary}
              onClick={() => onNavigate('report')}
            >
              ＋ Report Issue
            </button>
          </div>
        </div>

        {/* STAT PILLS */}
        <div className={styles.statsStrip}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statPill}>
              <div className={styles.statPillDot} style={{ background: s.color }} />
              <span>{s.label}</span>
              <span className={styles.statPillVal}>{s.val}</span>
            </div>
          ))}
          <div className={styles.statPill}>
            <span>Total visible</span>
            <span className={styles.statPillVal}>{filtered.length}</span>
          </div>
        </div>

        {/* ── MAP ─────────────────────────── */}
        <div className={styles.mapWrap}>

          {/* Grid */}
          <div className={styles.mapGrid} />

          {/* Atmospheric glows */}
          <div className={`${styles.mapGlow} ${styles.mapGlow1}`} />
          <div className={`${styles.mapGlow} ${styles.mapGlow2}`} />

          {/* City blocks */}
          {BLOCKS.map((b, i) => (
            <div
              key={i}
              className={styles.block}
              style={{
                left: `${b.x}%`, top: `${b.y}%`,
                width: `${b.w}%`, height: `${b.h}%`,
              }}
            />
          ))}

          {/* Horizontal roads */}
          {H_ROADS.map((r, i) => (
            <div key={i}>
              <div
                className={styles.road}
                style={{ top: `${r.top}%`, left: 0, right: 0, height: r.h }}
              />
              <div
                className={styles.roadLabel}
                style={{ top: `calc(${r.top}% + 1px)`, left: `${r.labelX}%` }}
              >
                {r.label}
              </div>
            </div>
          ))}

          {/* Vertical roads */}
          {V_ROADS.map((r, i) => (
            <div
              key={i}
              className={styles.road}
              style={{ left: `${r.left}%`, top: 0, bottom: 0, width: r.w }}
            />
          ))}

          {/* Pins */}
          {filtered.map((issue) => {
            const s       = STATUS_META[issue.status] ?? STATUS_META.open;
            const hovered = hoveredId === issue.id;
            const active  = activeId  === issue.id;
            const pulse   = issue.status === 'open' || issue.status === 'review';

            return (
              <div
                key={issue.id}
                className={styles.pinWrap}
                style={{ left: `${issue.pin.x}%`, top: `${issue.pin.y}%` }}
                onMouseEnter={() => setHoveredId(issue.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handlePinClick(issue.id)}
                role="button"
                tabIndex={0}
                aria-label={`Issue ${issue.id}: ${issue.title}`}
                onKeyDown={(e) => e.key === 'Enter' && handlePinClick(issue.id)}
              >
                {/* Pulse ring for open/review issues */}
                {pulse && (
                  <div
                    className={`${styles.pinPulse} ${s.pulseCls}`}
                    style={{ opacity: active ? 1 : 0.6 }}
                  />
                )}

                {/* Pin body */}
                <div
                  className={`${styles.pin} ${s.pinCls}`}
                  style={{
                    outline: active ? '3px solid rgba(255,255,255,0.4)' : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  <span className={styles.pinInner}>{issue.icon}</span>
                </div>

                {/* Hover tooltip */}
                {hovered && <PinTooltip issue={issue} />}
              </div>
            );
          })}

          {/* Map controls (zoom +/−/reset) */}
          <div className={styles.mapControls}>
            <button className={styles.mapCtrlBtn} aria-label="Zoom in"  title="Zoom in">＋</button>
            <button className={styles.mapCtrlBtn} aria-label="Zoom out" title="Zoom out">−</button>
            <button
              className={styles.mapCtrlBtn}
              aria-label="Reset view"
              title="Reset"
              onClick={() => setActiveId(null)}
            >
              ⊙
            </button>
          </div>

          {/* Legend */}
          <div className={styles.mapLegend}>
            {LEGEND_ITEMS.map((l) => (
              <div key={l.label} className={styles.legendItem}>
                <div className={styles.legendDot} style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Location badge */}
          <div className={styles.locationBadge}>
            <div className={styles.locationDot} />
            Imphal, Manipur
          </div>

        </div>
        {/* ── END MAP ─────────────────────── */}

        {/* ISSUE LIST */}
        <div className={styles.sectionHdr}>
          <span className={styles.sectionTitle}>
            Nearby Issues
            {activeId && (
              <span style={{ color: 'var(--citizen)', marginLeft: '0.5rem', fontSize: '0.82rem' }}>
                · 1 selected
              </span>
            )}
          </span>
          <button
            className={styles.sectionLink}
            onClick={() => onNavigate('feed')}
          >
            View all →
          </button>
        </div>

        {filtered.length > 0 ? (
          <div className={styles.issueGrid} ref={listRef}>
            {filtered.map((issue) => (
              <div
                key={issue.id}
                ref={(el) => { cardRefs.current[issue.id] = el; }}
              >
                <IssueCard
                  issue={issue}
                  active={activeId === issue.id}
                  onClick={() => handlePinClick(issue.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🗺️</div>
            <div className={styles.emptyText}>No issues match the current filters.</div>
          </div>
        )}

      </div>
    </div>
  );
}