const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getAnalyticsFunnel(token, eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/analytics/funnel`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch funnel analytics');
  }
  return data;
}

export async function getAnalyticsExtended(token, eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/analytics/extended`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch extended analytics');
  }
  return data;
}

export async function getAnalyticsSummary(token, eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/analytics/summary`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch analytics summary');
  }
  return data;
}
