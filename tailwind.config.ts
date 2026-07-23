import type { Config } from "tailwindcss";

// Boltab Brilliant Schools — design token system
// Palette: built entirely from "Ocean Sunset" (#0F2027 → #2C5364), no blue.
// Token names (bistre/antique/taupe/choc/vandyke) are historical from an
// earlier palette — kept as-is so no component code needs to change, they
// just resolve to these teal/neutral values now, in the same light-to-dark
// structural roles as before:
//   antique = lightest (warm neutral backgrounds) → taupe = muted teal-grey/borders
//   choc    = accent/CTA (gradient's light stop)   → vandyke = secondary dark (mid-teal)
//   bistre  = darkest (primary/nav, gradient's dark stop)
// Two functional accents (outside the core palette) are added ONLY for result status states.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bistre: {
          DEFAULT: "#0F2027",
          light: "#16303B",
        },
        antique: {
          DEFAULT: "#F4F2ED",
          dim: "#EAE6DD",
        },
        taupe: {
          DEFAULT: "#7C97A0",
          dark: "#66808A",
        },
        choc: {
          DEFAULT: "#2C5364",
          dark: "#234353",
        },
        vandyke: {
          DEFAULT: "#1D3A46",
          light: "#274957",
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
        "ocean-sunset": "linear-gradient(160deg, #0F2027 0%, #2C5364 100%)",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
