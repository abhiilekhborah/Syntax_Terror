import styles from './StatusBadge.module.css';

// ─────────────────────────────────────────────
// CONFIG MAP
// ─────────────────────────────────────────────

/**
 * Master map of every status the app uses.
 *
 * key   — canonical status key (matches issue.status in mockData.js)
 * label — human-readable display text
 * icon  — emoji used in 'pill' and 'dot' variants
 * mod   — CSS module identifier for colour theming
 *
 * Four statuses come directly from the HTML's statusBadge() function:
 *   open | progress | resolved | review
 *
 * 'unknown' is a safe fallback for any future / unexpected value.
 */
const STATUS_CONFIG = {
  open: {
    label: 'Open',
    icon:  '🔴',
    mod:   'open',
  },
  progress: {
    label: 'In Progress',
    icon:  '🟡',
    mod:   'progress',
  },
  resolved: {
    label: 'Resolved',
    icon:  '🟢',
    mod:   'resolved',
  },
  review: {
    label: 'Under Review',
    icon:  '🔵',
    mod:   'review',
  },
  unknown: {
    label: 'Unknown',
    icon:  '⚪',
    mod:   'unknown',
  },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Resolve a config entry, falling back to 'unknown' for any bad input. */
function resolveConfig(status) {
  if (!status) return STATUS_CONFIG.unknown;
  const key = String(status).toLowerCase().trim();
  return STATUS_CONFIG[key] ?? STATUS_CONFIG.unknown;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

/**
 * StatusBadge — a compact, coloured label that communicates issue status.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Statuses  │  'open' | 'progress' | 'resolved' | 'review'          │
 * │  Sizes     │  'default' | 'sm' | 'lg'                              │
 * │  Variants  │  'filled' (default) | 'outline' | 'pill' | 'dot'      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Props:
 *  status    {string}   one of the four status keys — case-insensitive.
 *                       Unknown values render a neutral 'Unknown' badge.
 *  size      {string}   'sm' | 'default' (default) | 'lg'
 *  variant   {string}   'filled'  — solid tinted background    (default)
 *                       'outline' — transparent bg, tinted border
 *                       'pill'    — rounded pill with emoji icon prefix
 *                       'dot'     — coloured dot + label, no bg box
 *  label     {string}   override the default label text
 *  showIcon  {bool}     show the emoji prefix
 *                       (defaults true for 'pill' and 'dot', false otherwise)
 *  className {string}   extra class forwarded to the root element
 *  onClick   {function} makes the badge interactive (adds button semantics)
 *
 * Examples:
 *   <StatusBadge status="open" />
 *   <StatusBadge status="progress" size="lg" variant="outline" />
 *   <StatusBadge status="resolved" variant="pill" />
 *   <StatusBadge status="review"   variant="dot" />
 *   <StatusBadge status="open"     label="Pending" showIcon />
 */
export default function StatusBadge({
  status    = 'unknown',
  size      = 'default',
  variant   = 'filled',
  label,
  showIcon,
  className = '',
  onClick,
}) {
  const config = resolveConfig(status);

  // Icon visibility:
  //   'pill' and 'dot' variants show it by default;
  //   all others hide it unless the caller explicitly passes showIcon.
  const shouldShowIcon = showIcon ?? (variant === 'pill' || variant === 'dot');

  const displayLabel = label ?? config.label;

  const cls = [
    styles.badge,
    styles[`status-${config.mod}`],
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    onClick ? styles.interactive : '',
    className,
  ].filter(Boolean).join(' ');

  const inner = (
    <>
      {/* Dot indicator — only for 'dot' variant */}
      {shouldShowIcon && variant === 'dot' && (
        <span className={styles.dotIndicator} aria-hidden="true" />
      )}

      {/* Emoji icon — only for 'pill' variant */}
      {shouldShowIcon && variant === 'pill' && (
        <span className={styles.pillIcon} aria-hidden="true">
          {config.icon}
        </span>
      )}

      <span className={styles.labelText}>{displayLabel}</span>
    </>
  );

  // Render as <button> when interactive for proper keyboard / a11y support
  if (onClick) {
    return (
      <button
        type="button"
        className={cls}
        onClick={onClick}
        aria-label={`Status: ${displayLabel}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <span
      className={cls}
      aria-label={`Status: ${displayLabel}`}
    >
      {inner}
    </span>
  );
}

// ─────────────────────────────────────────────
// NAMED CONVENIENCE EXPORTS
// ─────────────────────────────────────────────
// Lets sibling components import pre-bound badges without
// needing to remember the status key strings:
//
//   import { ResolvedBadge } from './StatusBadge';
//   <ResolvedBadge size="sm" />

export const OpenBadge        = (props) => <StatusBadge status="open"     {...props} />;
export const InProgressBadge  = (props) => <StatusBadge status="progress" {...props} />;
export const ResolvedBadge    = (props) => <StatusBadge status="resolved" {...props} />;
export const UnderReviewBadge = (props) => <StatusBadge status="review"   {...props} />;

// Export the config map so IssueCard, StatusPipeline, etc. can
// read labels / icons without duplicating the table.
export { STATUS_CONFIG };