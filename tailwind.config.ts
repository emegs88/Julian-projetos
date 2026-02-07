import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#DC2626",
          dark: "#B91C1C",
          light: "#EF4444",
        },
        dark: {
          DEFAULT: "#000000",
          light: "#1F1F1F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
