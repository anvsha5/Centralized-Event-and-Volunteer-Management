const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function createAnnouncement(token, eventId, announcementData) {
  const res = await fetch(`${API_BASE}/events/${eventId}/announcements`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(announcementData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send announcement');
  }
  return data;
}

export async function getAnnouncements(eventId, sessionId = '') {
  let url = `${API_BASE}/events/${eventId}/announcements`;
  if (sessionId) {
    url += `?sessionId=${encodeURIComponent(sessionId)}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch announcements');
  }
  return data;
}
