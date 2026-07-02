import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Linear Dark Premium palette (hardcoded hex tokens)
        brand: {
          DEFAULT: "#5e6ad2",
          hover: "#7170ff",
          light: "#828fff",
        },
        surface: {
          black: "#08090a",
          panel: "#0f1011",
          elevated: "#191a1b",
        },
        text: {
          primary: "#f7f8f8",
          secondary: "#d0d6e0",
          muted: "#8a8f98",
          subtle: "#62666d",
        },
        status: {
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#3b82f6",
        },
        // Keep slate as fallback
        border: {
          subtle: "rgba(255,255,255,0.05)",
          DEFAULT: "rgba(255,255,255,0.08)",
          active: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-hero": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.035em", fontWeight: "300" }],
        "display": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.022em", fontWeight: "300" }],
        "h1": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.022em" }],
        "h2": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.012em" }],
        "h3": ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.012em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "300" }],
      },
      borderRadius: {
        "button": "6px",
        "card": "8px",
        "panel": "12px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(94,106,210,0.4)" },
          "50%": { boxShadow: "0 0 0 4px rgba(94,106,210,0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
