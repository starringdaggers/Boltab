import type { Config } from "tailwindcss";

// Boltab Brilliant Schools — design token system
// Palette: signature blue (#6967FB) + white, derived into a full tonal
// system for text/background/border legibility.
// Token names (bistre/antique/taupe/choc/vandyke) are historical from an
// earlier palette — kept as-is so no component code needs to change, they
// just resolve to these blue/white values now, in the same light-to-dark
// structural roles as before:
//   antique = lightest (backgrounds, white)  → taupe = muted periwinkle/borders
//   choc    = accent/CTA (signature #6967FB) → vandyke = secondary dark text
//   bistre  = darkest (primary/nav, deep indigo)
// Two functional accents (outside the core palette) are added ONLY for result status states.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bistre: {
          DEFAULT: "#2F2E71",
          light: "#4E4D86",
        },
        antique: {
          DEFAULT: "#FFFFFF",
          dim: "#F1F0FF",
        },
        taupe: {
          DEFAULT: "#A8A6E8",
          dark: "#8A87CE",
        },
        choc: {
          DEFAULT: "#6967FB",
          dark: "#5958D5",
        },
        vandyke: {
          DEFAULT: "#454390",
          light: "#6D6BB5",
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
        "ocean-sunset": "linear-gradient(160deg, #14132B 0%, #454390 55%, #6967FB 100%)",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
