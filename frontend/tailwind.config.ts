import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        qubi: {
          purple: "#7C3AED",
          "purple-light": "#A78BFA",
          green: "#22C55E",
          "green-dark": "#16A34A",
          sidebar: "#141418",
          sidebarHover: "#232329",
          sidebarBorder: "#2A2A32",
          surface: "#FAFAFA",
          chat: "#FFFFFF",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        app: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.04)",
        input: "0 4px 24px rgba(0, 0, 0, 0.06)",
        bubble: "0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      maxWidth: {
        chat: "820px",
        app: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
