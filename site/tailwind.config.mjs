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
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
