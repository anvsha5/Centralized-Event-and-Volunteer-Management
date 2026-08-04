function ClayChip({ children, className = '', selected = false, onClick, ...props }) {
  const interactive = typeof onClick === 'function';

  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
      className={`inline-flex items-center rounded-clay px-3 py-1 text-xs font-medium shadow-clay transition-all duration-150 ${
        selected
          ? 'bg-teal-live text-base-ink ring-2 ring-teal-live/40'
          : 'bg-clay-base text-base-ink'
      } ${interactive ? 'cursor-pointer hover:brightness-105 active:translate-y-0.5 active:shadow-clay-pressed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-live' : ''} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default ClayChip;
