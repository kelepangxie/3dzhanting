/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 田园展厅色板（清新稻田）
        rice: { DEFAULT: "#F6F2E7", light: "#FAF7EE", dark: "#EFE7D4" },
        field: { DEFAULT: "#4C7A4E", dark: "#2F5233", light: "#7FAE7A" },
        wheat: { DEFAULT: "#C9A227", light: "#E9D9A8" },
        wood: { DEFAULT: "#8A6A4F", dark: "#6B4F3A", light: "#A98963" },
        grass: { DEFAULT: "#A9C79A", dark: "#8FB383" },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', '"STSong"', '"SimSun"', "Georgia", "serif"],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
      },
      keyframes: {
        sway: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        sway: "sway 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
