/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hoba: {
          // Theme-aware surfaces (see src/styles/theme.css)
          bg: token('bg'),
          card: token('card'),
          border: token('border'),
          hover: token('hover'),
          text: token('text'),
          muted: token('muted'),
          accent: token('accent'),
          // Entity hues (fixed; legible on both themes)
          candidate: '#2ea043',
          intermediary: '#d29922',
          exogenous: '#f85149',
          artifact: '#a371f7',
          barrier: '#3fb950',
          mechanism: '#58a6ff',
          pattern: '#f0883e',
          loop: '#db61a2',
          intervention: '#1f6feb',
        },
      },
      // Gentle scale: 13 / 14 / 16 / 18 / 20 / 24 / 28 — no large jumps, nothing below 13px.
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.875rem', { lineHeight: '1.375rem' }],
        base: ['1rem', { lineHeight: '1.6rem' }],
        lg: ['1.125rem', { lineHeight: '1.65rem' }],
        xl: ['1.25rem', { lineHeight: '1.7rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.9rem' }],
        '3xl': ['1.75rem', { lineHeight: '2.1rem' }],
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
