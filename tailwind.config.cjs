/** @type {import('tailwindcss').Config}*/
const colors = require('tailwindcss/colors')
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}", './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        primary: colors.indigo
      },
    },
  },

  plugins: [require('flowbite/plugin')],
};

module.exports = config;
