const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: ".",
      content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    },
  },
};

export default config;
