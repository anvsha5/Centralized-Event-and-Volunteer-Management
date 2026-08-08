import GlassPanel from './GlassPanel';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function TimelineRail({ items = [], currentUserId, role = 'organizer', registeredSessionId }) {
  if (!items || items.length === 0) {
    return (
      <GlassPanel className="py-12 text-center text-glass-white/60">
        <p className="font-body text-sm italic">No sessions or shifts scheduled on the timeline yet.</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="relative">
      <div className="mb-6 flex items-center justify-between border-b border-glass-white/10 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-glass-white">
            Event Schedule & Timeline
          </h2>
          <p className="mt-1 font-body text-xs text-glass-white/70">
            {role === 'volunteer' && 'Highlights show your assigned volunteer shifts.'}
            {role === 'attendee' && 'Highlights show your registered event sessions.'}
            {role === 'organizer' && 'Complete chronological overview of sessions and volunteer shifts.'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-teal-live">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-live shadow-[0_0_8px_#2FD0C4]"></span> Session
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-ai">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-ai shadow-[0_0_8px_#F5A93F]"></span> Volunteer Shift
          </span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8">
        {/* Vertical Teal Timeline Rail Line (2px) */}
        <div className="absolute top-2 bottom-2 left-2.5 sm:left-3.5 w-0.5 bg-teal-live/60" />

        <div className="space-y-6">
          {items.map((item, index) => {
            const isSession = item.type === 'session';
            const isShift = item.type === 'shift';

            // Highlighting conditions per TRD / Design Doc spec
            const isVolunteerMine =
              role === 'volunteer' && isShift && item.assignedTo === currentUserId;
            const isAttendeeMine =
              role === 'attendee' &&
              isSession &&
              (!registeredSessionId || item.id === registeredSessionId);

            const isHighlighted = isVolunteerMine || isAttendeeMine;

            return (
              <div key={item.id || index} className="relative flex items-start gap-4">
                {/* Clay Dot Marker on the Rail Line */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-3.5 z-10 h-5 w-5 rounded-full border-2 transition-all duration-200 ${
                    isHighlighted
                      ? 'border-teal-live bg-teal-live shadow-[0_0_12px_rgba(47,208,196,0.9)] scale-110'
                      : isSession
                      ? 'border-teal-live bg-clay-base shadow-clay'
                      : 'border-amber-ai bg-clay-base shadow-clay'
                  }`}
                />

                {/* Entry Card */}
                <div
                  className={`flex-1 rounded-[18px] bg-clay-base p-4 text-base-ink shadow-clay shadow-clay-dual transition-all duration-200 ${
                    isHighlighted
                      ? 'ring-2 ring-teal-live border border-teal-live bg-clay-base shadow-glass'
                      : 'hover:translate-x-1 border border-white/20'
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-base-ink/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-base-ink">
                        {formatTime(item.time)}
                        {item.endTime && ` - ${formatTime(item.endTime)}`}
                      </span>
                      <span className="text-[10px] text-base-ink/60 font-mono">
                        {formatDateHeader(item.time)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isHighlighted && (
                        <span className="rounded-full bg-teal-live px-2.5 py-0.5 text-[10px] font-bold text-base-ink uppercase tracking-wider shadow-sm">
                          ★ Your {isSession ? 'Session' : 'Shift'}
                        </span>
                      )}
                      <span
                        className={`rounded-clay px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isSession ? 'bg-teal-live/25 text-base-ink border border-teal-live/40' : 'bg-amber-ai/25 text-base-ink border border-amber-ai/40'
                        }`}
                      >
                        {isSession ? 'Session' : 'Volunteer Shift'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-display text-base font-bold text-base-ink">
                      {item.title}
                    </h3>

                    {item.location && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-base-ink/80 font-medium">
                        <span>📍 Location / Room:</span>
                        <span className="font-semibold font-mono">{item.location}</span>
                      </div>
                    )}

                    {isSession && item.speaker && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-base-ink/80">
                        <span>🎙️ Speaker:</span>
                        <span className="font-medium">{item.speaker}</span>
                      </div>
                    )}

                    {isShift && (
                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-base-ink/10 pt-2 text-xs">
                        <div className="text-base-ink/70">
                          Assigned Volunteer:{' '}
                          <span className="font-semibold text-base-ink">
                            {item.volunteerName || 'Unassigned'}
                          </span>
                        </div>
                        {item.status && (
                          <span className="rounded bg-base-ink/10 px-2 py-0.5 text-[10px] uppercase font-mono font-bold text-base-ink">
                            {item.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}

export default TimelineRail;
