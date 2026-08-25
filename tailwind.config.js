/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1C2321",
        paper: "#ECF0EE",
        card: "#FFFFFF",
        line: "#D8DED9",
        indigo: {
          DEFAULT: "#3454D1",
          dark: "#28409E",
          light: "#E8ECFB",
        },
        amber: {
          DEFAULT: "#E8A33D",
          dark: "#B87A22",
          light: "#FCEFDA",
        },
        teal: {
          DEFAULT: "#2F7767",
          dark: "#215A4D",
          light: "#DEEFEA",
        },
        brick: {
          DEFAULT: "#C4534B",
          dark: "#9C3F39",
          light: "#F7E3E1",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
}
