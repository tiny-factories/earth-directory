/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: [
        "Inter var, sans-serif",
        {
          fontFeatureSettings:
            '"zero", "ss01" , "dlig", "ccmp", "frac", "calt", "tnum", "case"',
        },
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Helvetica",
        "Arial",
      ],
      satoshi: [
        "Satoshi var",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Helvetica",
        "Arial",
      ],
      serif: ["ui-serif", "Georgia"],
      mono: ["Fira Code", "ui-monospace", "SFMono-Regular"],
    },
    fontSize: {
      caption: "0.8rem",
      paragraph: "1rem",
      h5: "1.25rem",
      h4: "1.563rem",
      h3: "1.953rem",
      h2: "2.441rem",
      h1: "3.052rem",
    },
    colors: {
      green: "#0C7D01",
    },
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
