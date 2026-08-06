import { useEffect, useState } from 'react';
import GlassPanel from './glass/GlassPanel';
import ClayChip from './clay/ClayChip';
import { getAnnouncements } from '../api/announcements';

function AnnouncementFeed({ eventId, sessionId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFeed() {
      if (!eventId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getAnnouncements(eventId, sessionId || '');
        setAnnouncements(data);
      } catch (err) {
        setError(err.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [eventId, sessionId]);

  if (!eventId) return null;

  return (
    <GlassPanel className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-glass-white flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-live"></span>
          </span>
          Event Announcements
        </h3>
        <span className="text-xs font-mono text-glass-white/50">
          {announcements.length} {announcements.length === 1 ? 'post' : 'posts'}
        </span>
      </div>

      {error && (
        <p className="text-xs text-coral-alert bg-coral-alert/10 p-2 rounded border border-coral-alert/20">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-xs text-glass-white/50 text-center py-4">Loading updates...</p>
      ) : announcements.length === 0 ? (
        <p className="text-xs text-glass-white/50 text-center py-4">
          No announcements for your session yet.
        </p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="rounded-lg bg-base-ink/40 border border-glass-white/10 p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <ClayChip
                  className={
                    item.target?.type === 'session'
                      ? 'bg-amber-ai/20 text-amber-ai text-[10px] py-0.5 px-2'
                      : 'bg-teal-live/20 text-teal-live text-[10px] py-0.5 px-2'
                  }
                >
                  {item.target?.type === 'session' ? 'Session Alert' : 'General Alert'}
                </ClayChip>
                <span className="font-mono text-glass-white/40 text-[11px]">
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-glass-white/90 leading-relaxed whitespace-pre-wrap">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

export default AnnouncementFeed;
