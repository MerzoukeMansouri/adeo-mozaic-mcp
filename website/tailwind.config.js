/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Mozaic Primary-01 (Green - Brand Color)
        "primary-01": {
          100: "#EBF5DE",
          200: "#C5E39E",
          300: "#9ED05F",
          400: "#78BE20",
          500: "#46A610",
          600: "#188803",
          700: "#006902",
          800: "#035010",
          900: "#023618",
        },
        // Mozaic Primary-02 (Dark Blue/Grey)
        "primary-02": {
          100: "#EEEFF1",
          200: "#CFD2D8",
          300: "#B3B7C1",
          400: "#8F94A3",
          500: "#6A7081",
          600: "#494F60",
          700: "#343B4C",
          800: "#242938",
          900: "#171B26",
        },
        // Mozaic Secondary Blue
        "secondary-blue": {
          100: "#DAEFF7",
          200: "#A7D9ED",
          300: "#73C3E2",
          400: "#3FACD7",
          500: "#0B96CC",
          600: "#007BB4",
          700: "#005C91",
          800: "#003A5C",
          900: "#002A41",
        },
        // Mozaic Secondary Red (Danger)
        "secondary-red": {
          100: "#FDEAEA",
          200: "#F8BCBB",
          300: "#F38D8C",
          400: "#EF5F5C",
          500: "#EA302D",
          600: "#C61112",
          700: "#8C0003",
          800: "#530000",
          900: "#2D0000",
        },
        // Mozaic Secondary Purple
        "secondary-purple": {
          100: "#EFEBFE",
          200: "#C7B0FA",
          300: "#A575F3",
          400: "#883BE9",
          500: "#7000DD",
          600: "#5803B3",
          700: "#42058A",
          800: "#2E0663",
          900: "#1C053D",
        },
        // Mozaic Grey Scale
        grey: {
          "000": "#FFFFFF",
          100: "#E6E6E6",
          200: "#CCCCCC",
          300: "#B3B3B3",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4D4D4D",
          800: "#333333",
          900: "#191919",
          999: "#000000",
        },
        // Semantic aliases
        success: {
          100: "#EBF5DE",
          500: "#46A610",
          700: "#006902",
        },
        danger: {
          100: "#FDEAEA",
          500: "#EA302D",
          700: "#8C0003",
        },
        info: {
          100: "#DAEFF7",
          500: "#0B96CC",
          700: "#005C91",
        },
      },
      // Mozaic Spacing (Magic Unit based - 1mu = 16px)
      spacing: {
        mu025: "0.25rem",
        mu050: "0.5rem",
        mu075: "0.75rem",
        mu100: "1rem",
        mu125: "1.25rem",
        mu150: "1.5rem",
        mu175: "1.75rem",
        mu200: "2rem",
        mu250: "2.5rem",
        mu300: "3rem",
        mu350: "3.5rem",
        mu400: "4rem",
        mu500: "5rem",
        mu600: "6rem",
      },
      // Mozaic Font Sizes
      fontSize: {
        "mozaic-01": ["0.6875rem", { lineHeight: "1rem" }],
        "mozaic-02": ["0.75rem", { lineHeight: "1rem" }],
        "mozaic-03": ["0.8125rem", { lineHeight: "1.25rem" }],
        "mozaic-04": ["0.875rem", { lineHeight: "1.25rem" }],
        "mozaic-05": ["1rem", { lineHeight: "1.5rem" }],
        "mozaic-06": ["1.125rem", { lineHeight: "1.5rem" }],
        "mozaic-07": ["1.4375rem", { lineHeight: "2rem" }],
        "mozaic-08": ["1.75rem", { lineHeight: "2.5rem" }],
        "mozaic-09": ["2.125rem", { lineHeight: "2.5rem" }],
        "mozaic-10": ["2.5625rem", { lineHeight: "3rem" }],
        "mozaic-11": ["3.0625rem", { lineHeight: "3.5rem" }],
        "mozaic-12": ["3.6875rem", { lineHeight: "4rem" }],
      },
      borderRadius: {
        mozaic: "0.25rem",
        "mozaic-lg": "0.5rem",
      },
    },
  },
  plugins: [],
};
