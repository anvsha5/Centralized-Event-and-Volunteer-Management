const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function requestOtp(email) {
  const res = await fetch(`${API_BASE}/auth/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to send OTP');
  }
  return data;
}

export async function verifyOtp(email, otp, intent = 'attendee') {
  const query = intent ? `?intent=${encodeURIComponent(intent)}` : '';
  const res = await fetch(`${API_BASE}/auth/otp/verify${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid OTP');
  }
  return data; // { token, user: { id, email, name, role } }
}

export async function getMe(token) {
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unauthorized');
  }
  return data; // { id, email, name, role }
}
