import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'venue-primary': '#1e3a5f',
        'venue-accent': '#d4af37',
        'venue-muted': '#6b7280',
        'venue-surface': '#f9fafb',
        'venue-border': '#e5e7eb',
      },
    },
  },
  plugins: [],
}
export default config
