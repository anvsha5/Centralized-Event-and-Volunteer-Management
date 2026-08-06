function VitalsStrip({ capacity = 0, occupancyPercent = 0, activeVolunteers = 0, eventStatus = 'Upcoming', className = '' }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-live/20 px-3 py-1 text-xs font-semibold text-teal-live border border-teal-live/40">
            <span className="h-2 w-2 rounded-full bg-teal-live animate-ping" />
            Live
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/40">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Closed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/20 px-3 py-1 text-xs font-semibold text-gray-400 border border-gray-500/40">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/40">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Upcoming
          </span>
        );
    }
  };

  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between rounded-glass border border-white/15 bg-slate-900/60 p-4 font-mono shadow-glass backdrop-blur-glass ${className}`}
    >
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacity</span>
        <span className="text-base font-bold text-white">{capacity}</span>
      </div>

      <div>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy</span>
        <span className="text-base font-bold text-teal-live">{occupancyPercent}%</span>
      </div>

      <div>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Volunteers</span>
        <span className="text-base font-bold text-white">{activeVolunteers}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span className="text-xs text-slate-300 font-body">Status:</span>
        {getStatusBadge(eventStatus)}
      </div>
    </div>
  );
}

export default VitalsStrip;

