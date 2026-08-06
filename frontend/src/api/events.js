const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listEvents(token, organizerId = 'me') {
  const url = organizerId ? `${API_BASE}/events?organizerId=${encodeURIComponent(organizerId)}` : `${API_BASE}/events`;
  const res = await fetch(url, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to list events');
  }
  return data;
}

export async function getPublicEvents() {
  const res = await fetch(`${API_BASE}/events`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch public events');
  }
  return data;
}


export async function getEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch event');
  }
  return data;
}

export async function createEvent(token, eventData) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(eventData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create event');
  }
  return data;
}

export async function updateEvent(token, id, eventData) {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(eventData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update event');
  }
  return data;
}

export async function patchResourceStatus(token, eventId, resourceId, status) {
  const res = await fetch(`${API_BASE}/events/${eventId}/resources/${resourceId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update resource status');
  }
  return data;
}

export async function getEventTimeline(token, eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}/timeline`, {
    headers: token ? authHeaders(token) : {},
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch event timeline');
  }
  return data;
}
