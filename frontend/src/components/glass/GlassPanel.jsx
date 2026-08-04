function GlassPanel({ children, className = '', as: Component = 'div', ...props }) {
  return (
    <Component
      className={`rounded-glass border border-glass-white/10 bg-glass-white/[0.12] p-6 shadow-glass backdrop-blur-glass ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default GlassPanel;
