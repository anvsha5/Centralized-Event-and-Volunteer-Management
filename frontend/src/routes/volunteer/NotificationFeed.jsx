import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/glass/GlassPanel';
import { getMyNotifications, markNotificationAsRead } from '../../api/notifications';

function getNotificationIcon(type) {
  switch (type) {
    case 'task_assigned':
      return '📌';
    case 'task_updated':
      return '🔄';
    case 'shift_changed':
      return '🕒';
    case 'event_reminder':
      return '⏰';
    case 'issue_assigned':
      return '🚨';
    default:
      return '🔔';
  }
}

function formatRelativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(dateString).toLocaleDateString();
}

function NotificationFeed() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function loadNotifications() {
      try {
        const notifs = await getMyNotifications(token, unreadOnly);
        if (isMounted) {
          setNotifications(notifs);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load notifications.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 5000); // 5s live polling

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, unreadOnly]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading && notifications.length === 0) {
    return (
      <GlassPanel className="mb-6 p-4">
        <div className="text-xs text-glass-white/60">Loading notifications...</div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="mb-6 border border-glass-white/10 bg-glass-white/[0.08] p-5 backdrop-blur-glass">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base font-bold text-glass-white flex items-center gap-2">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-teal-live px-2 py-0.5 font-mono text-[11px] font-bold text-base-ink">
                {unreadCount} new
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-2 py-0.5 rounded transition-all ${
              !unreadOnly
                ? 'bg-glass-white/20 text-glass-white font-bold'
                : 'text-glass-white/60 hover:text-glass-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-2 py-0.5 rounded transition-all ${
              unreadOnly
                ? 'bg-teal-live text-base-ink font-bold'
                : 'text-glass-white/60 hover:text-glass-white'
            }`}
          >
            Unread Only
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded p-2 text-xs text-coral-alert bg-coral-alert/10 border border-coral-alert/20">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-glass-white/50 italic">
            No notifications — you&apos;re all caught up!
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={(e) => !notif.read && handleMarkAsRead(notif._id, e)}
              className={`group flex items-start justify-between gap-3 rounded-lg border p-3 text-xs transition-all cursor-pointer ${
                !notif.read
                  ? 'border-teal-live/40 bg-teal-live/10 text-glass-white hover:bg-teal-live/20'
                  : 'border-glass-white/10 bg-glass-white/5 text-glass-white/70 hover:bg-glass-white/10'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Type Icon */}
                <span className="text-base select-none">{getNotificationIcon(notif.type)}</span>

                <div>
                  <div className="font-medium text-glass-white">{notif.message}</div>
                  <div className="mt-1 font-mono text-[10px] text-glass-white/50">
                    {formatRelativeTime(notif.createdAt)}
                  </div>
                </div>
              </div>

              {/* Unread Teal Dot or Mark Read Button */}
              <div className="flex items-center gap-2 shrink-0">
                {!notif.read && (
                  <span
                    title="Unread notification - Click to mark read"
                    className="h-2.5 w-2.5 rounded-full bg-teal-live shadow-[0_0_8px_#2FD0C4]"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

export default NotificationFeed;
