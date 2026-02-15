/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Minimal B2B palette: light bg, dark text, restrained accent
        "venue-primary": "#111827",
        "venue-accent": "#111827",
        "venue-muted": "#6b7280",
        "venue-surface": "#fafafa",
        "venue-border": "#e5e7eb",
        "venue-success": "#059669",
        "venue-warning": "#d97706",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
      },
      maxWidth: {
        "content": "32rem",
        "wide": "42rem",
      },
    },
  },
  plugins: [],
};
