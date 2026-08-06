const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function saveVolunteerProfile(token, profileData) {
  const res = await fetch(`${API_BASE}/volunteer-profiles`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(profileData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save volunteer profile');
  }
  return data;
}

export async function getMyVolunteerProfile(token) {
  const res = await fetch(`${API_BASE}/volunteers/me/profile`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch volunteer profile');
  }
  return data;
}

export async function getMyTasks(token) {
  const res = await fetch(`${API_BASE}/volunteers/me/tasks`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch tasks');
  }
  return data;
}

export async function getVolunteerTrustCard(token, volunteerId) {
  const res = await fetch(`${API_BASE}/volunteers/${encodeURIComponent(volunteerId)}/trust-card`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch trust card');
  }
  return data;
}
