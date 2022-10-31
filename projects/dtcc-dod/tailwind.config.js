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
        energy1: 'rgb(var(--color-energy-1) / <alpha-value>)', //'#009640', // note, these out commented codes are previous used codes for the swedish energy scale
        energy2: 'rgb(var(--color-energy-2) / <alpha-value>)', //'#50AF31',
        energy3: 'rgb(var(--color-energy-3) / <alpha-value>)', //'#C7D301',
        energy4: 'rgb(var(--color-energy-4) / <alpha-value>)', //'#FFED00',
        energy5: 'rgb(var(--color-energy-5) / <alpha-value>)', //'#FBB900',
        energy6: 'rgb(var(--color-energy-6) / <alpha-value>)', //'#EC6707',
        energy7: 'rgb(var(--color-energy-7) / <alpha-value>)', //'#E30613',
      }),
    },
  },
  plugins: [],
};
