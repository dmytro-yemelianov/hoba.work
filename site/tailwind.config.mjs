/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hoba: {
          bg: '#0a0c10',
          card: '#12161f',
          border: '#1f2633',
          hover: '#181f2c',
          text: '#e6edf3',
          muted: '#8b949e',
          accent: '#58a6ff',
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
