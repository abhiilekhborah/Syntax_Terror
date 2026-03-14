import { useState, useEffect, useRef } from 'react';
import styles from './StatCard.module.css';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

/**
 * Maps a delta string that starts with "↑" or "↓" to an explicit direction.
 * Falls back to 'neutral' when no arrow is present.
 */
function parseDeltaDirection(delta) {
  if (!delta) return 'neutral';
  if (delta.startsWith('↑')) return 'up';
  if (delta.startsWith('↓')) return 'down';
  return 'neutral';
}

// ─────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────

/**
 * Counts up from 0 to `target` over `duration` ms.
 * Only runs when the card first becomes visible (IntersectionObserver).
 * Returns the current display string.
 *
 * Handles values like "1,284", "2.4d", "58%" — keeps the non-numeric
 * suffix/prefix intact and only animates the leading numeric part.
 */
function useCountUp(raw, duration = 900) {
  const [display, setDisplay] = useState(raw);
  const frameRef  = useRef(null);
  const startRef  = useRef(null);
  const triggered = useRef(false);
  const nodeRef   = useRef(null);

  // Parse: split "1,284" → 1284, "2.4d" → 2.4, suffix "d", etc.
  const parsed = String(raw ?? '');
  const match  = parsed.match(/^([^\d]*)(\d[\d,.]*)(.*)$/);
  const prefix = match ? match[1] : '';
  const numStr = match ? match[2].replace(/,/g, '') : null;
  const suffix = match ? match[3] : '';
  const target = numStr !== null ? parseFloat(numStr) : null;
  const isInt  = numStr !== null && !numStr.includes('.');

  function formatNum(n) {
    if (isInt) {
      // Re-add comma separators for large integers
      return Math.round(n).toLocaleString('en-IN');
    }
    // Keep same decimal places as original
    const decimals = (numStr?.split('.')[1] ?? '').length;
    return n.toFixed(decimals);
  }

  function startAnimation() {
    if (triggered.current || target === null) return;
    triggered.current = true;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed  = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;
      setDisplay(`${prefix}${formatNum(current)}${suffix}`);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || target === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) startAnimation(); },
      { threshold: 0.3 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  return { display, nodeRef };
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

/**
 * StatCard — a single metric tile for dashboards.
 *
 * Props:
 *  label        {string}   short metric name — e.g. "Total Issues"
 *  value        {string|number}
 *               The value to display. Supports:
 *               - plain numbers        → "342"
 *               - comma-formatted ints → "1,284"
 *               - decimal + suffix     → "2.4d", "1.8d"
 *               - percentage suffix    → "58%"
 *  delta        {string}   trend text — prefix ↑/↓ drives colour
 *                          e.g. "↑ 12% this month", "↓ Faster this week"
 *                          Neutral (no arrow) renders in --text2
 *  valueColor   {string}   optional CSS colour / var() for the value
 *                          e.g. "var(--danger)", "#10b981"
 *                          When omitted the default --text colour is used.
 *  accentColor  {string}   colour for the decorative orb + top stripe
 *                          Defaults to --citizen (purple) when omitted.
 *  icon         {string}   optional emoji shown inside the orb
 *  animateCount {bool}     whether to run the count-up animation (default true)
 *  className    {string}   extra class forwarded to the root element
 *  onClick      {function} optional click handler
 *
 * Usage:
 *   <StatCard
 *     label="Total Issues"
 *     value="1,284"
 *     delta="↑ 12% this month"
 *   />
 *   <StatCard
 *     label="Open"
 *     value="342"
 *     delta="↑ 8 new today"
 *     valueColor="var(--danger)"
 *     accentColor="var(--danger)"
 *     icon="🔴"
 *   />
 */
export default function StatCard({
  label        = '',
  value        = '',
  delta        = '',
  valueColor,
  accentColor,
  icon,
  animateCount = true,
  className    = '',
  onClick,
}) {
  const direction = parseDeltaDirection(delta);

  const { display, nodeRef } = useCountUp(
    animateCount ? value : null,
    900
  );

  const displayValue = animateCount ? display : value;

  const deltaClass = {
    up:      styles.deltaUp,
    down:    styles.deltaDown,
    neutral: styles.deltaNeutral,
  }[direction];

  const deltaIcon = direction === 'up'
    ? null   // arrow already embedded in `delta` string
    : direction === 'down'
    ? null
    : null;

  return (
    <div
      ref={nodeRef}
      className={[
        styles.card,
        onClick ? styles.clickable : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ '--accent-color': accentColor || 'var(--citizen)' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
    >
      {/* ── Decorative top stripe ── */}
      <div className={styles.stripe} aria-hidden="true" />

      {/* ── Decorative background orb ── */}
      <div className={styles.orb} aria-hidden="true" />

      {/* ── Optional icon inside orb ── */}
      {icon && (
        <div className={styles.iconWrap} aria-hidden="true">
          {icon}
        </div>
      )}

      {/* ── Label ── */}
      <div className={styles.label}>{label}</div>

      {/* ── Value ── */}
      <div
        className={styles.value}
        style={valueColor ? { color: valueColor } : undefined}
        aria-label={`${label}: ${value}`}
      >
        {displayValue}
      </div>

      {/* ── Delta / trend ── */}
      {delta && (
        <div className={`${styles.delta} ${deltaClass}`}>
          {deltaIcon && <span aria-hidden="true">{deltaIcon}</span>}
          {delta}
        </div>
      )}
    </div>
  );
}