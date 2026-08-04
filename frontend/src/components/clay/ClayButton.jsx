function ClayButton({ children, className = '', type = 'button', disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-clay bg-clay-base px-4 py-2 font-body text-sm font-medium text-base-ink shadow-clay transition-all duration-150 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-live active:translate-y-0.5 active:shadow-clay-pressed disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default ClayButton;
