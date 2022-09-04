/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-energy1',
    'bg-energy2',
    'bg-energy3',
    'bg-energy4',
    'bg-energy5',
    'bg-energy6',
    'bg-energy7',
  ],
  theme: {
    extend: {
      backgroundColor: theme => ({
        ...theme('colors'),
        energy1: '#009640',
        energy2: '#50AF31',
        energy3: '#C7D301',
        energy4: '#FFED00',
        energy5: '#FBB900',
        energy6: '#EC6707',
        energy7: '#E30613',
      }),
    },
  },
  plugins: [],
};
