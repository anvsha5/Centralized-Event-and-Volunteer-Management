import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { listEvents } from '../../api/events';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLES = {
  draft: 'bg-clay-base text-base-ink',
  live: 'bg-teal-live/20 text-teal-live ring-1 ring-teal-live/30',
  closed: 'bg-glass-white/10 text-glass-white/60',
  cancelled: 'bg-coral-alert/20 text-coral-alert ring-1 ring-coral-alert/30',
};

const CATEGORY_LABELS = {
  hackathon: 'Hackathon',
  workshop: 'Workshop',
  seminar: 'Seminar',
  concert: 'Concert',
  tedx: 'TEDx',
  sports: 'Sports',
  other: 'Other',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function Events() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const data = await listEvents(token);
        setEvents(data);
      } catch (err) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadEvents();
    }
  }, [token]);

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-glass-white">Events</h1>
          <p className="mt-1 font-body text-sm text-glass-white/60">
            Manage your events, sessions, and resources
          </p>
        </div>
        <Link to="/organizer/events/new">
          <ClayButton>Create Event</ClayButton>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-coral-alert/30 bg-coral-alert/10 p-3 text-sm text-coral-alert">
          {error}
        </div>
      )}

      {loading ? (
        <GlassPanel className="text-center text-sm text-glass-white/60">Loading events...</GlassPanel>
      ) : events.length === 0 ? (
        <GlassPanel className="text-center">
          <p className="font-body text-sm text-glass-white/70">No events yet.</p>
          <Link to="/organizer/events/new" className="mt-4 inline-block">
            <ClayButton>Create your first event</ClayButton>
          </Link>
        </GlassPanel>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <GlassPanel key={event._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-lg font-semibold text-glass-white">{event.title}</h2>
                  <ClayChip className={STATUS_STYLES[event.status] || STATUS_STYLES.draft}>
                    {event.status}
                  </ClayChip>
                  {event.category && (
                    <ClayChip className="bg-clay-base text-base-ink">
                      {CATEGORY_LABELS[event.category] || event.category}
                    </ClayChip>
                  )}
                </div>
                <p className="mt-1 truncate font-body text-sm text-glass-white/60">
                  {event.venue || 'No venue'} · {formatDate(event.startTime)}
                </p>
                <p className="mt-0.5 font-mono text-xs text-glass-white/40">
                  Capacity {event.capacity} · {event.sessions?.length || 0} sessions ·{' '}
                  {event.resources?.length || 0} resources
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/organizer/events/${event._id}/announcements`}>
                  <ClayButton className="whitespace-nowrap bg-amber-ai/20 text-amber-ai hover:bg-amber-ai/30">
                    Announcements
                  </ClayButton>
                </Link>
                <Link to={`/organizer/events/${event._id}/resources`}>
                  <ClayButton className="whitespace-nowrap bg-teal-live/20 text-teal-live hover:bg-teal-live/30">
                    Resources ({event.resources?.length || 0})
                  </ClayButton>
                </Link>
                <Link to={`/organizer/events/${event._id}/edit`}>
                  <ClayButton className="whitespace-nowrap">Edit</ClayButton>
                </Link>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </main>
  );
}

export default Events;
