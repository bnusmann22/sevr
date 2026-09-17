/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        tlp: {
          clear: { bg: "#f1f5f9", text: "#1e293b", border: "#cbd5e1" },
          green: { bg: "rgba(16, 185, 129, 0.1)", text: "#047857", border: "#10b981" },
          amber: { bg: "rgba(245, 158, 11, 0.1)", text: "#b45309", border: "#f59e0b" },
          amberStrict: { bg: "rgba(249, 115, 22, 0.1)", text: "#c2410c", border: "#ea580c" },
          red: { bg: "rgba(244, 63, 94, 0.1)", text: "#be123c", border: "#f43f5e" },
        },
      },
    },
  },
  plugins: [],
};

