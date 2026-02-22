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
        // Modern mall/food-court palette — soft neutrals, blue primary
        "venue-primary": "#2563EB",
        "venue-foreground": "#111827",
        "venue-muted": "#6B7280",
        "venue-surface": "#F9FAFB",
        "venue-border": "#E5E7EB",
        "venue-success": "#16A34A",
        "venue-warning": "#F59E0B",
        "venue-danger": "#DC2626",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        "card-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      maxWidth: {
        "content": "32rem",
        "wide": "42rem",
      },
    },
  },
  plugins: [],
};
