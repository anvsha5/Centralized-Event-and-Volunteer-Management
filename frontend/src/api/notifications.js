const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// GET /api/notifications/me?unread=true
export async function getMyNotifications(token, unreadOnly = false) {
  const url = `${API_BASE}/notifications/me${unreadOnly ? '?unread=true' : ''}`;
  const res = await fetch(url, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch notifications');
  }
  return data;
}

// PATCH /api/notifications/:id/read
export async function markNotificationAsRead(token, notificationId) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to mark notification as read');
  }
  return data;
}
