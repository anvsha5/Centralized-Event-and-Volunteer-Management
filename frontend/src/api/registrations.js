const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function registerForEvent(eventId, payload) {
  const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

export async function getRegistration(id) {
  const res = await fetch(`${API_BASE}/registrations/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch ticket');
  }
  return data;
}

export async function cancelRegistration(id) {
  const res = await fetch(`${API_BASE}/registrations/${id}/cancel`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to cancel registration');
  }
  return data;
}
