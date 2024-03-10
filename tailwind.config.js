/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        title: "2rem", // 32px
        h1: "3rem", // 48px
        h2: "1.5rem", // 24px
        p: "0.875rem", // 14px
      },
      colors: {
        "brand-dark": "#1f1f1f",
        "brand-dark-gray": "#999999",
        "brand-light-gray": "#c4c4c4",
        "brand-light": "#ffffff",
        "brand-accent": {
          100: "#fee2e2",
          500: "#f87171",
          900: "#7f1d1d",
        },
        "brand-selected": "#ffcb00",
      },
      backdropFilter: {
        none: "none",
        blur: "blur(16px)",
      },
    },
  },
  plugins: [require("tailwindcss-filters")],
};
