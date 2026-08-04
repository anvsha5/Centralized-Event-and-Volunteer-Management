/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'base-ink': '#161B33',
        'base-violet': '#3B2E6B',
        'glass-white': '#F4F6FF',
        'teal-live': '#2FD0C4',
        'amber-ai': '#F5A93F',
        'coral-alert': '#FF6B6B',
        'clay-base': '#EDEBFF',
        'violet-hospitality': '#C9A0F5',
        'gold-stage': '#F5C86B',
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"General Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        glass: '16px',
        clay: '12px',
      },
      boxShadow: {
        glass: 'inset 0 1px 0 rgba(244, 246, 255, 0.08), 0 8px 32px rgba(22, 27, 51, 0.24)',
        clay: '0 2px 0 #D4D0F0, 0 4px 12px rgba(22, 27, 51, 0.08)',
        'clay-pressed': 'inset 0 2px 4px rgba(22, 27, 51, 0.12)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};
