/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        energy: {
          1: '#009640',
          2: '#50AF31',
          3: '#C7D301',
          4: '#FFED00',
          5: '#FBB900',
          6: '#EC6707',
          7: '#E30613',
        },
      },
    },
  },
  plugins: [],
};
