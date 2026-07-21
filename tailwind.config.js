/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        aurora: {
          violet: '#8B5CF6',
          cyan: '#22D3EE',
          emerald: '#34D399',
          pink: '#F472B6',
          amber: '#FBBF24',
        },
        ink: {
          950: '#05060D',
          900: '#090B16',
          800: '#0F1220',
        },
      },
    },
  },
  plugins: [],
}
