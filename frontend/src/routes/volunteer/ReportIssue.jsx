import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { getPublicEvents } from '../../api/events';
import { createIssue } from '../../api/issues';

function ReportIssue() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedEventId = searchParams.get('eventId');

  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(preselectedEventId || '');
  const [type, setType] = useState('Audio/Visual Hardware');
  const [customType, setCustomType] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState('medium');
  const [teamTag, setTeamTag] = useState('technical');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadEventsData() {
      if (!token) return;
      try {
        const eventsData = await getPublicEvents();
        setEvents(eventsData);
        if (!eventId && eventsData.length > 0) {
          setEventId(eventsData[0]._id);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      }
    }
    loadEventsData();
  }, [token, eventId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size exceeds 5MB limit.');
        return;
      }
      setError('');
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventId) {
      setError('Please select an event.');
      return;
    }
    const finalType = type === 'Other' ? customType : type;
    if (!finalType.trim()) {
      setError('Please specify an issue type.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('type', finalType);
      formData.append('location', location);
      formData.append('priority', priority);
      formData.append('teamTag', teamTag);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await createIssue(token, eventId, formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit issue report.');
    } finally {
      setLoading(false);
    }
  };

  const issueTypes = [
    'Audio/Visual Hardware',
    'Stage / Mic Breakdown',
    'Hospitality & Catering',
    'Crowd Control & Security',
    'Medical / Safety Incident',
    'WiFi & Network Connectivity',
    'Other',
  ];

  const teamTags = [
    { key: 'technical', label: 'Technical' },
    { key: 'hospitality', label: 'Hospitality' },
    { key: 'stage', label: 'Stage' },
    { key: 'general', label: 'General' },
  ];

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-glass-white">
            Report an Issue
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Submit a real-time event incident with photo proof and team routing tag.
          </p>
        </div>
        <ClayButton
          onClick={() => navigate('/volunteer/tasks')}
          className="bg-glass-white/20 text-glass-white text-xs"
        >
          ← Back to Tasks
        </ClayButton>
      </div>

      {success ? (
        <GlassPanel className="p-8 text-center border border-teal-live/40 bg-teal-live/10">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="font-display text-xl font-bold text-teal-live">
            Issue Reported Successfully!
          </h2>
          <p className="mt-2 text-sm text-glass-white/80">
            Your issue has been logged and routed to the {teamTag} team and event organizers.
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <ClayButton
              onClick={() => {
                setSuccess(false);
                setPhotoFile(null);
                setPhotoPreview(null);
                setLocation('');
              }}
              className="bg-clay-base text-base-ink text-xs font-semibold"
            >
              Report Another Issue
            </ClayButton>
            <ClayButton
              onClick={() => navigate('/volunteer/tasks')}
              className="bg-teal-live text-base-ink text-xs font-bold"
            >
              Go to My Tasks
            </ClayButton>
          </div>
        </GlassPanel>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassPanel className="space-y-5">
            {error && (
              <div className="rounded-clay bg-coral-alert/20 p-3 text-sm text-coral-alert border border-coral-alert/30">
                {error}
              </div>
            )}

            {/* Event Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-glass-white/70 mb-1">
                Event *
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                className="w-full rounded-clay bg-clay-base px-3 py-2 text-sm text-base-ink focus:outline-none focus:ring-2 focus:ring-teal-live"
              >
                {events.length === 0 ? (
                  <option value="">No active events found</option>
                ) : (
                  events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Issue Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-glass-white/70 mb-1">
                Issue Category / Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-clay bg-clay-base px-3 py-2 text-sm text-base-ink focus:outline-none focus:ring-2 focus:ring-teal-live"
              >
                {issueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {type === 'Other' && (
                <input
                  type="text"
                  placeholder="Describe issue type..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="mt-2 w-full rounded-clay bg-clay-base px-3 py-2 text-sm text-base-ink focus:outline-none focus:ring-2 focus:ring-teal-live"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-glass-white/70 mb-1">
                Location / Venue Area
              </label>
              <input
                type="text"
                placeholder="e.g. Main Stage Left, Registration Desk 2..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-clay bg-clay-base px-3 py-2 text-sm text-base-ink focus:outline-none focus:ring-2 focus:ring-teal-live"
              />
            </div>

            {/* Team Tag Selector (Section 5.10) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-glass-white/70 mb-2">
                Route to Team Tag *
              </label>
              <div className="flex flex-wrap gap-2">
                {teamTags.map((tag) => (
                  <ClayChip
                    key={tag.key}
                    selected={teamTag === tag.key}
                    onClick={() => setTeamTag(tag.key)}
                    className="cursor-pointer font-bold"
                  >
                    {tag.label} Team
                  </ClayChip>
                ))}
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-glass-white/70 mb-2">
                Priority Level
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'low', label: 'Low', color: 'bg-teal-live/20 text-teal-live' },
                  { key: 'medium', label: 'Medium', color: 'bg-amber-ai/20 text-amber-ai' },
                  { key: 'high', label: 'High (Urgent)', color: 'bg-coral-alert/20 text-coral-alert' },
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`flex-1 rounded-clay py-2 text-xs font-bold transition-all ${
                      priority === p.key
                        ? 'bg-clay-base text-base-ink shadow-clay ring-2 ring-teal-live'
                        : 'bg-glass-white/10 text-glass-white/70 hover:bg-glass-white/20'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Capture / Upload (Section 5.10) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-glass-white/70 mb-2">
                Attach Photo Proof (Max 5MB)
              </label>

              {photoPreview ? (
                <div className="relative w-full h-48 overflow-hidden rounded-xl border border-glass-white/20">
                  <img
                    src={photoPreview}
                    alt="Uploaded issue proof"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 rounded-full bg-base-ink/80 px-2.5 py-1 text-xs text-coral-alert hover:bg-base-ink"
                  >
                    Remove ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 rounded-clay border-2 border-dashed border-glass-white/30 bg-glass-white/5 cursor-pointer hover:bg-glass-white/10 transition-all">
                  <span className="text-2xl mb-1">📷</span>
                  <span className="text-xs font-semibold text-glass-white/80">
                    Tap to Capture or Upload Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <ClayButton
                type="submit"
                disabled={loading}
                className="w-full bg-coral-alert py-3 text-base font-bold text-white shadow-clay hover:brightness-110"
              >
                {loading ? 'Submitting Issue...' : '🚨 Submit Issue Report'}
              </ClayButton>
            </div>
          </GlassPanel>
        </form>
      )}
    </div>
  );
}

export default ReportIssue;
