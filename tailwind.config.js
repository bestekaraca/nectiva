/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0A0813",   // sadece koyu kenar çubuğu (sidebar) için
        panel: "#15101F",   // koyu vurgu yüzeyi (sidebar aktif öğe vb.)
        ivory: "#F4F1FB",   // koyu yüzeyler üstündeki açık metin (sidebar)
        paper: "#F8F7FC",   // ANA açık arka plan
        ink: "#1E1B2E",     // ANA koyu metin (açık yüzeyler için)
        card: "#FFFFFF",    // beyaz kart yüzeyi
        mist: "#E9E5F6",    // açık kenarlık/ayraç tonu
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(139,92,246,0.35), 0 0 44px rgba(59,130,246,0.18)",
        "glow-lg": "0 8px 40px rgba(139,92,246,0.22), 0 0 70px rgba(59,130,246,0.14)",
        "glow-sm": "0 0 14px rgba(139,92,246,0.28)",
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
        shimmer: {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "150% 0" },
        },
      },
      animation: {
        glowPulse: "glowPulse 2.4s ease-in-out infinite",
        blob: "blobMove 14s ease-in-out infinite",
        blobSlow: "blobMove 19s ease-in-out infinite reverse",
        gradientShift: "gradientShift 6s ease infinite",
        shimmer: "shimmer 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
