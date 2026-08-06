const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// POST /api/events/:id/issues (multipart/form-data)
export async function createIssue(token, eventId, formData) {
  const res = await fetch(`${API_BASE}/events/${eventId}/issues`, {
    method: 'POST',
    headers: authHeaders(token), // Note: browser automatically sets Content-Type for FormData
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to report issue');
  }
  return data;
}

// GET /api/events/:id/issues?teamTag=...
export async function getIssuesByEvent(token, eventId, teamTag) {
  let url = `${API_BASE}/events/${eventId}/issues`;
  if (teamTag && teamTag !== 'all') {
    url += `?teamTag=${encodeURIComponent(teamTag)}`;
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch issues');
  }
  return data;
}

// PUT /api/issues/:id
export async function updateIssueStatus(token, issueId, status) {
  const res = await fetch(`${API_BASE}/issues/${issueId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update issue status');
  }
  return data;
}
