import { Viewer } from './Viewer.js';

const cities = [
  {
    longitude: 12.6945,
    latitude: 56.0465,
    name: 'Helsingborg',
  },
  {
    longitude: 11.9746,
    latitude: 57.7089,
    name: 'Göteborg',
  },
  {
    longitude: 12.9656,
    latitude: 55.591741,
    name: 'Malmö',
  },
];

window.addEventListener('load', () => {
  console.log('start in standalone mode (dev)');
  new Viewer({});
});
