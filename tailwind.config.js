/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      serif: ['Merriweather', 'serif']
    },
    extend: {
      colors: {
        'primary': '#3C61AA',
        'text-primary': '#FFFFFF'
      }
    },
  },
  plugins: [],
}

