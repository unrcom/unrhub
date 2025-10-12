/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "light-bg": "#ffffff",
        "light-surface": "#f8f9fa",
        "light-text": "#212529",
        "light-text-secondary": "#6c757d",
        "light-border": "#dee2e6",
        "dark-bg": "#0f172a",
        "dark-surface": "#1e293b",
        "dark-text": "#f1f5f9",
        "dark-text-secondary": "#94a3b8",
        "dark-border": "#334155",
        accent: "#17a2b8",
        "accent-hover": "#138496",
        "accent-dark-hover": "#1dbfdb",
      },
    },
  },
  plugins: [],
};
