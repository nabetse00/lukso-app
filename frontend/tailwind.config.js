/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    darkTheme:"mytheme",
    themes: [
      {
        mytheme: {

          "primary": "#2563eb",

          "secondary": "#00ceff",

          "accent": "#f0abfc",

          "neutral": "#161107",

          "base-100": "#240000",

          "info": "#358eff",

          "success": "#00e206",

          "warning": "#fbbf24",

          "error": "#dc2626",
        },
      },
      "dark"],
  },
  plugins: [require("@tailwindcss/typography"), require('@tailwindcss/forms'), require("daisyui")],
}