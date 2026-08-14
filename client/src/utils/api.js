const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  const geminiKey = localStorage.getItem('synhub_gemini_key');

  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  if (geminiKey) {
    defaultHeaders['x-gemini-key'] = geminiKey.trim();
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! Status: ${response.status}`);
  }

  return data;
}

export function formatDate(dateString) {
  if (!dateString) return 'No due date';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago (Overdue)`;
  if (diffDays > 1 && diffDays <= 7) {
    return target.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
