/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0F19',
          secondary: '#111827',
          card: '#1F2937'
        },
        accent: '#3B82F6',
        muted: '#9CA3AF',
        border: '#374151'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}