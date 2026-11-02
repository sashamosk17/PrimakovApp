/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#6c0c08",
        "primary-container": "#8c251c",
        "primary-light": "#ffdad5",
        "on-primary": "#ffffff",
        "surface": "#f9f9fb",
        "surface-container": "#eeeef0",
        "surface-container-low": "#f3f3f5",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e8e8ea",
        "surface-container-highest": "#e2e2e4",
        "on-surface": "#1a1c1d",
        "on-surface-variant": "#57423e",
        "secondary": "#5f5e5e",
        "outline": "#8b716d",
        "outline-variant": "#dec0bb",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}

