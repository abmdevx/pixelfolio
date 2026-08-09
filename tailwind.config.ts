import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          950: "#120f16",
          900: "#1a1523",
          800: "#241d30",
          700: "#372c46",
          600: "#4a3d5c",
          500: "#6b5a80",
        },
        stone: {
          400: "#a8a2b5",
          300: "#c9c3d4",
        },
        parchment: {
          100: "#f4ecd8",
          200: "#e9dcbd",
        },
        ember: {
          400: "#f0a63d",
          500: "#e8a33d",
          600: "#c97a2c",
        },
        blood: {
          500: "#b23a48",
          600: "#8f2836",
        },
        moss: {
          400: "#5fb583",
          500: "#4fae7a",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        body: ["var(--font-body)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0 0 rgba(0,0,0,0.6)",
        "pixel-sm": "2px 2px 0 0 rgba(0,0,0,0.6)",
      },
      keyframes: {
        "blink-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-3px)" },
        },
        "panel-in": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "loader-sweep": {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(320%)" },
        },
        "lid-creak": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(-8deg)" },
        },
      },
      animation: {
        "blink-soft": "blink-soft 1.6s steps(2, start) infinite",
        "float-y": "float-y 2.4s ease-in-out infinite",
        "panel-in": "panel-in 0.16s steps(6, end)",
        "loader-sweep": "loader-sweep 1.1s ease-in-out infinite",
        "lid-creak": "lid-creak 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
