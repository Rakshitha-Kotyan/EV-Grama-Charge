/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00D4FF",    // Electric Blue
        secondary: "#00FF88",  // Electric Green
        dark: "#0A0E1A",       // Dark background
        card: "#111827",       // Card background
        border: "#1F2937",     // Border color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}