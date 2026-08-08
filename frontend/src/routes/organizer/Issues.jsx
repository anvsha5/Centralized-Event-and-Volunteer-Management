import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { listEvents } from '../../api/events';
import { getIssuesByEvent, updateIssueStatus } from '../../api/issues';

const BACKEND_HOST = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'http://localhost:5000';

function getTeamBadgeStyle(teamTag) {
  switch (teamTag) {
    case 'technical':
      return 'bg-teal-live text-base-ink font-bold shadow-sm';
    case 'hospitality':
      return 'bg-violet-hospitality text-base-ink font-bold shadow-sm';
    case 'stage':
      return 'bg-gold-stage text-base-ink font-bold shadow-sm';
    case 'general':
    default:
      return 'bg-clay-base text-base-ink font-bold border border-base-ink/20 shadow-sm';
  }
}

function getPriorityStripeStyle(priority) {
  switch (priority) {
    case 'high':
      return 'border-l-[8px] border-l-coral-alert shadow-[0_0_12px_rgba(255,107,107,0.2)]';
    case 'medium':
      return 'border-l-[5px] border-l-amber-ai';
    case 'low':
    default:
      return 'border-l-2 border-l-teal-live';
  }
}

function Issues() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [issues, setIssues] = useState([]);
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxPhotoUrl, setLightboxPhotoUrl] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Load Events on Mount
  useEffect(() => {
    async function loadEventsData() {
      if (!token) return;
      try {
        const eventsData = await listEvents(token);
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
  }, [token]);

  // Load & Poll Issues
  useEffect(() => {
    if (!token || !selectedEventId) return;

    let isMounted = true;

    async function fetchIssuesData() {
      try {
        const issuesData = await getIssuesByEvent(token, selectedEventId, teamFilter);
        if (isMounted) {
          setIssues(issuesData);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load issues.');
        }
      }
    }

    fetchIssuesData();
    const interval = setInterval(fetchIssuesData, 4000); // 4s polling per spec

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, selectedEventId, teamFilter]);

  const handleStatusChange = async (issueId, newStatus) => {
    setUpdatingId(issueId);
    try {
      const updatedIssue = await updateIssueStatus(token, issueId, newStatus);
      setIssues((prev) =>
        prev.map((item) => (item._id === issueId ? updatedIssue : item))
      );
    } catch (err) {
      alert(err.message || 'Failed to update issue status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Client-side sub-filtering for priority and status
  const filteredIssues = issues.filter((issue) => {
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
    return true;
  });

  const columns = [
    { key: 'new', label: 'New', badgeColor: 'bg-coral-alert/20 text-coral-alert' },
    { key: 'in_progress', label: 'In Progress', badgeColor: 'bg-amber-ai/20 text-amber-ai' },
    { key: 'resolved', label: 'Resolved', badgeColor: 'bg-teal-live/20 text-teal-live' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-glass-white/70">Loading Issue Triage Board...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Header & Event Switcher */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-glass-white">
            Issue Triage Board
          </h1>
          <p className="mt-1 font-body text-sm text-glass-white/70">
            Real-time event issue dashboard with team tag routing and photo previews.
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

      {/* Team Tag Filter Chips (per Section 5.6 & 2.1) */}
      <div className="mb-6 rounded-glass border border-glass-white/10 bg-glass-white/[0.08] p-4 backdrop-blur-glass">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-glass-white/60">
          Filter by Team Tag
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'technical', 'hospitality', 'stage', 'general'].map((team) => (
            <ClayChip
              key={team}
              selected={teamFilter === team}
              onClick={() => setTeamFilter(team)}
              className="cursor-pointer capitalize"
            >
              {team === 'all' ? 'All Teams' : `${team.charAt(0).toUpperCase() + team.slice(1)} Team`}
            </ClayChip>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-glass-white/10 pt-3 text-xs text-glass-white/70">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-glass-white/50">Priority Filter:</span>
            {['all', 'high', 'medium', 'low'].map((prio) => (
              <button
                key={prio}
                onClick={() => setPriorityFilter(prio)}
                className={`rounded px-2 py-0.5 capitalize transition-all ${
                  priorityFilter === prio
                    ? 'bg-teal-live text-base-ink font-bold'
                    : 'bg-glass-white/10 text-glass-white hover:bg-glass-white/20'
                }`}
              >
                {prio}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-glass-white/50">Status Filter:</span>
            {['all', 'new', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded px-2 py-0.5 capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-teal-live text-base-ink font-bold'
                    : 'bg-glass-white/10 text-glass-white hover:bg-glass-white/20'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {columns.map((col) => {
          const colIssues = filteredIssues.filter((i) => i.status === col.key);

          return (
            <div
              key={col.key}
              className="flex flex-col rounded-glass border border-glass-white/10 bg-glass-white/[0.06] p-4 backdrop-blur-glass min-h-[500px]"
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between border-b border-glass-white/10 pb-3">
                <h3 className="font-display text-base font-bold text-glass-white flex items-center gap-2">
                  {col.label}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${col.badgeColor}`}>
                    {colIssues.length}
                  </span>
                </h3>
              </div>

              {/* Cards List */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                {colIssues.length === 0 ? (
                  <div className="py-12 text-center text-xs text-glass-white/40 italic">
                    Nothing reported — all clear.
                  </div>
                ) : (
                  colIssues.map((issue) => (
                    <div
                      key={issue._id}
                      className={`relative rounded-[18px] bg-clay-base p-4 text-base-ink shadow-clay shadow-clay-dual transition-all duration-150 border border-white/30 ${getPriorityStripeStyle(
                        issue.priority
                      )}`}
                    >
                      {/* Card Header: Team Tag Chip & Photo Thumbnail */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <ClayChip
                          className={getTeamBadgeStyle(issue.teamTag)}
                        >
                          {issue.teamTag || 'general'}
                        </ClayChip>

                        {issue.photoUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxPhotoUrl(
                                issue.photoUrl.startsWith('http')
                                  ? issue.photoUrl
                                  : `${BACKEND_HOST}${issue.photoUrl}`
                              )
                            }
                            className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-clay border-2 border-white/50 bg-clay-base shadow-clay shadow-clay-dual focus:outline-none focus:ring-2 focus:ring-teal-live"
                          >
                            <img
                              src={
                                issue.photoUrl.startsWith('http')
                                  ? issue.photoUrl
                                  : `${BACKEND_HOST}${issue.photoUrl}`
                              }
                              alt="Issue Thumbnail"
                              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-base-ink/40 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-white font-bold">🔍</span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Issue Info */}
                      <h4 className="font-display text-base font-bold text-base-ink">
                        {issue.type}
                      </h4>
                      {issue.location && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-base-ink/80 font-medium">
                          <span>📍 Location:</span>
                          <span>{issue.location}</span>
                        </div>
                      )}

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] text-base-ink/70 border-t border-base-ink/10 pt-2">
                        <div>
                          Reported by:{' '}
                          <span className="font-semibold">
                            {issue.reportedBy?.name || 'Anonymous Volunteer'}
                          </span>
                        </div>
                        <div className="font-mono">
                          {new Date(issue.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-base-ink/10 pt-2">
                        <span className="text-[10px] uppercase font-bold text-base-ink/50">
                          Priority: <span className="text-base-ink font-extrabold">{issue.priority}</span>
                        </span>

                        <div className="flex gap-1.5">
                          {issue.status === 'new' && (
                            <ClayButton
                              disabled={updatingId === issue._id}
                              onClick={() => handleStatusChange(issue._id, 'in_progress')}
                              className="!px-2.5 !py-1 text-[11px] bg-amber-ai text-base-ink font-bold"
                            >
                              Investigate →
                            </ClayButton>
                          )}

                          {issue.status === 'in_progress' && (
                            <>
                              <ClayButton
                                disabled={updatingId === issue._id}
                                onClick={() => handleStatusChange(issue._id, 'new')}
                                className="!px-2 !py-1 text-[11px] bg-base-ink/10 text-base-ink"
                              >
                                ← New
                              </ClayButton>
                              <ClayButton
                                disabled={updatingId === issue._id}
                                onClick={() => handleStatusChange(issue._id, 'resolved')}
                                className="!px-2.5 !py-1 text-[11px] bg-teal-live text-base-ink font-bold"
                              >
                                Resolve ✓
                              </ClayButton>
                            </>
                          )}

                          {issue.status === 'resolved' && (
                            <ClayButton
                              disabled={updatingId === issue._id}
                              onClick={() => handleStatusChange(issue._id, 'in_progress')}
                              className="!px-2 !py-1 text-[11px] bg-base-ink/10 text-base-ink"
                            >
                              Re-open
                            </ClayButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Glass Lightbox Modal Overlay for Photo Expansion */}
      {lightboxPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-ink/80 p-4 backdrop-blur-md">
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-glass border border-glass-white/20 bg-glass-white/10 p-3 shadow-glass">
            <button
              onClick={() => setLightboxPhotoUrl(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-base-ink/80 p-2 text-glass-white hover:bg-base-ink"
            >
              ✕
            </button>
            <img
              src={lightboxPhotoUrl}
              alt="Expanded Issue Photo"
              className="max-h-[80vh] w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Issues;
