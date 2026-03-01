import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          black:  '#0B0B0D',
          blue:   '#6B8DF2',
          indigo: '#5A73BF',
          slate:  '#2F3940',
          cyan:   '#91CCD9',
        },
      },
    },
  },
  plugins: [],
};
export default config;
