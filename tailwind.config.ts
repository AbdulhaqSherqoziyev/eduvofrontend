import type { Config } from 'tailwindcss';

const config: Config = {
  // the mock site (src/app/(mock), src/components/mock-site) is plain CSS — keep it out of the ERP Tailwind build
  content: ['./src/**/*.{ts,tsx}', '!./src/app/(mock)/**', '!./src/components/mock-site/**'],
  // The theme toggle puts `.dark` on <html>; without this the `dark:` variant
  // would compile to a prefers-color-scheme query and miss the class entirely.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        selected: 'var(--selected)',
        foreground: 'var(--text)',
        muted: 'var(--text-soft)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        ctl: 'var(--radius-ctl)',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        nm: 'var(--nm-raised)',
        'nm-sm': 'var(--nm-raised-sm)',
        'nm-inset': 'var(--nm-inset)',
        'nm-inset-sm': 'var(--nm-inset-sm)',
        'nm-primary': '-4px -4px 10px rgba(255,255,255,0.4), 6px 6px 16px rgba(46,107,230,0.42)',
      },
      keyframes: {
        pop: {
          from: { opacity: '0', transform: 'translateY(18px) scale(.965)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadein: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        ovl: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        pop: 'pop .26s cubic-bezier(.34,1.4,.5,1)',
        fadein: 'fadein .3s ease',
        ovl: 'ovl .18s ease',
      },
    },
  },
  plugins: [],
};

export default config;
