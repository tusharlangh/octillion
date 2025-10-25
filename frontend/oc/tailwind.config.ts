import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#0B0B0C",
          surface: "#1C1C1E",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1A1",
        },
        border: {
          subtle: "#2C2C2E",
        },
        state: {
          hover: "rgba(255,255,255,0.06)",
          active: "rgba(255,255,255,0.12)",
        },
        brand: {
          accent: "#007AFF",
        },
        button: {
          disabled: "#8E8E93",
        },
      },
    },
  },
  plugins: [],
};

export default config;
