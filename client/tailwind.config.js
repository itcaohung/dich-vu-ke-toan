/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        site: '1350px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

