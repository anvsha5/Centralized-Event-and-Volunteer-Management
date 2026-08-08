import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../../api/events';
import { registerForEvent } from '../../api/registrations';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';

export default function RegisterForm() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sessionId, setSessionId] = useState('');

  // Ticket state after registration
  const [ticketResult, setTicketResult] = useState(null);

  useEffect(() => {
    getEvent(id)
      .then((data) => {
        setEvent(data);
        setLoadingEvent(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load event details');
        setLoadingEvent(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await registerForEvent(id, {
        name,
        email,
        phone,
        sessionId: sessionId || null,
      });
      setTicketResult(res);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="flex justify-center py-20 text-glass-white/60">
        Loading registration details...
      </div>
    );
  }

  // QR Ticket Reveal Card (In-place transition)
  if (ticketResult && ticketResult.registration) {
    const { registration, qrCode } = ticketResult;
    const isRegistered = registration.status === 'registered';

    return (
      <div className="mx-auto max-w-xl px-4 py-10 space-y-6">
        <GlassPanel className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <ClayChip variant={isRegistered ? 'teal' : 'amber'} className="uppercase font-semibold tracking-wider text-xs">
              {registration.status === 'registered' ? 'Registration Confirmed' : 'Added to Waitlist'}
            </ClayChip>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-glass-white">
              {isRegistered ? 'You are registered!' : 'You are on the waitlist'}
            </h2>
            <p className="mt-1 text-sm text-glass-white/70">
              {isRegistered
                ? 'Present this QR code at the venue check-in counter.'
                : 'If a slot opens up, you will be automatically promoted and notified.'}
            </p>
          </div>

          {/* QR Ticket Display - Clean Separate Clay White Card */}
          <div className="mx-auto my-6 w-72 rounded-[20px] bg-white p-5 shadow-2xl border-4 border-clay-base shadow-clay-dual text-base-ink">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-base-ink/60 font-mono">
              Official Event Pass
            </div>
            {qrCode ? (
              <img
                src={qrCode}
                alt="Ticket QR Code"
                width={400}
                height={400}
                className="w-full h-auto aspect-square object-contain mx-auto block rounded-lg bg-white p-1"
              />
            ) : (
              <div className="p-6 text-xs text-base-ink/60">QR Code Unavailable</div>
            )}
            <div className="mt-3 text-center text-xs font-mono font-bold text-base-ink bg-clay-base/60 py-1.5 px-2 rounded-md truncate">
              Token: {registration.qrToken}
            </div>
          </div>

          <div className="rounded-xl bg-glass-white/5 border border-glass-white/10 p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-glass-white/50 text-xs font-mono">Attendee:</span>
              <span className="text-glass-white font-medium">{registration.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-glass-white/50 text-xs font-mono">Email:</span>
              <span className="text-glass-white">{registration.email}</span>
            </div>
            {event && (
              <div className="flex justify-between">
                <span className="text-glass-white/50 text-xs font-mono">Event:</span>
                <span className="text-teal-live font-medium">{event.title}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to={`/attendee/ticket/${registration._id}`}>
              <ClayButton variant="primary" className="w-full sm:w-auto">
                View My Ticket Page
              </ClayButton>
            </Link>
            <Link to={`/events/${id}/public`}>
              <ClayButton variant="secondary" className="w-full sm:w-auto">
                Back to Event
              </ClayButton>
            </Link>
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <GlassPanel className="p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-glass-white">
            Register for {event?.title || 'Event'}
          </h1>
          <p className="mt-1 text-sm text-glass-white/70">
            Fill in your details below to receive your QR ticket.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-coral-alert/10 border border-coral-alert/30 p-4 text-sm text-coral-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-glass-white/70 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-xl bg-glass-white/5 border border-glass-white/15 px-4 py-2.5 text-sm text-glass-white focus:outline-none focus:border-teal-live"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-glass-white/70 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              className="w-full rounded-xl bg-glass-white/5 border border-glass-white/15 px-4 py-2.5 text-sm text-glass-white focus:outline-none focus:border-teal-live"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-glass-white/70 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0199"
              className="w-full rounded-xl bg-glass-white/5 border border-glass-white/15 px-4 py-2.5 text-sm text-glass-white focus:outline-none focus:border-teal-live"
            />
          </div>

          {event?.sessions && event.sessions.length > 0 && (
            <div>
              <label className="block text-xs font-mono uppercase text-glass-white/70 mb-1">
                Select Primary Session (Optional)
              </label>
              <select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full rounded-xl bg-base-ink border border-glass-white/15 px-4 py-2.5 text-sm text-glass-white focus:outline-none focus:border-teal-live"
              >
                <option value="">-- All Sessions / Main Event --</option>
                {event.sessions.map((sess) => (
                  <option key={sess._id} value={sess._id}>
                    {sess.title} ({sess.room})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <Link to={`/events/${id}/public`} className="text-xs text-glass-white/60 hover:underline">
              Cancel
            </Link>
            <ClayButton variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Registering...' : 'Complete Registration'}
            </ClayButton>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
