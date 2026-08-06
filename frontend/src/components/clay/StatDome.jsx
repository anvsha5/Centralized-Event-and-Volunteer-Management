import { useEffect, useState } from 'react';

function StatDome({ title, value, subtext = '', icon = null, className = '' }) {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setPulsing(true);
      const timer = setTimeout(() => setPulsing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div
      className={`relative overflow-hidden rounded-clay border border-white/15 bg-slate-900/60 p-6 shadow-glass backdrop-blur-glass transition-all duration-300 ${pulsing ? 'scale-[1.03] shadow-[0_0_25px_rgba(47,208,196,0.4)] border-teal-live' : ''
        } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-bold uppercase tracking-wider text-slate-300">{title}</span>
        {icon && <span className="text-xl text-teal-live">{icon}</span>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-heading text-4xl font-extrabold text-white tracking-tight">
          {value !== undefined && value !== null ? value : 0}
        </span>
      </div>

      {subtext && <p className="mt-1 font-body text-xs text-slate-400">{subtext}</p>}

      {/* Decorative glass highlight dome curve */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal-live/10 blur-xl" />
    </div>
  );
}

export default StatDome;