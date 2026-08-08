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
      className={`relative overflow-hidden rounded-[18px] bg-clay-base p-4 text-base-ink shadow-clay shadow-clay-dual transition-all duration-300 border border-white/40 ${
        pulsing ? 'scale-[1.03] shadow-[0_0_25px_rgba(47,208,196,0.5)] ring-2 ring-teal-live' : ''
      } ${className}`}
    >
      {/* Translucent Glass Dome capsule */}
      <div className="relative z-10 rounded-glass border border-white/50 bg-white/35 p-4 backdrop-blur-md shadow-glass">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-base-ink/80">{title}</span>
          {icon && <span className="text-xl text-teal-live-dark drop-shadow">{icon}</span>}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-base-ink">
            {value !== undefined && value !== null ? value : 0}
          </span>
        </div>

        {subtext && <p className="mt-1 font-body text-xs text-base-ink/70">{subtext}</p>}
      </div>

      {/* Decorative glass highlight dome glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-teal-live/25 blur-xl" />
    </div>
  );
}

export default StatDome;