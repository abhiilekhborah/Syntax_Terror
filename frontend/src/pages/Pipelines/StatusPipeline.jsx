import { useState } from 'react';
import styles from './StatusPipeline.module.css';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

/**
 * Default 5-step pipeline used across the citizen portal.
 * Each step can be overridden by passing a `steps` prop.
 */
const DEFAULT_STEPS = [
  { key: 'submitted',  icon: '📋', label: 'Submitted',   },
  { key: 'verified',   icon: '✓',  label: 'Verified',    },
  { key: 'assigned',   icon: '⚙',  label: 'Assigned',    },
  { key: 'inprogress', icon: '🔨', label: 'In Progress', },
  { key: 'resolved',   icon: '✅', label: 'Resolved',    },
];

/**
 * Maps an issue's status string → the key of the ACTIVE pipeline step.
 * "done" means every step BEFORE that key; "active" is the key itself.
 */
const STATUS_TO_ACTIVE_STEP = {
  open:     'submitted',
  review:   'verified',
  progress: 'assigned',
  resolved: 'resolved',
};

const STATUS_META = {
  open:     { sCls: styles.sOpen,     label: 'Open',          accentColor: 'var(--danger)'  },
  progress: { sCls: styles.sProgress, label: 'In Progress',   accentColor: 'var(--warn)'    },
  resolved: { sCls: styles.sResolved, label: 'Resolved',      accentColor: 'var(--accent3)' },
  review:   { sCls: styles.sReview,   label: 'Under Review',  accentColor: 'var(--accent2)' },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Derive a per-step state string from the active step key.
 *   'done'   — step is before the active one
 *   'active' — this is the current step
 *   ''       — step is still pending
 *   'resolved' — special: all steps done when status === 'resolved'
 */
function deriveStepState(stepKey, activeKey, steps, isAllResolved) {
  if (isAllResolved) return 'resolved';
  const activeIdx = steps.findIndex((s) => s.key === activeKey);
  const thisIdx   = steps.findIndex((s) => s.key === stepKey);
  if (thisIdx < activeIdx)  return 'done';
  if (thisIdx === activeIdx) return 'active';
  return '';
}

/** Maps a step state to its connector line class */
function lineClass(prevState) {
  if (prevState === 'done' || prevState === 'resolved') return styles.lineDone;
  if (prevState === 'active') return styles.lineActive;
  if (prevState === 'error')  return styles.lineError;
  if (prevState === 'skipped') return styles.lineSkipped;
  return '';
}

/** Status badge pill */
function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.open;
  return (
    <span className={`${styles.statusBadge} ${meta.sCls}`}>
      {meta.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// CORE PIPELINE TRACK
// ─────────────────────────────────────────────

/**
 * PipelineTrack — renders the row of circles + connecting lines.
 * Used internally by every variant.
 *
 * Props:
 *  steps        {array}   array of { key, icon, label, subLabel?, tooltip? }
 *  activeKey    {string}  key of the currently active step
 *  isResolved   {bool}    true when all steps are complete
 *  size         {'sm'|'md'|'lg'}
 *  showTooltips {bool}
 */
function PipelineTrack({ steps, activeKey, isResolved, size = 'md', showTooltips = true }) {
  const [hoveredKey, setHoveredKey] = useState(null);

  const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size] ?? styles.sizeMd;

  return (
    <div className={`${styles.pipeline} ${sizeClass}`}>
      {steps.map((step, i) => {
        const state     = deriveStepState(step.key, activeKey, steps, isResolved);
        const stepCls   = state === 'done'     ? styles.done
                        : state === 'active'   ? styles.active
                        : state === 'resolved' ? styles.resolved
                        : state === 'error'    ? styles.error
                        : state === 'skipped'  ? styles.skipped
                        : '';
        const prevState = i > 0
          ? deriveStepState(steps[i - 1].key, activeKey, steps, isResolved)
          : null;

        return (
          <div key={step.key} style={{ display: 'contents' }}>
            {/* Connector line before each step except the first */}
            {i > 0 && (
              <div className={`${styles.line} ${lineClass(prevState)}`} />
            )}

            {/* Step */}
            <div
              className={`${styles.step} ${stepCls}`}
              onMouseEnter={() => setHoveredKey(step.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <div className={styles.tooltipWrap}>
                {/* Circle */}
                <div className={styles.circle}>
                  {(state === 'done' || state === 'resolved')
                    ? '✓'
                    : step.icon}

                  {/* Pulse ring on active */}
                  {state === 'active' && (
                    <div className={styles.pulseRing} />
                  )}
                </div>

                {/* Hover tooltip */}
                {showTooltips && hoveredKey === step.key && step.tooltip && (
                  <div className={styles.tooltip}>
                    <div className={styles.tooltipTitle}>{step.tooltip.title ?? step.label}</div>
                    {step.tooltip.time && (
                      <div className={styles.tooltipTime}>🕐 {step.tooltip.time}</div>
                    )}
                    {step.tooltip.note && (
                      <div className={styles.tooltipNote}>{step.tooltip.note}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Label */}
              <div className={styles.label}>{step.label}</div>

              {/* Optional sub-label (e.g. date) */}
              {step.subLabel && (
                <div className={styles.subLabel}>{step.subLabel}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// VARIANT 1 — Standalone Card
// ─────────────────────────────────────────────

/**
 * StatusPipelineCard — full card with header (title + badge),
 * pipeline track, ETA/last-update footer, and optional progress bar.
 *
 * Props:
 *  issueId      {string}   e.g. 'CVP-1042'
 *  issueTitle   {string}   e.g. 'Deep pothole near bus stop'
 *  status       {string}   'open' | 'review' | 'progress' | 'resolved'
 *  steps        {array}    optional custom step array
 *  lastUpdate   {string}   footer update text
 *  eta          {string}   optional ETA badge text e.g. 'ETA 2 days'
 *  size         {'sm'|'md'|'lg'}
 *  showProgress {bool}     show linear progress bar below pipeline
 *  showTooltips {bool}
 */
export function StatusPipelineCard({
  issueId    = 'CVP-0000',
  issueTitle = 'Civic issue',
  status     = 'open',
  steps      = DEFAULT_STEPS,
  lastUpdate = '',
  eta        = null,
  size       = 'md',
  showProgress = true,
  showTooltips = true,
}) {
  const activeKey  = STATUS_TO_ACTIVE_STEP[status] ?? 'submitted';
  const isResolved = status === 'resolved';
  const meta       = STATUS_META[status] ?? STATUS_META.open;

  // Calculate progress % for the optional bar
  const activeIdx   = steps.findIndex((s) => s.key === activeKey);
  const progressPct = isResolved
    ? 100
    : Math.round(((isResolved ? steps.length : activeIdx) / steps.length) * 100);

  const progressFillCls =
    progressPct === 100     ? ''                       :
    progressPct >= 60       ? styles.progressFillWarn  :
    progressPct < 30        ? styles.progressFillDanger :
    styles.progressFillCitizen;

  return (
    <div className={`${styles.root} ${styles.card}`}>
      {/* Top accent bar */}
      <div
        className={styles.cardAccent}
        style={{ background: meta.accentColor }}
      />

      {/* Header */}
      <div className={styles.cardHeader}>
        <div style={{ minWidth: 0 }}>
          <div className={styles.cardId}>{issueId}</div>
          <div className={styles.cardTitle}>{issueTitle}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Pipeline track */}
      <PipelineTrack
        steps={steps}
        activeKey={activeKey}
        isResolved={isResolved}
        size={size}
        showTooltips={showTooltips}
      />

      {/* Optional linear progress bar */}
      {showProgress && (
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${progressFillCls}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Footer */}
      {(lastUpdate || eta) && (
        <div className={styles.cardFooter}>
          {lastUpdate && (
            <span className={styles.etaText}>
              📌 {lastUpdate}
            </span>
          )}
          {eta && (
            <span className={styles.etaBadge}>⏱ {eta}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// VARIANT 2 — Inline (no card frame)
// ─────────────────────────────────────────────

/**
 * StatusPipelineInline — bare pipeline track with an optional
 * ETA line below. No card border. Drop directly into any layout.
 *
 * Props:
 *  status       {string}
 *  steps        {array}
 *  lastUpdate   {string}
 *  eta          {string}
 *  size         {'sm'|'md'|'lg'}
 *  showTooltips {bool}
 */
export function StatusPipelineInline({
  status     = 'open',
  steps      = DEFAULT_STEPS,
  lastUpdate = '',
  eta        = null,
  size       = 'md',
  showTooltips = true,
}) {
  const activeKey  = STATUS_TO_ACTIVE_STEP[status] ?? 'submitted';
  const isResolved = status === 'resolved';

  return (
    <div className={`${styles.root} ${styles.inline}`}>
      <PipelineTrack
        steps={steps}
        activeKey={activeKey}
        isResolved={isResolved}
        size={size}
        showTooltips={showTooltips}
      />
      {(lastUpdate || eta) && (
        <div className={styles.cardFooter}>
          {lastUpdate && (
            <span className={styles.etaText}>📌 {lastUpdate}</span>
          )}
          {eta && (
            <span className={styles.etaBadge}>⏱ {eta}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// VARIANT 3 — Mini Badge
// ─────────────────────────────────────────────

/**
 * StatusPipelineMini — a compact single-line pill showing the
 * current step name + a coloured dot. Ideal for table rows or
 * tight spaces where the full pipeline track won't fit.
 *
 * Props:
 *  status  {string}
 *  steps   {array}
 */
export function StatusPipelineMini({
  status = 'open',
  steps  = DEFAULT_STEPS,
}) {
  const activeKey  = STATUS_TO_ACTIVE_STEP[status] ?? 'submitted';
  const isResolved = status === 'resolved';
  const meta       = STATUS_META[status] ?? STATUS_META.open;
  const activeStep = steps.find((s) => s.key === activeKey) ?? steps[0];
  const activeIdx  = steps.findIndex((s) => s.key === activeKey);
  const stepNum    = isResolved ? steps.length : activeIdx + 1;

  return (
    <div className={`${styles.root} ${styles.miniBadge}`}>
      <div
        className={`${styles.miniBadgeDot} ${!isResolved && status !== 'resolved' ? styles.miniActive : ''}`}
        style={{ background: meta.accentColor }}
      />
      <span style={{ color: meta.accentColor, fontWeight: 600, fontSize: '0.78rem', fontFamily: "'Syne', sans-serif" }}>
        {activeStep.label}
      </span>
      <span style={{ color: 'var(--text3)', fontSize: '0.7rem' }}>
        {stepNum}/{steps.length}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// DEFAULT EXPORT — most commonly used variant
// ─────────────────────────────────────────────

/**
 * StatusPipeline (default export) — the full standalone card variant.
 *
 * Quick-start usage:
 *
 *   import StatusPipeline from './StatusPipeline';
 *
 *   <StatusPipeline
 *     issueId="CVP-1042"
 *     issueTitle="Deep pothole near bus stop"
 *     status="progress"
 *     lastUpdate="Field team assigned — Dept. of Roads"
 *     eta="ETA 2 days"
 *   />
 *
 * Named exports for other variants:
 *
 *   import { StatusPipelineInline, StatusPipelineMini } from './StatusPipeline';
 *
 * Customising steps with tooltip data:
 *
 *   const MY_STEPS = [
 *     { key: 'submitted', icon: '📋', label: 'Submitted',
 *       tooltip: { title: 'Report submitted', time: 'Mar 10, 9:14 AM',
 *                  note: 'Your report has been received.' } },
 *     { key: 'verified',  icon: '✓',  label: 'Verified',
 *       tooltip: { title: 'Verified by moderator', time: 'Mar 10, 11:30 AM' } },
 *     ...
 *   ];
 *
 *   <StatusPipeline steps={MY_STEPS} status="progress" ... />
 */
export default StatusPipelineCard;
export { DEFAULT_STEPS, STATUS_TO_ACTIVE_STEP };