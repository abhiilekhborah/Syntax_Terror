import { useState } from 'react';
import styles from './Register.module.css';
import { registerUser } from '../../api/auth';

/* ── Password strength helper ── */
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const keys = ['', 'strengthWeak', 'strengthFair', 'strengthGood', 'strengthStrong'];
  return { level: score, label: labels[score], key: keys[score] };
}

export default function Register({ onRegisterSuccess, onNavigateLogin }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    zone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Valid email required';
    if (!form.password || form.password.length < 8)
      errs.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) errs.terms = 'You must agree to the terms';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      if (errs.terms) setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const { user } = await registerUser({
        name,
        email: form.email.trim(),
        password: form.password,
        role: 'citizen',
      });
      setSuccess(true);
      if (onRegisterSuccess) onRegisterSuccess(user);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className={styles.root}>
      <div className={styles.page}>
        {/* Background */}
        <div className={styles.gridBg} />
        <div className={`${styles.orb} ${styles.orbOrange}`} />
        <div className={`${styles.orb} ${styles.orbBlue}`} />
        <div className={`${styles.orb} ${styles.orbPurple}`} />

        {/* Card */}
        <div className={styles.card}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandIcon}>🏙️</div>
            <span className={styles.brandName}>
              Civic<span>Pulse</span>
            </span>
          </div>

          {/* Role badge */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Citizen Registration
          </div>

          {/* Title */}
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>
            Join CivicPulse and start reporting issues in your community today.
          </p>

          {/* Success banner */}
          {success && (
            <div className={styles.successMsg}>
              <span>✅</span>
              Account created! Redirecting to your portal…
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className={styles.errorMsg}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGrid}>

              {/* First Name */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="reg-firstName">
                  First Name
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>👤</span>
                  <input
                    id="reg-firstName"
                    className={`${styles.input} ${fieldErrors.firstName ? styles.inputError : ''}`}
                    type="text"
                    placeholder="Arjun"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                {fieldErrors.firstName && (
                  <span className={styles.fieldError}>{fieldErrors.firstName}</span>
                )}
              </div>

              {/* Last Name */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="reg-lastName">
                  Last Name
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>👤</span>
                  <input
                    id="reg-lastName"
                    className={`${styles.input} ${fieldErrors.lastName ? styles.inputError : ''}`}
                    type="text"
                    placeholder="Sharma"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
                {fieldErrors.lastName && (
                  <span className={styles.fieldError}>{fieldErrors.lastName}</span>
                )}
              </div>

              {/* Email */}
              <div className={`${styles.field} ${styles.fullSpan}`}>
                <label className={styles.label} htmlFor="reg-email">
                  Email Address
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input
                    id="reg-email"
                    className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <span className={styles.fieldError}>{fieldErrors.email}</span>
                )}
              </div>

              {/* Phone */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="reg-phone">
                  Phone <span style={{ textTransform: 'none', opacity: 0.6 }}>(optional)</span>
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>📱</span>
                  <input
                    id="reg-phone"
                    className={styles.input}
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Zone / Ward */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="reg-zone">
                  Zone / Ward
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>📍</span>
                  <input
                    id="reg-zone"
                    className={styles.input}
                    type="text"
                    placeholder="e.g. Zone A, Ward 12"
                    value={form.zone}
                    onChange={(e) => update('zone', e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className={`${styles.field} ${styles.fullSpan}`}>
                <label className={styles.label} htmlFor="reg-password">
                  Password
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    id="reg-password"
                    className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength meter */}
                {form.password && (
                  <div className={strength.key ? styles[strength.key] : ''}>
                    <div className={styles.strengthBar}>
                      {[1, 2, 3, 4].map((seg) => (
                        <div key={seg} className={styles.strengthSegment} />
                      ))}
                    </div>
                    <div className={styles.strengthLabel}>{strength.label}</div>
                  </div>
                )}
                {fieldErrors.password && (
                  <span className={styles.fieldError}>{fieldErrors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className={`${styles.field} ${styles.fullSpan}`}>
                <label className={styles.label} htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    id="reg-confirm"
                    className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            {/* Terms */}
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (fieldErrors.terms)
                    setFieldErrors((prev) => ({ ...prev, terms: '' }));
                }}
              />
              I agree to the{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Creating account…
                </>
              ) : (
                <>Create Citizen Account →</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>Already a member?</span>
            <div className={styles.dividerLine} />
          </div>

          {/* Footer */}
          <p className={styles.footer}>
            Have an account?{' '}
            <a
              href="#"
              className={styles.link}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateLogin) onNavigateLogin();
              }}
            >
              Sign in instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}