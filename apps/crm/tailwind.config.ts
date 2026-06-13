import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        card: "#111114",
        border: "#27272a",
        muted: "#a1a1aa",
        brand: "#e11d48"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
export default config;
