import { useEffect, useMemo, useState } from 'react';
import GlassPanel from '../../components/glass/GlassPanel';
import ClayButton from '../../components/clay/ClayButton';
import ClayChip from '../../components/clay/ClayChip';
import { getVolunteerTrustCard } from '../../api/volunteers';

function ReliabilityRing({ reliabilityScore }) {
  const percent = reliabilityScore === null || reliabilityScore === undefined
    ? 0
    : Math.round(reliabilityScore * 100);

  const style = useMemo(
    () => ({
      background: `conic-gradient(#2FD0C4 ${percent * 3.6}deg, rgba(244, 246, 255, 0.2) 0deg)`,
    }),
    [percent]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24 rounded-full p-1" style={style}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-base-ink text-glass-white">
          <span className="font-mono text-lg font-bold">{percent}%</span>
        </div>
      </div>
      <span className="text-xs text-glass-white/70">Reliability</span>
    </div>
  );
}

function TrustCard({ token, volunteerId, volunteerName, onClose, asPage = false }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!token || !volunteerId) return;
      setLoading(true);
      setError('');

      try {
        const card = await getVolunteerTrustCard(token, volunteerId);
        if (isMounted) {
          setData(card);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load trust card');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [token, volunteerId]);

  const containerClass = asPage
    ? 'mx-auto w-full max-w-4xl px-4 py-8'
    : 'fixed inset-0 z-50 flex justify-end bg-base-ink/70 p-0';

  const panelClass = asPage
    ? 'w-full'
    : 'h-full w-full max-w-xl overflow-y-auto rounded-none rounded-l-glass border-l border-glass-white/10 animate-[slideIn_220ms_ease-out]';

  return (
    <div className={containerClass}>
      <GlassPanel className={panelClass}>
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-glass-white/10 pb-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-glass-white">Trust Card</h2>
            <p className="mt-1 text-sm text-glass-white/70">{volunteerName || 'Volunteer performance overview'}</p>
          </div>
          {typeof onClose === 'function' && (
            <ClayButton onClick={onClose} className="bg-glass-white/20 text-glass-white">
              Close
            </ClayButton>
          )}
        </div>

        {loading && <div className="py-10 text-center text-glass-white/70">Loading trust card...</div>}

        {!loading && error && (
          <div className="rounded-clay border border-coral-alert/40 bg-coral-alert/20 p-3 text-sm text-coral-alert">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_1fr]">
              <ReliabilityRing reliabilityScore={data.reliabilityScore} />

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-glass-white/60">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(data.skills) && data.skills.length > 0 ? (
                    data.skills.map((skill) => (
                      <ClayChip key={skill}>{skill}</ClayChip>
                    ))
                  ) : (
                    <span className="text-sm text-glass-white/70">No skills added yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-glass border border-amber-ai/50 bg-amber-ai/15 p-4">
              <div className="mb-3">
                <ClayChip className="bg-amber-ai text-base-ink">AI</ClayChip>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-glass-white/70">Reliability Summary</div>
                  <p className="mt-1 text-sm text-glass-white">{data.reliabilitySummary || 'No task history yet'}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-glass-white/70">Skill Match</div>
                  <p className="mt-1 text-sm text-glass-white">{data.skillMatchSummary || 'No task history yet'}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-glass-white/60">Recent Tasks</div>
              {Array.isArray(data.recentTasks) && data.recentTasks.length > 0 ? (
                <ul className="space-y-2">
                  {data.recentTasks.map((title, index) => (
                    <li key={`${title}-${index}`} className="rounded-clay bg-glass-white/10 px-3 py-2 text-sm text-glass-white">
                      {title}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-clay bg-glass-white/10 px-3 py-2 text-sm text-glass-white/70">No completed tasks yet.</div>
              )}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}

export default TrustCard;
