/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0e14',
          900: '#0f1520',
          850: '#131b28',
          800: '#1a2332',
          700: '#26324a',
          600: '#3a4a68'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
