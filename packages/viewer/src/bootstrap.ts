import { RootStore } from './RootStore';

// These are some settings used for dev, will be removed when it's figured out how to boot viewers from city presets
// todo: make proper city entities (multi-language support, ids, metadata, stat props)
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

function bootstrap() {
  new RootStore();
}

export default bootstrap;
