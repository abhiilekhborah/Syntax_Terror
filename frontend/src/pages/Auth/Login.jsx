import { useState } from 'react';
import styles from './Login.module.css';

export default function Login({ onLoginSuccess, onNavigateRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate API call — replace with real auth logic
    try {
      await new Promise((res) => setTimeout(res, 1200));
      // On success:
      if (onLoginSuccess) onLoginSuccess({ email, role: 'citizen' });
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            Citizen Portal
          </div>

          {/* Title */}
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Sign in to report issues, track progress and engage with your community.
          </p>

          {/* Error */}
          {error && (
            <div className={styles.errorMsg}>
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-email">
                Email Address
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  id="login-email"
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-password">
                Password
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  id="login-password"
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
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
            </div>

            {/* Remember / Forgot */}
            <div className={styles.rowBetween}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className={styles.forgotLink}>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Signing in…
                </>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <span className={styles.dividerText}>New to CivicPulse?</span>
            <div className={styles.dividerLine} />
          </div>

          {/* Footer */}
          <p className={styles.footer}>
            Don&apos;t have an account?{' '}
            <a
              href="#"
              className={styles.link}
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateRegister) onNavigateRegister();
              }}
            >
              Create one free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}