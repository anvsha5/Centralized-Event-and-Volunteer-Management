import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TimelineRail from '../../components/glass/TimelineRail';
import { listEvents, getEventTimeline } from '../../api/events';

function EventTimeline({ roleOverride }) {
  const { token, user, role: userRole } = useAuth();
  const activeRole = roleOverride || userRole;

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [error, setError] = useState('');

  // Load available events
  useEffect(() => {
    async function loadEventsData() {
      try {
        const eventsData = await listEvents(token, activeRole === 'organizer' ? 'me' : null);
        setEvents(eventsData);
        if (eventsData.length > 0) {
          setSelectedEventId(eventsData[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    }
    loadEventsData();
  }, [token, activeRole]);

  // Load timeline for selected event
  useEffect(() => {
    if (!selectedEventId) return;

    async function fetchTimeline() {
      setTimelineLoading(true);
      try {
        const data = await getEventTimeline(token, selectedEventId);
        setTimelineItems(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load event timeline.');
      } finally {
        setTimelineLoading(false);
      }
    }

    fetchTimeline();
  }, [token, selectedEventId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-glass-white/70">
        Loading Event Timeline...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Event Selection Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-glass-white">
            {activeRole === 'organizer' && 'Event Timeline Overview'}
            {activeRole === 'volunteer' && 'Volunteer Schedule & Timeline'}
            {activeRole === 'attendee' && 'Event Program & Schedule'}
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Chronological schedule of sessions and volunteer shifts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-glass-white/70">Select Event:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-clay bg-clay-base px-3 py-1.5 font-body text-sm text-base-ink shadow-clay focus:outline-none focus:ring-2 focus:ring-teal-live"
          >
            {events.length === 0 ? (
              <option value="">No events available</option>
            ) : (
              events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-clay bg-coral-alert/20 p-3 text-sm text-coral-alert border border-coral-alert/30">
          {error}
        </div>
      )}

      {timelineLoading ? (
        <div className="py-12 text-center text-glass-white/60">Fetching schedule...</div>
      ) : (
        <TimelineRail
          items={timelineItems}
          currentUserId={user?.id || user?._id}
          role={activeRole}
        />
      )}
    </div>
  );
}

export default EventTimeline;
