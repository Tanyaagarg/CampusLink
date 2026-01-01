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
        background: "var(--background)",
        foreground: "var(--foreground)",
        neon: {
          blue: "#0088ff",
          green: "#00ff9d",
          purple: "#bf00ff",
        },
        dark: {
          bg: "#050505",
          card: "#111111",
          border: "#222222",
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
