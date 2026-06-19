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
        // SCAD black-and-gold
        brand: {
          50: "#FBF6E9",
          100: "#F6EAC8",
          200: "#EFD89B",
          300: "#E6C264",
          400: "#DCAB3A",
          500: "#C8920C",
          600: "#A8790A",
          700: "#86600C",
          800: "#6E4F11",
          900: "#5E4413",
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
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
