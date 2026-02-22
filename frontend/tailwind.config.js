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
        // Premium B2B SaaS palette — slate-900 primary, blue accent
        "venue-primary": "#0F172A",
        "venue-foreground": "#0F172A",
        "venue-accent": "#2563EB",
        "venue-muted": "#64748B",
        "venue-surface": "#F8FAFC",
        "venue-border": "#E2E8F0",
        "venue-success": "#22C55E",
        "venue-warning": "#F59E0B",
        "venue-danger": "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
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
