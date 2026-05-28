/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#CC785C',
        'primary-light': '#F5E8E0',
        'primary-foreground': '#ffffff',
        background: '#FAF9F5',
        surface: '#FFFFFF',
        foreground: '#1F1E1D',
        'muted-foreground': '#6B6862',
        border: '#E8E6DC',
        success: '#5C8D5C',
        'success-light': '#E8F2E8',
        warning: '#C89B3C',
        'warning-light': '#FDF3DC',
        danger: '#C44536',
        'danger-light': '#FDEAE8',
      },
    },
  },
  plugins: [],
};
