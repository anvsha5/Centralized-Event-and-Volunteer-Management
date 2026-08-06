import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { getPublicEvents } from '../../api/events';
import { searchRegistrations } from '../../api/checkins';

function AttendeeDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Ticket Lookup state
  const [lookupEmail, setLookupEmail] = useState('');
  const [userTickets, setUserTickets] = useState([]);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    getPublicEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load public events.');
        setLoading(false);
      });
  }, []);

  const categories = ['ALL', ...new Set(events.map((e) => e.category).filter(Boolean))];

  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch =
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketLookup = async (e) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;

    setLookingUp(true);
    setLookupError('');
    setUserTickets([]);

    try {
      const tickets = await searchRegistrations(null, null, lookupEmail.trim());
      if (tickets.length === 0) {
        setLookupError('No registrations found for this email address.');
      } else {
        setUserTickets(tickets);
      }
    } catch (err) {
      setLookupError(err.message || 'Ticket lookup failed.');
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-glass-white/10 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-glass-white">
            Discover & Register for Events
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Browse upcoming portal events, secure your spot, and access your instant QR ticket.
          </p>
        </div>

        {/* Quick Ticket Lookup Toggle/Form */}
        <div className="rounded-glass border border-glass-white/15 bg-glass-white/10 p-3 backdrop-blur-md max-w-sm">
          <span className="text-xs font-mono font-semibold uppercase text-teal-live block mb-1.5">
            🎫 Quick Ticket Lookup
          </span>
          <form onSubmit={handleTicketLookup} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter registration email..."
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              className="flex-1 rounded-clay border border-glass-white/20 bg-base-ink px-3 py-1.5 text-xs text-glass-white placeholder-glass-white/40 focus:outline-none focus:border-teal-live"
            />
            <ClayButton type="submit" disabled={lookingUp} className="!px-3 !py-1 text-xs">
              {lookingUp ? '...' : 'Find Ticket'}
            </ClayButton>
          </form>
        </div>
      </div>

      {/* Ticket Lookup Results Popup Banner */}
      {(userTickets.length > 0 || lookupError) && (
        <GlassPanel className="p-4 border-teal-live/40 bg-teal-live/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-teal-live">Your Registered Tickets</h3>
            <button
              onClick={() => {
                setUserTickets([]);
                setLookupError('');
              }}
              className="text-xs text-glass-white/60 hover:text-glass-white"
            >
              ✕ Close
            </button>
          </div>

          {lookupError && <p className="text-xs text-coral-alert">{lookupError}</p>}

          <div className="grid gap-2">
            {userTickets.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between p-3 rounded-lg bg-base-ink/60 border border-glass-white/10 text-xs"
              >
                <div>
                  <span className="font-bold text-glass-white">{t.name}</span> —{' '}
                  <span className="text-teal-live">{t.status.toUpperCase()}</span>
                  <div className="text-[10px] text-glass-white/60 font-mono mt-0.5">
                    Token: {t.qrToken}
                  </div>
                </div>
                <Link to={`/attendee/ticket/${t._id}`}>
                  <ClayButton className="!px-3 !py-1 text-xs">View QR Ticket</ClayButton>
                </Link>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search events by title, venue, topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 rounded-clay border border-glass-white/20 bg-glass-white/5 px-4 py-2 text-sm text-glass-white placeholder-glass-white/40 focus:outline-none focus:border-teal-live"
        />

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <ClayChip
              key={cat}
              selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className="cursor-pointer text-xs uppercase font-mono"
            >
              {cat}
            </ClayChip>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-16 text-center text-glass-white/60">Loading events directory...</div>
      )}

      {error && (
        <GlassPanel className="p-6 text-center border-coral-alert/30 text-coral-alert">
          {error}
        </GlassPanel>
      )}

      {/* Events Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.length === 0 ? (
            <GlassPanel className="col-span-full p-8 text-center text-glass-white/60">
              No events found matching your search.
            </GlassPanel>
          ) : (
            filteredEvents.map((evt) => (
              <GlassPanel key={evt._id} className="p-6 flex flex-col justify-between space-y-4 hover:border-glass-white/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <ClayChip variant="teal" className="text-[10px] uppercase font-mono tracking-wider">
                      {evt.category || 'General'}
                    </ClayChip>
                    <span className="text-xs font-mono text-glass-white/60">
                      Capacity: {evt.capacity}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-display text-xl font-bold text-glass-white">{evt.title}</h2>
                    <p className="mt-1 text-xs text-glass-white/70 line-clamp-2">
                      {evt.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-glass-white/80 font-mono border-t border-glass-white/10 pt-3">
                    <div>📍 Venue: <span className="text-teal-live">{evt.venue || 'TBA'}</span></div>
                    <div>
                      🕒 Date: {new Date(evt.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link to={`/events/${evt._id}/public`} className="flex-1">
                    <ClayButton variant="secondary" className="w-full text-xs">
                      View Details
                    </ClayButton>
                  </Link>
                  <Link to={`/events/${evt._id}/register`} className="flex-1">
                    <ClayButton variant="primary" className="w-full text-xs font-semibold">
                      Register Now
                    </ClayButton>
                  </Link>
                </div>
              </GlassPanel>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AttendeeDashboard;
