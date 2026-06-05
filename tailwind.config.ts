import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF8",
        ink: "#1A1A18",
        muted: "#6B6B5F",
        line: "#E2E0D8",
        accent: "#534AB7"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        serif: ["var(--font-body)", "serif"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(26, 26, 24, 0.08)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(26,26,24,0.08) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
