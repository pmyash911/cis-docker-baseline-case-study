import type { Config } from "tailwindcss";

/**
 * Design tokens lifted verbatim from the Stitch project
 * "Yalgar Consulting Website Design" → Home - Yalgar Consulting screen.
 *
 * Typography: Source Serif 4 (display/headlines) + Source Sans 3 (body/labels).
 * Palette: ink navy (#00152d), warm paper (#fcf9f8), muted slate outlines.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00152d",
        "on-primary": "#ffffff",
        "primary-container": "#0b2a4a",
        "on-primary-container": "#7892b7",
        "inverse-primary": "#aec8f0",
        "primary-fixed": "#d3e4ff",
        "primary-fixed-dim": "#aec8f0",
        "on-primary-fixed": "#001c38",
        "on-primary-fixed-variant": "#2d486a",
        secondary: "#396090",
        "on-secondary": "#ffffff",
        "secondary-container": "#a3c9ff",
        "on-secondary-container": "#2c5483",
        "secondary-fixed": "#d3e3ff",
        "secondary-fixed-dim": "#a3c9ff",
        "on-secondary-fixed": "#001c39",
        "on-secondary-fixed-variant": "#1e4876",
        tertiary: "#241000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#412100",
        "on-tertiary-container": "#b8865a",
        "tertiary-fixed": "#ffdcc1",
        "tertiary-fixed-dim": "#f4bb8b",
        "on-tertiary-fixed": "#2e1500",
        "on-tertiary-fixed-variant": "#643e18",
        surface: "#fcf9f8",
        "surface-dim": "#dcd9d9",
        "surface-bright": "#fcf9f8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f6f3f2",
        "surface-container": "#f0eded",
        "surface-container-high": "#eae7e7",
        "surface-container-highest": "#e5e2e1",
        "on-surface": "#1c1b1b",
        "on-surface-variant": "#43474e",
        "inverse-surface": "#313030",
        "inverse-on-surface": "#f3f0ef",
        outline: "#74777f",
        "outline-variant": "#c4c6cf",
        background: "#fcf9f8",
        "on-background": "#1c1b1b",
        "surface-tint": "#466083",
        "surface-variant": "#e5e2e1",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "section-mobile": "3rem",
        "section-desktop": "6rem",
        "margin": "1rem",
        "margin-tablet": "2rem",
        "margin-desktop": "3rem",
        "gutter": "1.5rem",
        "gutter-desktop": "2rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
      },
      fontFamily: {
        display: ["var(--font-source-serif)", '"Source Serif 4"', "Georgia", "serif"],
        "display-mobile": [
          "var(--font-source-serif)",
          '"Source Serif 4"',
          "Georgia",
          "serif",
        ],
        "headline-lg": [
          "var(--font-source-serif)",
          '"Source Serif 4"',
          "Georgia",
          "serif",
        ],
        "headline-lg-mobile": [
          "var(--font-source-serif)",
          '"Source Serif 4"',
          "Georgia",
          "serif",
        ],
        "headline-md": [
          "var(--font-source-serif)",
          '"Source Serif 4"',
          "Georgia",
          "serif",
        ],
        "headline-sm": [
          "var(--font-source-serif)",
          '"Source Serif 4"',
          "Georgia",
          "serif",
        ],
        "body-md": ["var(--font-source-sans)", '"Source Sans 3"', "system-ui", "sans-serif"],
        "body-lg": ["var(--font-source-sans)", '"Source Sans 3"', "system-ui", "sans-serif"],
        "body-bold": [
          "var(--font-source-sans)",
          '"Source Sans 3"',
          "system-ui",
          "sans-serif",
        ],
        caption: ["var(--font-source-sans)", '"Source Sans 3"', "system-ui", "sans-serif"],
        "label-md": [
          "var(--font-source-sans)",
          '"Source Sans 3"',
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "body-md": ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "display-mobile": [
          "2.25rem",
          { lineHeight: "2.75rem", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        "headline-sm": ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        "headline-md": [
          "1.75rem",
          { lineHeight: "2.25rem", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem", fontWeight: "400" }],
        "body-bold": ["1rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "headline-lg-mobile": [
          "1.875rem",
          { lineHeight: "2.25rem", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-lg": [
          "2.5rem",
          { lineHeight: "3rem", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        caption: [
          "0.75rem",
          { lineHeight: "1rem", letterSpacing: "0.02em", fontWeight: "400" },
        ],
        "label-md": [
          "0.875rem",
          { lineHeight: "1.25rem", letterSpacing: "0.04em", fontWeight: "600" },
        ],
        display: [
          "3.5rem",
          { lineHeight: "4rem", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
