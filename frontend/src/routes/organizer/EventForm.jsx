import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { createEvent, getEvent, updateEvent } from '../../api/events';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'concert', label: 'Concert' },
  { value: 'tedx', label: 'TEDx' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

const RESOURCE_PRESETS = [
  'Projector',
  'Camera',
  'Mic',
  'Laptop',
  'Extension Board',
  'Chairs',
];

const emptySession = () => ({
  title: '',
  room: '',
  startTime: '',
  endTime: '',
  topic: '',
});

const emptyResource = () => ({
  name: '',
  quantityNeeded: 1,
});

function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [publishedEventId, setPublishedEventId] = useState(null);
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [category, setCategory] = useState('');
  const [sessions, setSessions] = useState([emptySession()]);
  const [resources, setResources] = useState([emptyResource()]);

  useEffect(() => {
    if (!isEdit) return;

    async function loadEvent() {
      try {
        setLoading(true);
        const event = await getEvent(id);
        setTitle(event.title || '');
        setDescription(event.description || '');
        setVenue(event.venue || '');
        setCapacity(String(event.capacity ?? ''));
        setStartTime(toDatetimeLocal(event.startTime));
        setEndTime(toDatetimeLocal(event.endTime));
        setRegistrationDeadline(toDatetimeLocal(event.registrationDeadline));
        setCategory(event.category || '');
        setSessions(
          event.sessions?.length
            ? event.sessions.map((session) => ({
                _id: session._id,
                title: session.title || '',
                room: session.room || '',
                startTime: toDatetimeLocal(session.startTime),
                endTime: toDatetimeLocal(session.endTime),
                topic: session.topic || '',
              }))
            : [emptySession()],
        );
        setResources(
          event.resources?.length
            ? event.resources.map((resource) => ({
                _id: resource._id,
                name: resource.name || '',
                quantityNeeded: resource.quantityNeeded ?? 1,
                status: resource.status,
              }))
            : [emptyResource()],
        );
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, isEdit]);

  const registrationLink = publishedEventId
    ? `${window.location.origin}/events/${publishedEventId}`
    : '';

  const handleCopyLink = async () => {
    if (!registrationLink) return;
    try {
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy link');
    }
  };

  const buildPayload = (status) => ({
    title,
    description,
    venue,
    capacity: Number(capacity),
    startTime,
    endTime,
    registrationDeadline,
    category: category || undefined,
    status,
    sessions: sessions
      .filter((session) => session.title.trim())
      .map((session) => ({
        _id: session._id,
        title: session.title,
        room: session.room,
        startTime: session.startTime,
        endTime: session.endTime,
        topic: session.topic,
      })),
    resources: resources
      .filter((resource) => resource.name.trim())
      .map((resource) => ({
        _id: resource._id,
        name: resource.name,
        quantityNeeded: Number(resource.quantityNeeded),
        status: resource.status || 'pending',
      })),
  });

  const handleSave = async (status) => {
    setError(null);

    if (!title.trim() || !capacity || !startTime || !endTime || !registrationDeadline) {
      setError('Please fill in all required basics fields.');
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(status);
      let saved;

      if (isEdit) {
        saved = await updateEvent(token, id, payload);
      } else {
        saved = await createEvent(token, payload);
      }

      if (status === 'live') {
        setPublishedEventId(saved._id);
      } else {
        navigate('/organizer');
      }
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const updateSession = (index, field, value) => {
    setSessions((prev) =>
      prev.map((session, i) => (i === index ? { ...session, [field]: value } : session)),
    );
  };

  const updateResource = (index, field, value) => {
    setResources((prev) =>
      prev.map((resource, i) => (i === index ? { ...resource, [field]: value } : resource)),
    );
  };

  const inputClass =
    'mt-1 w-full rounded-md border border-glass-white/10 bg-base-ink/40 px-3 py-2 font-body text-sm text-glass-white placeholder-glass-white/30 backdrop-blur-md focus:border-teal-live focus:outline-none focus:ring-1 focus:ring-teal-live';

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl p-6 md:p-8">
        <GlassPanel className="text-center text-sm text-glass-white/60">Loading event...</GlassPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6 md:p-8">
      <div className="mb-6">
        <Link to="/organizer" className="text-xs text-teal-live hover:underline">
          ← Back to Events
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold text-glass-white">
          {isEdit ? 'Edit Event' : 'Create Event'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-coral-alert/30 bg-coral-alert/10 p-3 text-sm text-coral-alert">
          {error}
        </div>
      )}

      {publishedEventId && (
        <GlassPanel className="mb-6 border-teal-live/30">
          <h2 className="font-display text-lg font-semibold text-teal-live">Event Published</h2>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Share this registration link with attendees:
          </p>
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={registrationLink}
              className={`${inputClass} flex-1 font-mono text-xs`}
            />
            <ClayButton type="button" onClick={handleCopyLink}>
              {copied ? 'Copied!' : 'Copy'}
            </ClayButton>
          </div>
          <Link to="/organizer" className="mt-4 inline-block text-xs text-teal-live hover:underline">
            Back to Events list
          </Link>
        </GlassPanel>
      )}

      {!publishedEventId && (
        <GlassPanel className="space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold text-glass-white">Basics</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-glass-white/80">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-glass-white/80">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-glass-white/80">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-glass-white/80">Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-glass-white/80">Start *</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-glass-white/80">End *</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-glass-white/80">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-glass-white">Category</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <ClayChip
                  key={cat.value}
                  selected={category === cat.value}
                  onClick={() => setCategory(cat.value)}
                >
                  {cat.label}
                </ClayChip>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-glass-white">Sessions</h2>
            <div className="mt-4 space-y-4">
              {sessions.map((session, index) => (
                <div
                  key={index}
                  className="rounded-clay border border-clay-base/20 bg-clay-base/10 p-4 shadow-clay"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-glass-white/60">
                      Session {index + 1}
                    </span>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSessions((prev) => prev.filter((_, i) => i !== index))}
                        className="text-xs text-coral-alert hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-glass-white/70">Title</label>
                      <input
                        type="text"
                        value={session.title}
                        onChange={(e) => updateSession(index, 'title', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-glass-white/70">Room</label>
                      <input
                        type="text"
                        value={session.room}
                        onChange={(e) => updateSession(index, 'room', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-glass-white/70">Start</label>
                        <input
                          type="datetime-local"
                          value={session.startTime}
                          onChange={(e) => updateSession(index, 'startTime', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-glass-white/70">End</label>
                        <input
                          type="datetime-local"
                          value={session.endTime}
                          onChange={(e) => updateSession(index, 'endTime', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-glass-white/70">Topic</label>
                      <input
                        type="text"
                        value={session.topic}
                        onChange={(e) => updateSession(index, 'topic', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <ClayButton type="button" onClick={() => setSessions((prev) => [...prev, emptySession()])}>
                + Add session
              </ClayButton>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-glass-white">Resources needed</h2>
            <div className="mt-4 space-y-3">
              {resources.map((resource, index) => (
                <div key={index} className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[180px] flex-1">
                    <label className="text-xs text-glass-white/70">Resource name</label>
                    <input
                      type="text"
                      list="resource-presets"
                      value={resource.name}
                      onChange={(e) => updateResource(index, 'name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-glass-white/70">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={resource.quantityNeeded}
                      onChange={(e) => updateResource(index, 'quantityNeeded', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  {resources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setResources((prev) => prev.filter((_, i) => i !== index))}
                      className="pb-2 text-xs text-coral-alert hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <datalist id="resource-presets">
                {RESOURCE_PRESETS.map((preset) => (
                  <option key={preset} value={preset} />
                ))}
              </datalist>
              <ClayButton
                type="button"
                onClick={() => setResources((prev) => [...prev, emptyResource()])}
              >
                + Add resource
              </ClayButton>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-glass-white/10 pt-6">
            <ClayButton type="button" disabled={saving} onClick={() => handleSave('draft')}>
              {saving ? 'Saving...' : 'Save as Draft'}
            </ClayButton>
            <ClayButton type="button" disabled={saving} onClick={() => handleSave('live')}>
              {saving ? 'Publishing...' : 'Publish Event'}
            </ClayButton>
          </div>
        </GlassPanel>
      )}
    </main>
  );
}

export default EventForm;
