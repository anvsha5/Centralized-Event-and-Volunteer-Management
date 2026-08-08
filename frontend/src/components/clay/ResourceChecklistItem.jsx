import React from 'react';

function ResourceChecklistItem({ resource, onToggle, disabled = false }) {
  const isDelivered = resource?.status === 'delivered';
  const name = resource?.name || 'Unnamed Resource';
  const quantityNeeded = resource?.quantityNeeded ?? 1;

  const handleToggle = () => {
    if (disabled || !onToggle) return;
    const nextStatus = isDelivered ? 'pending' : 'delivered';
    onToggle(resource._id || resource.id, nextStatus);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[18px] bg-clay-base p-4 shadow-clay shadow-clay-dual border transition-all duration-200 ${
        isDelivered
          ? 'opacity-40 grayscale border-transparent shadow-none'
          : 'opacity-100 border-white/40 shadow-md ring-1 ring-amber-ai/30'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Status icon / checkmark */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            isDelivered
              ? 'bg-teal-live text-base-ink font-bold'
              : 'border-2 border-amber-ai bg-amber-ai/20 text-amber-ai'
          }`}
        >
          {isDelivered ? (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-amber-ai animate-pulse" />
          )}
        </div>

        {/* Resource details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-body text-base font-bold text-base-ink truncate ${
                isDelivered ? 'line-through text-base-ink/60' : 'text-base-ink'
              }`}
            >
              {name}
            </span>
          </div>
          <p className="font-mono text-xs text-base-ink/80 mt-0.5">
            Quantity needed:{' '}
            <span className="font-bold text-base-ink">{quantityNeeded}</span>
          </p>
        </div>
      </div>

      {/* Clay Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isDelivered}
        aria-label={`Toggle status for ${name}`}
        disabled={disabled}
        onClick={handleToggle}
        className={`group relative inline-flex h-9 w-32 shrink-0 cursor-pointer items-center rounded-full p-1 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-live disabled:cursor-not-allowed disabled:opacity-50 ${
          isDelivered
            ? 'bg-teal-live/20 ring-1 ring-teal-live/40'
            : 'bg-base-ink/20 ring-1 ring-base-ink/30'
        }`}
      >
        <span
          className={`pointer-events-none flex h-7 w-14 items-center justify-center rounded-full font-body text-xs font-bold shadow-clay transition-all duration-200 ${
            isDelivered
              ? 'translate-x-16 bg-teal-live text-base-ink'
              : 'translate-x-0 bg-amber-ai text-base-ink'
          }`}
        >
          {isDelivered ? 'Delivered' : 'Pending'}
        </span>
      </button>
    </div>
  );
}

export default ResourceChecklistItem;
