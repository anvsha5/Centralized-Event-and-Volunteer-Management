const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createTask(token, taskData) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(taskData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create task');
  }
  return data;
}

export async function getTasksByEvent(token, eventId) {
  const url = eventId ? `${API_BASE}/tasks?eventId=${encodeURIComponent(eventId)}` : `${API_BASE}/tasks`;
  const res = await fetch(url, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch tasks');
  }
  return data;
}

export async function getSuggestedVolunteers(token, taskId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/suggested-volunteers`, {
    headers: authHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch suggested volunteers');
  }
  return data;
}

export async function assignTask(token, taskId, volunteerId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/assign`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ volunteerId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to assign task');
  }
  return data;
}

export async function updateTaskStatus(token, assignmentId, status) {
  const res = await fetch(`${API_BASE}/task-assignments/${assignmentId}/status`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update task status');
  }
  return data;
}
