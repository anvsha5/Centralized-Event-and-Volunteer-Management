import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../../api/events';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvent(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Event not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-glass-white/60">
        Loading event details...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <GlassPanel className="p-8">
          <h2 className="text-xl font-bold text-coral-alert mb-2">Event Not Found</h2>
          <p className="text-sm text-glass-white/70 mb-6">{error || 'The requested event does not exist.'}</p>
          <Link to="/">
            <ClayButton variant="secondary">Back to Home</ClayButton>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  const startDate = new Date(event.startTime).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const endDate = new Date(event.endTime).toLocaleString([], {
    timeStyle: 'short',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <GlassPanel className="p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ClayChip variant="teal" className="uppercase tracking-wider text-xs font-semibold">
            {event.category || 'Event'}
          </ClayChip>
          <span className="text-xs text-glass-white/60 font-mono">
            Capacity: {event.capacity} seats
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-glass-white tracking-tight">
            {event.title}
          </h1>
          <p className="mt-2 text-sm text-glass-white/80 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-glass-white/10 text-sm">
          <div>
            <span className="text-xs uppercase text-glass-white/50 block font-mono">Venue</span>
            <span className="font-medium text-teal-live">{event.venue || 'TBA'}</span>
          </div>
          <div>
            <span className="text-xs uppercase text-glass-white/50 block font-mono">Date & Time</span>
            <span className="font-medium text-glass-white">{startDate} – {endDate}</span>
          </div>
        </div>

        {event.sessions && event.sessions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-glass-white/10">
            <h3 className="text-base font-semibold text-glass-white">Event Sessions</h3>
            <div className="grid gap-3">
              {event.sessions.map((session, idx) => (
                <div
                  key={session._id || idx}
                  className="rounded-xl bg-glass-white/5 border border-glass-white/10 p-4 space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-glass-white text-sm">{session.title}</span>
                    <span className="text-xs font-mono text-teal-live px-2 py-0.5 rounded bg-teal-live/10">
                      Room: {session.room}
                    </span>
                  </div>
                  {session.topic && (
                    <p className="text-xs text-glass-white/70">{session.topic}</p>
                  )}
                  <p className="text-xs text-glass-white/50 font-mono">
                    {new Date(session.startTime).toLocaleTimeString([], { timeStyle: 'short' })} –{' '}
                    {new Date(session.endTime).toLocaleTimeString([], { timeStyle: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 flex items-center justify-end">
          <Link to={`/events/${event._id}/register`}>
            <ClayButton variant="primary" className="w-full sm:w-auto px-8">
              Register Now
            </ClayButton>
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
}
