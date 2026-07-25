export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0fdfc',
          600: '#0f766e',
          700: '#0d6760',
          800: '#0b5355',
          900: '#134e4d',
        },
        secondary: {
          500: '#ec7b3d',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
