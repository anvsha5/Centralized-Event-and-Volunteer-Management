function VitalsStrip({ capacity = 0, occupancyPercent = 0, activeVolunteers = 0, eventStatus = 'Upcoming', className = '' }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-live/15 px-2.5 py-0.5 text-xs font-semibold text-teal-live border border-teal-live/30 font-body">
            <span className="h-2 w-2 rounded-full bg-teal-live animate-ping" />
            Live
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-alert/15 px-2.5 py-0.5 text-xs font-semibold text-coral-alert border border-coral-alert/30 font-body">
            <span className="h-2 w-2 rounded-full bg-coral-alert" />
            Closed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-glass-white/10 px-2.5 py-0.5 text-xs font-semibold text-glass-white/60 border border-glass-white/20 font-body">
            <span className="h-2 w-2 rounded-full bg-glass-white/40" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-ai/15 px-2.5 py-0.5 text-xs font-semibold text-amber-ai border border-amber-ai/30 font-body">
            <span className="h-2 w-2 rounded-full bg-amber-ai" />
            Upcoming
          </span>
        );
    }
  };

  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between rounded-glass border border-glass-white/10 bg-glass-white/[0.08] px-5 py-3 shadow-glass backdrop-blur-glass opacity-90 ${className}`}
    >
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-white/50 font-body">Capacity</span>
        <span className="font-mono text-base font-bold text-glass-white">{capacity}</span>
      </div>

      <div>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-white/50 font-body">Occupancy</span>
        <span className="font-mono text-base font-bold text-teal-live">{occupancyPercent}%</span>
      </div>

      <div>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-glass-white/50 font-body font-body">Active Volunteers</span>
        <span className="font-mono text-base font-bold text-glass-white">{activeVolunteers}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span className="text-xs text-glass-white/60 font-body">Status:</span>
        {getStatusBadge(eventStatus)}
      </div>
    </div>
  );
}

export default VitalsStrip;


