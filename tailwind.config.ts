import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // Condensed athletic display face (Oswald) for headings + numbers.
        display: [
          "var(--font-display)",
          "Oswald",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        // Collegiate charcoal for the shell / sidebar
        ink: {
          DEFAULT: "#13171F",
          900: "#0E1117",
          800: "#171C26",
          700: "#222937",
          600: "#323B4D",
          500: "#4A5468",
        },
        // SCAD black-and-gold — brighter, more confident gold; dark end kept
        // legible for gold text on the warm paper background.
        brand: {
          50: "#FFF9E6",
          100: "#FCEFC1",
          200: "#F7DD8C",
          300: "#F1C84A",
          400: "#EAB308",
          500: "#D49A06",
          600: "#B07D07",
          700: "#8A6309",
          800: "#6E4F10",
          900: "#5A4112",
        },
        // Warm "paper" neutrals — replaces the cold default slate background
        paper: {
          DEFAULT: "#F4F1E9",
          50: "#FBF9F4",
          100: "#F0ECE0",
          200: "#E5DFD0",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)",
        soft: "0 4px 16px -4px rgb(16 24 40 / 0.10)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "sheet-down": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        // route-change entrance for the main content area
        "page-enter": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        // opacity-only fade for page transitions / overlays / accents
        "fade-in": "fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        // the workhorse entrance: rise + fade with a soft decelerate
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        // springy scale for dialogs / taps
        pop: "pop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        // mobile bottom-sheet slide
        "sheet-up": "sheet-up 0.34s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-down": "sheet-down 0.24s cubic-bezier(0.4, 0, 1, 1) both",
        "fade-out": "fade-out 0.22s ease-in both",
        float: "float 4s ease-in-out infinite",
        "page-enter": "page-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
