import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aegis: {
          bg: '#050505',
          panel: 'rgba(20, 20, 20, 0.7)',
          accent: '#00ffcc',
          exception: '#ff3366'
        }
      },
    },
  },
  plugins: [],
};
export default config;