const API = 'http://localhost:3000/api';
const TOKEN_KEY = 'nagarsatu_token';

function getAuthHeader() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Submit a new issue (multipart/form-data).
 * @param {FormData} formData - Must include: title, description, category, location (JSON string), priority; optional: image
 * @returns {Promise<Object>} The saved Issue document
 */
export async function submitIssue(formData) {
  const headers = getAuthHeader();
  const res = await fetch(`${API}/issues`, {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || 'Failed to submit report.';
    throw new Error(msg);
  }
  return data;
}

/**
 * Fetch all issues for the current user (requires auth).
 * @returns {Promise<Array>} Array of Issue documents
 */
export async function getMyIssues() {
  const res = await fetch(`${API}/issues`, {
    method: 'GET',
    headers: getAuthHeader(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || 'Failed to load issues.';
    throw new Error(msg);
  }
  return Array.isArray(data) ? data : [];
}
