import type { Config } from "tailwindcss";

// Boltab Brilliant Schools — design token system
// Palette: forest green (#051F20 → #DAF1DE), 6-stop scale.
// Token names (bistre/antique/taupe/choc/vandyke) are historical from an
// earlier palette — kept as-is so no component code needs to change, they
// just resolve to these green/neutral values now, in the same light-to-dark
// structural roles as before:
//   antique = lightest (backgrounds)     → taupe = muted sage/borders
//   choc    = accent/CTA                 → vandyke = secondary dark
//   bistre  = darkest (primary/nav)
// Two functional accents (outside the core palette) are added ONLY for result status states.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bistre: {
          DEFAULT: "#051F20",
          light: "#0B2B26",
        },
        antique: {
          DEFAULT: "#FFFFFF",
          dim: "#F2F2F2",
        },
        taupe: {
          DEFAULT: "#8EB69B",
          dark: "#729C82",
        },
        choc: {
          DEFAULT: "#235347",
          dark: "#1A3F36",
        },
        vandyke: {
          DEFAULT: "#163832",
          light: "#1D4941",
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
      backgroundImage: {
        "ocean-sunset": "linear-gradient(160deg, #051F20 0%, #163832 55%, #235347 100%)",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
