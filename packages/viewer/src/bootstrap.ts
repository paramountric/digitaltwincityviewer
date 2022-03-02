import { Viewer } from './Viewer';

// todo: make proper city entities (multi-language support, ids, metadata, stat props)
const cities = [
  {
    cityLon: 12.6945,
    cityLat: 56.0465,
    cityExtentRadius: 5000, // in meters, to determine extent
    name: 'Helsingborg',
  },
  {
    cityLon: 11.9746,
    cityLat: 57.7089,
    cityExtentRadius: 10000, // in meters, to determine extent
    name: 'Göteborg',
  },
];

function bootstrap() {
  const onInit = () => {
    viewer.update({});
  };
  const viewer = new Viewer({
    onInit,
    center: [0, 0],
    zoom: 0,
    cameraPitch: 0,
    cameraBearing: 0,
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
                w: 100,
                h: 100,
              },
            ],
          },
        ],
      },
    ],
  });
}

export default bootstrap;
