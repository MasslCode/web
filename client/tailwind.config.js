/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(167, 139, 250, 0.7)' }, // violet-400
          '50%': { borderColor: 'rgba(236, 72, 153, 0.9)' }, // fuchsia-500
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(167, 139, 250, 0.5)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(236, 72, 153, 0.8)' },
        },
      },
      animation: {
        'pulse-border': 'pulseBorder 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
