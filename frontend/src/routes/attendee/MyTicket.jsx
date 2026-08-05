import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRegistration, cancelRegistration } from '../../api/registrations';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';

export default function MyTicket() {
  const { id } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchTicket = () => {
    setLoading(true);
    getRegistration(id)
      .then((data) => {
        setTicketData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Ticket not found.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) {
      return;
    }
    setCancelling(true);
    try {
      await cancelRegistration(id);
      fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-glass-white/60">
        Loading ticket...
      </div>
    );
  }

  if (error || !ticketData || !ticketData.registration) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <GlassPanel className="p-8 space-y-4">
          <h2 className="text-xl font-bold text-coral-alert">Ticket Not Found</h2>
          <p className="text-sm text-glass-white/70">{error || 'Could not locate ticket.'}</p>
          <Link to="/">
            <ClayButton variant="secondary">Back to Home</ClayButton>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  const { registration, qrCode } = ticketData;
  const event = registration.eventId;
  const isRegistered = registration.status === 'registered';
  const isWaitlisted = registration.status === 'waitlisted';
  const isCancelled = registration.status === 'cancelled';

  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <GlassPanel className="p-6 md:p-8 text-center space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xs text-glass-white/60 hover:underline">
            ← Home
          </Link>
          <ClayChip
            variant={isRegistered ? 'teal' : isWaitlisted ? 'amber' : 'coral'}
            className="uppercase font-semibold tracking-wider text-xs"
          >
            {registration.status}
          </ClayChip>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-glass-white">
            {event?.title || 'Event Ticket'}
          </h1>
          <p className="mt-1 text-sm text-glass-white/70">
            {isRegistered
              ? 'Present this QR ticket at check-in'
              : isWaitlisted
              ? 'On waitlist — you will be notified if a spot opens'
              : 'This registration has been cancelled'}
          </p>
        </div>

        {/* QR Code Container */}
        {!isCancelled && (
          <div className="mx-auto w-64 rounded-2xl bg-white p-4 shadow-2xl border border-glass-white/20">
            {qrCode ? (
              <img src={qrCode} alt="QR Ticket Code" className="w-full h-full object-contain mx-auto" />
            ) : (
              <div className="p-6 text-xs text-gray-500">QR Code Unavailable</div>
            )}
            <div className="mt-2 text-center text-xs font-mono text-gray-700 truncate">
              Token: {registration.qrToken}
            </div>
          </div>
        )}

        {/* Details card */}
        <div className="rounded-xl bg-glass-white/5 border border-glass-white/10 p-4 text-left space-y-2.5 text-sm">
          <div className="flex justify-between border-b border-glass-white/5 pb-2">
            <span className="text-glass-white/50 text-xs font-mono">Attendee:</span>
            <span className="text-glass-white font-medium">{registration.name}</span>
          </div>
          <div className="flex justify-between border-b border-glass-white/5 pb-2">
            <span className="text-glass-white/50 text-xs font-mono">Email:</span>
            <span className="text-glass-white">{registration.email}</span>
          </div>
          {registration.phone && (
            <div className="flex justify-between border-b border-glass-white/5 pb-2">
              <span className="text-glass-white/50 text-xs font-mono">Phone:</span>
              <span className="text-glass-white">{registration.phone}</span>
            </div>
          )}
          {event && (
            <>
              <div className="flex justify-between border-b border-glass-white/5 pb-2">
                <span className="text-glass-white/50 text-xs font-mono">Venue:</span>
                <span className="text-teal-live font-medium">{event.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-glass-white/50 text-xs font-mono">Date:</span>
                <span className="text-glass-white">
                  {new Date(event.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </>
          )}
        </div>

        {!isCancelled && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-coral-alert hover:underline transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Registration'}
            </button>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
