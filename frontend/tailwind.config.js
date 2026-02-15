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
        "venue-primary": "#1e3a5f",
        "venue-accent": "#d4af37",
        "venue-muted": "#6b7280",
        "venue-surface": "#f9fafb",
        "venue-border": "#e5e7eb",
      },
    },
  },
  plugins: [],
};
