import type { Config } from "tailwindcss";

// Boltab Brilliant Schools — design token system
// Palette source: Bistre / Antique White / Pale Taupe / Milk Chocolate / Van Dyke Brown
// Two functional accents (outside the core palette) are added ONLY for result status states.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bistre: {
          DEFAULT: "#372414",
          light: "#4A3320",
        },
        antique: {
          DEFAULT: "#F7EBDF",
          dim: "#EFDFCE",
        },
        taupe: {
          DEFAULT: "#B7A087",
          dark: "#9C876C",
        },
        choc: {
          DEFAULT: "#825A3C",
          dark: "#6E4B32",
        },
        vandyke: {
          DEFAULT: "#674831",
          light: "#7A5A40",
        },
        // Functional accents — used ONLY for grade/result states, never as brand color
        status: {
          pass: "#4C7A5E",
          warn: "#B08B3A",
          fail: "#B0483A",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-worksans)", "sans-serif"],
        mono: ["var(--font-plexmono)", "monospace"],
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
