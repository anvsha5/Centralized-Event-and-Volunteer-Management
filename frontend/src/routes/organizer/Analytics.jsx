import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { useAuth } from '../../context/AuthContext';
import { listEvents } from '../../api/events';
import {
  getAnalyticsFunnel,
  getAnalyticsExtended,
  getAnalyticsSummary,
} from '../../api/analytics';

function getTeamBarColor(teamTag) {
  switch (teamTag) {
    case 'technical':
      return 'bg-teal-live';
    case 'hospitality':
      return 'bg-violet-hospitality';
    case 'stage':
      return 'bg-gold-stage';
    case 'general':
    default:
      return 'bg-clay-base';
  }
}

function formatTeamLabel(teamTag) {
  if (!teamTag) return 'General';
  return teamTag.charAt(0).toUpperCase() + teamTag.slice(1);
}

function MetricCard({ label, value, subtext }) {
  return (
    <GlassPanel className="p-4">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-white/50">
        {label}
      </span>
      <span className="mt-1 block font-mono text-lg font-bold text-teal-live">
        {value ?? '—'}
      </span>
      {subtext && (
        <span className="mt-1 block text-xs text-glass-white/50">{subtext}</span>
      )}
    </GlassPanel>
  );
}

function FunnelChart({ funnel }) {
  if (!funnel) return null;

  const stages = [
    { label: 'Registered', value: funnel.registered, color: 'from-teal-live/80 to-teal-live/40' },
    { label: 'Checked In', value: funnel.checkedIn, color: 'from-teal-live/60 to-teal-live/30' },
    { label: 'Stayed', value: funnel.stayed, color: 'from-teal-live/40 to-teal-live/20' },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <GlassPanel>
      <h2 className="mb-1 font-display text-lg font-bold text-glass-white">
        Registration Funnel
      </h2>
      <p className="mb-6 text-sm text-glass-white/60">
        Registered → Checked-in → Stayed
        {funnel.dropOffPercent > 0 && (
          <span className="ml-2 font-mono text-coral-alert">
            ({funnel.dropOffPercent}% drop-off before check-in)
          </span>
        )}
      </p>

      <div className="space-y-4">
        {stages.map((stage) => {
          const widthPercent = Math.max((stage.value / maxValue) * 100, 4);
          return (
            <div key={stage.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-glass-white/80">{stage.label}</span>
                <span className="font-mono font-bold text-teal-live">{stage.value}</span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-clay bg-glass-white/5">
                <div
                  className={`flex h-full items-center rounded-clay bg-gradient-to-r ${stage.color} px-3 transition-all duration-500`}
                  style={{ width: `${widthPercent}%` }}
                >
                  {stage.value > 0 && (
                    <span className="text-xs font-mono font-bold text-base-ink">
                      {Math.round((stage.value / funnel.registered) * 100) || 0}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

function Analytics() {
  const { eventId: paramEventId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(paramEventId || '');
  const [funnel, setFunnel] = useState(null);
  const [extended, setExtended] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const fetchedEvents = await listEvents(token, 'me');
        setEvents(fetchedEvents);
        if (!selectedEventId && fetchedEvents.length > 0) {
          setSelectedEventId(fetchedEvents[0]._id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load events');
      }
    }
    if (token) loadEvents();
  }, [token, selectedEventId]);

  const loadAnalytics = useCallback(async () => {
    if (!token || !selectedEventId) return;

    setLoading(true);
    setError('');

    try {
      const [funnelData, extendedData, summaryData] = await Promise.all([
        getAnalyticsFunnel(token, selectedEventId),
        getAnalyticsExtended(token, selectedEventId),
        getAnalyticsSummary(token, selectedEventId),
      ]);

      setFunnel(funnelData);
      setExtended(extendedData);
      setSummary(summaryData.summary || '');
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      setFunnel(null);
      setExtended(null);
      setSummary('');
    } finally {
      setLoading(false);
    }
  }, [token, selectedEventId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  const buildReportText = () => {
    const lines = [];
    lines.push(`Event Analytics Report — ${selectedEvent?.title || 'Event'}`);
    lines.push('');

    if (funnel) {
      lines.push('Registration Funnel:');
      lines.push(`  Registered: ${funnel.registered}`);
      lines.push(`  Checked In: ${funnel.checkedIn}`);
      lines.push(`  Stayed: ${funnel.stayed}`);
      lines.push(`  Drop-off: ${funnel.dropOffPercent}%`);
      lines.push('');
    }

    if (extended) {
      lines.push('Key Metrics:');
      lines.push(`  Peak Entry Time: ${extended.peakEntryTime || 'N/A'} (${extended.peakEntryCount || 0} check-ins)`);
      lines.push(`  Peak Exit Time: ${extended.peakExitTime || 'N/A'} (${extended.peakExitCount || 0} check-outs)`);
      lines.push(`  Most Crowded Hall: ${extended.mostCrowdedHall || 'N/A'} (${extended.mostCrowdedHallPeakOccupancyPercent || 0}% peak)`);
      lines.push(
        `  Average Stay Time: ${extended.averageStayTimeMinutes != null ? `${extended.averageStayTimeMinutes} min` : 'N/A'}`
      );
      lines.push('');

      if (extended.volunteerPerformance) {
        lines.push('Volunteer Performance:');
        lines.push(
          `  Average Reliability: ${extended.volunteerPerformance.averageReliabilityPercent != null ? `${extended.volunteerPerformance.averageReliabilityPercent}%` : 'N/A'}`
        );
        if (extended.volunteerPerformance.topPerformers?.length > 0) {
          lines.push('  Top Performers:');
          extended.volunteerPerformance.topPerformers.forEach((v) => {
            lines.push(`    - ${v.name}: ${v.reliabilityPercent}%`);
          });
        }
        lines.push('');
      }

      if (extended.issueCount) {
        lines.push('Issue Count:');
        lines.push(`  Total: ${extended.issueCount.total} (${extended.issueCount.totalResolved} resolved, ${extended.issueCount.totalUnresolved} unresolved)`);
        extended.issueCount.byTeamTag?.forEach((team) => {
          lines.push(`  ${formatTeamLabel(team.teamTag)}: ${team.count} (${team.resolved} resolved)`);
        });
        lines.push('');
      }
    }

    if (summary) {
      lines.push('AI Summary:');
      lines.push(summary);
    }

    return lines.join('\n');
  };

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReportText());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError('Failed to copy report to clipboard');
    }
  };

  const hasData = funnel && funnel.registered > 0;
  const noCheckins = funnel && funnel.checkedIn === 0;

  return (
    <div className="min-h-screen bg-base-ink p-6 font-body text-glass-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header & Event Selector */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-glass-white">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-glass-white/60">
              Post-event metrics, funnel analysis, and AI-generated report
            </p>
          </div>

          {events.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-glass-white/60">Event:</span>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  navigate(`/organizer/analytics/${e.target.value}`);
                }}
                className="rounded-clay border border-glass-white/20 bg-base-ink px-3 py-1.5 text-sm font-medium text-glass-white focus:border-teal-live focus:outline-none"
              >
                {events.map((evt) => (
                  <option key={evt._id} value={evt._id}>
                    {evt.title}
                  </option>
                ))}
              </select>
              <ClayButton onClick={loadAnalytics} disabled={loading}>
                Refresh
              </ClayButton>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <GlassPanel className="border-coral-alert/40 bg-coral-alert/10 text-sm text-coral-alert">
            {error}
          </GlassPanel>
        )}

        {/* Loading state */}
        {loading && !funnel && (
          <GlassPanel className="p-8 text-center text-glass-white/60">
            Loading analytics data...
          </GlassPanel>
        )}

        {/* Empty state — no events */}
        {!loading && events.length === 0 && (
          <GlassPanel className="p-8 text-center text-glass-white/60">
            No events found. Create an event to view analytics.
          </GlassPanel>
        )}

        {/* Empty state — no registrations */}
        {!loading && funnel && !hasData && (
          <GlassPanel className="p-8 text-center text-glass-white/60">
            No registration data yet for this event.
          </GlassPanel>
        )}

        {/* Analytics content */}
        {!loading && hasData && (
          <>
            {/* Section 1: Funnel chart */}
            <FunnelChart funnel={funnel} />

            {/* Section 2: New metrics row — 4 compact stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard
                label="Peak Entry Time"
                value={extended?.peakEntryTime || (noCheckins ? 'N/A' : '—')}
                subtext={
                  extended?.peakEntryCount
                    ? `${extended.peakEntryCount} check-ins at peak`
                    : undefined
                }
              />
              <MetricCard
                label="Peak Exit Time"
                value={extended?.peakExitTime || (noCheckins ? 'N/A' : '—')}
                subtext={
                  extended?.peakExitCount
                    ? `${extended.peakExitCount} check-outs at peak`
                    : undefined
                }
              />
              <MetricCard
                label="Most Crowded Hall"
                value={extended?.mostCrowdedHall || (noCheckins ? 'N/A' : '—')}
                subtext={
                  extended?.mostCrowdedHallPeakOccupancyPercent != null
                    ? `${extended.mostCrowdedHallPeakOccupancyPercent}% peak occupancy`
                    : undefined
                }
              />
              <MetricCard
                label="Average Stay Time"
                value={
                  extended?.averageStayTimeMinutes != null
                    ? `${extended.averageStayTimeMinutes} min`
                    : noCheckins
                      ? 'N/A'
                      : '—'
                }
                subtext={
                  extended?.averageStayTimeSampleSize
                    ? `Based on ${extended.averageStayTimeSampleSize} completed visits`
                    : undefined
                }
              />
            </div>

            {/* Section 3: Volunteer performance + issue count panel */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Volunteer Performance */}
              <GlassPanel>
                <h2 className="mb-4 font-display text-lg font-bold text-glass-white">
                  Volunteer Performance
                </h2>

                {extended?.volunteerPerformance?.volunteerCount === 0 ? (
                  <p className="text-sm text-glass-white/60">No volunteers assigned to this event.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-live/40 bg-teal-live/10">
                        <span className="font-mono text-xl font-bold text-teal-live">
                          {extended?.volunteerPerformance?.averageReliabilityPercent ?? '—'}
                          {extended?.volunteerPerformance?.averageReliabilityPercent != null && '%'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-glass-white">
                          Average Reliability
                        </span>
                        <span className="text-xs text-glass-white/60">
                          Across {extended?.volunteerPerformance?.volunteerCount || 0} assigned volunteers
                        </span>
                      </div>
                    </div>

                    {extended?.volunteerPerformance?.topPerformers?.length > 0 && (
                      <div>
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-glass-white/50">
                          Top Performers
                        </span>
                        <div className="space-y-2">
                          {extended.volunteerPerformance.topPerformers.map((performer) => (
                            <div
                              key={performer.volunteerId}
                              className="flex items-center justify-between rounded-clay bg-glass-white/5 px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-glass-white">{performer.name}</span>
                                {performer.skills?.slice(0, 2).map((skill) => (
                                  <ClayChip key={skill} className="text-[10px]">
                                    {skill}
                                  </ClayChip>
                                ))}
                              </div>
                              <span className="font-mono text-sm font-bold text-teal-live">
                                {performer.reliabilityPercent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassPanel>

              {/* Issue Count */}
              <GlassPanel>
                <h2 className="mb-4 font-display text-lg font-bold text-glass-white">
                  Issue Count
                </h2>

                {extended?.issueCount?.total === 0 ? (
                  <p className="text-sm text-glass-white/60">Nothing reported — all clear.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-white/50">
                          Total Issues
                        </span>
                        <span className="font-mono text-2xl font-bold text-coral-alert">
                          {extended?.issueCount?.total ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-white/50">
                          Resolved
                        </span>
                        <span className="font-mono text-2xl font-bold text-teal-live">
                          {extended?.issueCount?.totalResolved ?? 0}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-white/50">
                          Unresolved
                        </span>
                        <span className="font-mono text-2xl font-bold text-amber-ai">
                          {extended?.issueCount?.totalUnresolved ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {extended?.issueCount?.byTeamTag?.map((team) => {
                        const maxCount = Math.max(
                          ...(extended.issueCount.byTeamTag.map((t) => t.count)),
                          1
                        );
                        const barWidth = (team.count / maxCount) * 100;
                        return (
                          <div key={team.teamTag}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-glass-white/80">
                                {formatTeamLabel(team.teamTag)}
                              </span>
                              <span className="font-mono text-glass-white/60">
                                {team.count} ({team.resolved} resolved)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-glass-white/5">
                              <div
                                className={`h-full rounded-full ${getTeamBarColor(team.teamTag)}`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </GlassPanel>
            </div>

            {/* Section 4: AI-generated narrative (Section 5 spec) */}
            <GlassPanel className="border border-amber-ai/60 bg-amber-ai/10 shadow-[0_0_25px_rgba(245,169,63,0.15)] p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-ai/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <ClayChip className="bg-amber-ai text-base-ink font-bold px-3 py-1">AI</ClayChip>
                  <h2 className="font-display text-lg font-bold text-glass-white">
                    Event Executive Summary
                  </h2>
                </div>
                <ClayButton onClick={handleCopyReport} className="bg-amber-ai text-base-ink font-bold text-xs py-1.5 px-3">
                  {copySuccess ? 'Copied to Clipboard!' : 'Copy report'}
                </ClayButton>
              </div>

              {noCheckins ? (
                <p className="text-sm text-glass-white/60 italic font-body">Not enough data available yet to generate executive summary.</p>
              ) : (
                <p className="font-body text-sm leading-relaxed text-glass-white/95">{summary}</p>
              )}
            </GlassPanel>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;
