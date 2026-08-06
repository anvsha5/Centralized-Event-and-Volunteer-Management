import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import StatDome from '../../components/clay/StatDome';
import VitalsStrip from '../../components/glass/VitalsStrip';
import usePolling from '../../hooks/usePolling';
import { useAuth } from '../../context/AuthContext';
import { getLiveCheckins } from '../../api/checkins';
import { listEvents } from '../../api/events';

function Live() {
  const { eventId: paramEventId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(paramEventId || '');

  useEffect(() => {
    async function loadEvents() {
      try {
        const fetchedEvents = await listEvents(token, 'me');
        setEvents(fetchedEvents);
        if (!selectedEventId && fetchedEvents.length > 0) {
          setSelectedEventId(fetchedEvents[0]._id);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    }
    loadEvents();
  }, [token, selectedEventId]);

  const fetchMetrics = useCallback(async () => {
    if (!selectedEventId) return null;
    return await getLiveCheckins(token, selectedEventId);
  }, [token, selectedEventId]);

  const { data: metrics, loading, error } = usePolling(fetchMetrics, 3000);

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="min-h-screen bg-base-ink p-6 font-body text-glass-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header & Event Selector */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-glass-white">
              Live Attendance Dashboard
              <span className="inline-block h-3.5 w-3.5 animate-ping rounded-full bg-teal-live" />
            </h1>
            <p className="text-sm text-glass-white/60">
              Real-time attendance and operational vitals polling every 3s
            </p>
          </div>

          {events.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-glass-white/60">Event:</span>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  navigate(`/organizer/live/${e.target.value}`);
                }}
                className="rounded-clay border border-glass-white/20 bg-base-ink px-3 py-1.5 text-sm font-medium text-glass-white focus:border-teal-live focus:outline-none"
              >
                {events.map((evt) => (
                  <option key={evt._id} value={evt._id}>
                    {evt.title}
                  </option>
                ))}
              </select>
              {selectedEventId && (
                <Link to={`/organizer/events/${selectedEventId}/resources`}>
                  <ClayButton className="whitespace-nowrap bg-teal-live/20 text-xs text-teal-live hover:bg-teal-live/30">
                    Resources ({selectedEvent?.resources?.length || 0})
                  </ClayButton>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <GlassPanel className="border-coral-alert/40 bg-coral-alert/10 text-sm text-coral-alert">
            Failed to fetch live data: {error}
          </GlassPanel>
        )}

        {/* Loading state */}
        {loading && !metrics && (
          <GlassPanel className="p-8 text-center text-glass-white/60">
            Connecting to live event data stream...
          </GlassPanel>
        )}

        {/* Live Attendance 4 StatDomes Grid */}
        {metrics && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatDome
                title="Registered"
                value={metrics.registered}
                subtext="Total confirmed registrations"
                icon="📝"
              />
              <StatDome
                title="Checked In"
                value={metrics.checkedIn}
                subtext="Attendees checked in at least once"
                icon="🎫"
              />
              <StatDome
                title="Inside Venue"
                value={metrics.inside}
                subtext="Currently present in event area"
                icon="🟢"
              />
              <StatDome
                title="Left Event"
                value={metrics.left}
                subtext="Attendees checked out"
                icon="🚪"
              />
            </div>

            {/* Vitals Strip */}
            <VitalsStrip
              capacity={metrics.capacity}
              occupancyPercent={metrics.occupancyPercent}
              activeVolunteers={metrics.activeVolunteers}
              eventStatus={metrics.eventStatus || selectedEvent?.status || 'Live'}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Live;
