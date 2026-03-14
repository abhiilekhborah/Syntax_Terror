const API = 'http://localhost:3000/api';

const TOKEN_KEY = 'nagarsatu_token';
const USER_KEY = 'nagarsatu_user';

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string, role: string }} payload
 * @returns {Promise<{ token: string, user: { id, name, email, role } }>}
 */
export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || 'Registration failed.';
    throw new Error(msg);
  }
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: { id, name, email, role } }>}
 */
export async function loginUser({ email, password }) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || 'Invalid credentials. Please try again.';
    throw new Error(msg);
  }
  if (data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  if (data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export { TOKEN_KEY, USER_KEY };
