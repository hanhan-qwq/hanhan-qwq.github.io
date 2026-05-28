/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "#F5F5DC",
        "paper-card": "#FFFDF1",
        "paper-text": "#2B2B2B",
        "paper-muted": "#66615A",
        "marker-red": "#ff006e",
        "marker-teal": "#4ecdc4",
        "marker-yellow": "#ffd93d",
        chalkboard: "#141C18",
        "chalk-card": "#18221D",
        "chalk-text": "#E0EAE5",
        "chalk-border": "#8BE4A0",
        "chalk-muted": "#8A9C93",
        "chalk-pink": "#FF8EA6",
        "chalk-green": "#8BE4A0",
        "chalk-yellow": "#FDF28D",
      },
      fontFamily: {
        display: [
          "Fusion Pixel 12px Proportional SC",
          "Pixelify Sans",
          "Press Start 2P",
          "sans-serif",
        ],
        prose: ["Noto Sans SC", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
