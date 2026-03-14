import { useState } from 'react';
import styles from './Register.module.css';

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
    name: '',
    email: '',
    password: '',
    role: 'citizen',
  });
  const [showPassword, setShowPassword] = useState(false);
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
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Valid email required';
    if (!form.password || form.password.length < 6)
      errs.password = 'At least 6 characters';
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
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (onRegisterSuccess) onRegisterSuccess(data.user);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection to server failed. Please ensure the backend is running.');
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
              Nagar<span>Setu</span>
            </span>
          </div>

          {/* Role badge */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Join the community
          </div>

          {/* Title */}
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>
            Join NagarSetu and start reporting issues in your community today.
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

              {/* Full Name */}
              <div className={`${styles.field} ${styles.fullSpan}`}>
                <label className={styles.label} htmlFor="reg-name">
                  Full Name
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>👤</span>
                  <input
                    id="reg-name"
                    className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
                    type="text"
                    placeholder="Arjun Sharma"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.name && (
                  <span className={styles.fieldError}>{fieldErrors.name}</span>
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
                    placeholder="Min. 6 characters"
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
                {form.password && (strength.key) && (
                  <div className={styles[strength.key]}>
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

              {/* Role */}
              <div className={`${styles.field} ${styles.fullSpan}`}>
                <label className={styles.label} htmlFor="reg-role">
                  Portal Access
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔑</span>
                  <select
                    id="reg-role"
                    className={styles.input}
                    value={form.role}
                    onChange={(e) => update('role', e.target.value)}
                    style={{ paddingLeft: '2.5rem', appearance: 'none' }}
                  >
                    <option value="citizen">Citizen</option>
                    <option value="authority">Field Authority</option>
                    <option value="admin">City Admin</option>
                  </select>
                </div>
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
                <>Create Account →</>
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