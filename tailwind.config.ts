import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./features/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: "#006A71",
        coral: "#F26B5E",
        ink: "#172026",
        mist: "#F4F7F8"
      }
    }
  },
  plugins: []
};

export default config;