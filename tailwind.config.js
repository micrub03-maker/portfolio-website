/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFFDD0",
        malibu: "#84A4FC",
        sunsetSky: "#FFA07A",
        sunsetSun: "#FFD700", 
      },
      gradientColorStops: {
        'sunset': '#551764, #FFA07A',
      },
      transitionDuration: {
        '500': '0.5s',
      },
      backgroundImage: {
        'banner': "url('/sky.jpg')",
        'sky' : "url('../public/nightsky.jpg')",
      },
      fontFamily: {
        'sans': ['Lexend', 'sans-serif'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}

