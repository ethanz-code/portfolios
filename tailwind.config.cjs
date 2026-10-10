/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,md,mdx,ts}"],
  darkMode: ["class", "[data-theme=black]"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["light", "black"],
    darkTheme: "black", // name of the included theme used for dark mode
    logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
  },
};
