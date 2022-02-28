import { Viewer } from './Viewer';

// todo: make proper city entities (multi-language support, ids, metadata, stat props)
const cities = [
  {
    lon: 12.6945,
    lat: 56.0465,
    radius: 5000, // in meters, to determine extent
    name: 'Helsingborg',
  },
  {
    lon: 11.9746,
    lat: 57.7089,
    radius: 9000, // in meters, to determine extent
    name: 'Göteborg',
  },
];

function bootstrap() {
  const onInit = () => {
    viewer.update({});
  };
  const viewer = new Viewer({
    onInit,
    ...cities[0],
    sources: [
      {
        id: 'test-box-source',
        type: 'custom',
        layers: [
          {
            id: 'box-layer',
            type: 'box',
            data: [
              {
                x: 0,
                y: 0,
                z: 0,
                w: 1,
                h: 1,
              },
            ],
          },
        ],
      },
    ],
  });
}

export default bootstrap;
