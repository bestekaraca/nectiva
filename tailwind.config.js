/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0A0813",   // ana arka plan
        panel: "#15101F",   // kart / yükseltilmiş yüzey (opacity ile cam efekti)
        ivory: "#F4F1FB",   // birincil metin
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(139,92,246,0.45), 0 0 44px rgba(59,130,246,0.22)",
        "glow-lg": "0 0 34px rgba(139,92,246,0.55), 0 0 72px rgba(59,130,246,0.3)",
        "glow-sm": "0 0 12px rgba(139,92,246,0.35)",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 18px rgba(139,92,246,0.4), 0 0 38px rgba(59,130,246,0.18)" },
          "50%": { boxShadow: "0 0 30px rgba(139,92,246,0.7), 0 0 64px rgba(59,130,246,0.32)" },
        },
        blobMove: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(40px, -50px) scale(1.12)" },
          "66%": { transform: "translate(-30px, 30px) scale(0.92)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        glowPulse: "glowPulse 2.4s ease-in-out infinite",
        blob: "blobMove 14s ease-in-out infinite",
        blobSlow: "blobMove 19s ease-in-out infinite reverse",
        gradientShift: "gradientShift 6s ease infinite",
      },
    },
  },
  plugins: [],
}
