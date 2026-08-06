import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { getEvent } from '../../api/events';
import { createAnnouncement, getAnnouncements } from '../../api/announcements';
import { useAuth } from '../../context/AuthContext';

function Announcements() {
  const { id } = useParams();
  const { token } = useAuth();

  const [event, setEvent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [sessionId, setSessionId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [eventData, listData] = await Promise.all([
        getEvent(id),
        getAnnouncements(id),
      ]);
      setEvent(eventData);
      setAnnouncements(listData);
      if (eventData.sessions && eventData.sessions.length > 0) {
        setSessionId(eventData.sessions[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load announcements data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        message: message.trim(),
        target: {
          type: targetType,
          sessionId: targetType === 'session' ? sessionId : null,
        },
      };
      const newDoc = await createAnnouncement(token, id, payload);
      setAnnouncements((prev) => [newDoc, ...prev]);
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const getSessionName = (sessId) => {
    if (!event || !event.sessions) return 'Session';
    const found = event.sessions.find((s) => s._id === sessId);
    return found ? `${found.title} (${found.room})` : 'Specific Session';
  };

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/organizer"
            className="text-xs text-teal-live hover:underline font-medium inline-block mb-1"
          >
            ← Back to Events
          </Link>
          <h1 className="font-display text-2xl font-bold text-glass-white">
            Broadcast Announcements
          </h1>
          {event && (
            <p className="font-body text-sm text-glass-white/60">
              {event.title} {event.venue ? `· ${event.venue}` : ''}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-coral-alert/30 bg-coral-alert/10 p-3 text-sm text-coral-alert">
          {error}
        </div>
      )}

      {loading ? (
        <GlassPanel className="text-center text-sm text-glass-white/60 py-12">
          Loading announcements...
        </GlassPanel>
      ) : (
        <div className="space-y-6">
          {/* Compose Form */}
          <GlassPanel className="p-6">
            <h2 className="font-display text-lg font-semibold text-glass-white mb-4">
              New Announcement
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-glass-white/70 mb-1">
                  Target Audience
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value)}
                      className="w-full rounded-lg bg-base-ink/60 border border-glass-white/15 px-3 py-2 text-sm text-glass-white focus:outline-none focus:ring-1 focus:ring-teal-live"
                    >
                      <option value="all">All Attendees</option>
                      <option
                        value="session"
                        disabled={!event?.sessions || event.sessions.length === 0}
                      >
                        Specific Session {!event?.sessions?.length ? '(No sessions)' : ''}
                      </option>
                    </select>
                  </div>

                  {targetType === 'session' && event?.sessions?.length > 0 && (
                    <div>
                      <select
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        className="w-full rounded-lg bg-base-ink/60 border border-glass-white/15 px-3 py-2 text-sm text-glass-white focus:outline-none focus:ring-1 focus:ring-teal-live"
                      >
                        {event.sessions.map((sess) => (
                          <option key={sess._id} value={sess._id}>
                            {sess.title} ({sess.room})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-glass-white/70 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your announcement here..."
                  className="w-full rounded-lg bg-base-ink/60 border border-glass-white/15 p-3 text-sm text-glass-white focus:outline-none focus:ring-1 focus:ring-teal-live"
                  required
                />
              </div>

              <div className="flex justify-end">
                <ClayButton type="submit" disabled={submitting || !message.trim()}>
                  {submitting ? 'Sending...' : 'Broadcast Announcement'}
                </ClayButton>
              </div>
            </form>
          </GlassPanel>

          {/* Announcements List */}
          <div>
            <h2 className="font-display text-lg font-semibold text-glass-white mb-3">
              Announcement History ({announcements.length})
            </h2>

            {announcements.length === 0 ? (
              <GlassPanel className="text-center py-8 text-sm text-glass-white/60">
                No announcements sent yet for this event.
              </GlassPanel>
            ) : (
              <div className="space-y-3">
                {announcements.map((item) => (
                  <GlassPanel key={item._id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <ClayChip
                        className={
                          item.target?.type === 'session'
                            ? 'bg-amber-ai/20 text-amber-ai ring-1 ring-amber-ai/30'
                            : 'bg-teal-live/20 text-teal-live ring-1 ring-teal-live/30'
                        }
                      >
                        {item.target?.type === 'session'
                          ? `Session: ${getSessionName(item.target?.sessionId)}`
                          : 'All Attendees'}
                      </ClayChip>
                      <span className="text-xs font-mono text-glass-white/40">
                        {new Date(item.createdAt).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-glass-white/90 whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </GlassPanel>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default Announcements;
