import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WireDots strict palette
        brand: {
          red: "#E11D2A", // primary red
          redHover: "#B91020", // accent red hover
          dark: "#1A1A1A", // dark text
          border: "#EDEDED", // soft gray borders
        },
      },
      borderRadius: {
        xl: "0.9rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
      },
      maxWidth: {
        prose: "70ch",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
