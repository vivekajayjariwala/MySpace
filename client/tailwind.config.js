/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-bg': '#F7F7F9',
        'sidebar-bg': '#EDEDF0',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

