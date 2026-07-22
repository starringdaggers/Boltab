import type { Config } from "tailwindcss";

// Boltab Brilliant Schools — design token system
// Palette source: "Starla" blues (#021024 → #C1E8FF), applied by Claude.
// Token names (bistre/antique/taupe/choc/vandyke) are historical from the
// original brown palette — they're kept as-is here so no component code
// needs to change, they just now resolve to the blue values below, in the
// same light-to-dark structural roles as before:
//   antique = lightest (backgrounds)   → taupe = muted/borders
//   choc    = accent/CTA               → vandyke = secondary dark
//   bistre  = darkest (primary/nav)
// Two functional accents (outside the core palette) are added ONLY for result status states.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bistre: {
          DEFAULT: "#021024",
          light: "#0A2340",
        },
        antique: {
          DEFAULT: "#C1E8FF",
          dim: "#A9D9F5",
        },
        taupe: {
          DEFAULT: "#7DA0CA",
          dark: "#6890BC",
        },
        choc: {
          DEFAULT: "#5483B3",
          dark: "#3F6690",
        },
        vandyke: {
          DEFAULT: "#052659",
          light: "#0C3670",
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
