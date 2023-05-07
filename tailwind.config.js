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
      paragraph: "20px",
      h3: "24px",
      h2: "34px",
      h1: "64px",
      title: "",
    },
    colors: {
      green: "#0C7D01",
      tan: "EEEDE6",
      white: "FFFFFF",
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
