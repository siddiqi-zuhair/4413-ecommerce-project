import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      scrollbar: {
        hide: {
          'scrollbar-width': 'none', /* Firefox */
          '-ms-overflow-style': 'none',  /* Internet Explorer and Edge */
          'overflow': 'hidden', /* Hide scrollbar for Chrome, Safari and Opera */
        },
        show: {
          'scrollbar-width': 'auto', /* Firefox */
          '-ms-overflow-style': 'auto',  /* Internet Explorer and Edge */
          'overflow': 'auto', /* Show scrollbar for Chrome, Safari and Opera */
        },
      },
    },
  },
  plugins: [],
};
export default config;
