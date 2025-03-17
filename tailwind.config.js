/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,jsx,tsx,ts}'],
  theme: {
    extend: {
      // that is animation class
      animation: {
        fade: 'fadeOut 1s ease-in-out',
      },
    },
  },
  plugins: [import('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake', 'retro', 'cyberpunk', 'aqua'],
  },
}
