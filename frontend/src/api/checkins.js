const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function postCheckin(token, { qrToken, registrationId, eventId, type = 'checkin' }) {
  const res = await fetch(`${API_BASE}/checkins`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ qrToken, registrationId, eventId, type }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Check-in failed');
  }
  return data;
}

export async function getLiveCheckins(token, eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/checkins/live`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch live checkins');
  }
  return data;
}

export async function searchRegistrations(token, eventId, query) {
  const params = new URLSearchParams();
  if (eventId) params.append('eventId', eventId);
  if (query) params.append('query', query);

  const res = await fetch(`${API_BASE}/registrations?${params.toString()}`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to search registrations');
  }
  return data;
}
