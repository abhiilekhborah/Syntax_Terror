import { forwardRef } from 'react';
import styles from './Button.module.css';

// ─────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────

/**
 * Button — the single interactive control primitive for NagarSetu.
 *
 * Covers every button appearance found across the portal:
 *
 *  Variants  (visual style)
 *  ──────────────────────────────────────────────
 *  "primary"   Solid orange fill  (#f97316 --accent)
 *              Used for primary CTA actions:
 *                "＋ Report Issue", "Submit Report",
 *                "Update & Notify Citizen", "＋ Add Member",
 *                "🔄 Update Status", "Assign →", "＋ Add Issue"
 *
 *  "ghost"     Dark surface fill with border  (--surface2 / --border)
 *              Used for secondary / utility actions:
 *                "Save Draft", "Export CSV", "Mark all read",
 *                "📷 Upload Photo", "💬 Add Note", "Assign" (table)
 *
 *  Sizes
 *  ──────────────────────────────────────────────
 *  "default"   .6rem 1.25rem padding, .875rem font  — page headers, form footers
 *  "sm"        .35rem .8rem padding,  .78rem font   — task-action rows, table cells,
 *                                                      toolbar buttons (Export CSV, etc.)
 *
 *  States
 *  ──────────────────────────────────────────────
 *  loading     Shows a spinner and replaces children with loadingText.
 *              Automatically sets disabled + aria-busy.
 *  disabled    Reduces opacity, blocks pointer events, sets aria-disabled.
 *  fullWidth   Stretches to fill its container (display: flex with width: 100%).
 *
 *  Icon helpers
 *  ──────────────────────────────────────────────
 *  iconLeft    Node rendered before the label  (emoji, SVG, or any element)
 *  iconRight   Node rendered after  the label
 *              The HTML prototype uses emoji characters inline inside the
 *              button text — pass them as iconLeft/iconRight or embed them
 *              directly in `children`, both work fine.
 *
 *  Polymorphism
 *  ──────────────────────────────────────────────
 *  as          Render as a different element — e.g. as="a" for link-styled
 *              buttons, as={Link} for React Router. Defaults to "button".
 *              All button-specific props (type, disabled) are only forwarded
 *              when rendering as a native <button>.
 *
 * Props:
 *  variant     {"primary" | "ghost"}          default "primary"
 *  size        {"default" | "sm"}             default "default"
 *  loading     {bool}                         default false
 *  loadingText {string}                       default "Loading…"
 *  disabled    {bool}                         default false
 *  fullWidth   {bool}                         default false
 *  iconLeft    {node}
 *  iconRight   {node}
 *  as          {string | component}           default "button"
 *  type        {"button" | "submit" | "reset"} default "button"
 *  className   {string}
 *  children    {node}
 *  …rest       forwarded to the root element
 *
 * Usage:
 *   // Primary CTA
 *   <Button onClick={handleSubmit}>＋ Report Issue</Button>
 *
 *   // Ghost secondary
 *   <Button variant="ghost">Save Draft</Button>
 *
 *   // Small toolbar button
 *   <Button variant="ghost" size="sm">Export CSV</Button>
 *
 *   // Small primary in task row
 *   <Button size="sm">🔄 Update Status</Button>
 *
 *   // Loading state
 *   <Button loading loadingText="Submitting…">Submit Report</Button>
 *
 *   // Icon helpers
 *   <Button iconLeft="＋">Add Member</Button>
 *   <Button variant="ghost" iconRight="→">Assign</Button>
 *
 *   // Full-width form button
 *   <Button fullWidth type="submit">Submit Report</Button>
 *
 *   // Rendered as an anchor
 *   <Button as="a" href="/report" variant="primary">Report Issue</Button>
 */
const Button = forwardRef(function Button(
  {
    variant     = 'primary',
    size        = 'default',
    loading     = false,
    loadingText = 'Loading…',
    disabled    = false,
    fullWidth   = false,
    iconLeft,
    iconRight,
    as: Tag     = 'button',
    type        = 'button',
    className   = '',
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  // Only pass button-native props when rendering as a real <button>
  const nativeButtonProps =
    Tag === 'button'
      ? { type, disabled: isDisabled }
      : {};

  const rootClass = [
    styles.btn,
    styles[variant],
    size !== 'default' ? styles[size] : '',
    fullWidth          ? styles.fullWidth : '',
    isDisabled         ? styles.disabled  : '',
    loading            ? styles.loading   : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref}
      className={rootClass}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      {...nativeButtonProps}
      {...rest}
    >
      {/* ── Spinner (loading state) ── */}
      {loading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}

      {/* ── Left icon ── */}
      {!loading && iconLeft && (
        <span className={styles.iconLeft} aria-hidden="true">
          {iconLeft}
        </span>
      )}

      {/* ── Label ── */}
      <span className={styles.label}>
        {loading ? loadingText : children}
      </span>

      {/* ── Right icon ── */}
      {!loading && iconRight && (
        <span className={styles.iconRight} aria-hidden="true">
          {iconRight}
        </span>
      )}
    </Tag>
  );
});

export default Button;