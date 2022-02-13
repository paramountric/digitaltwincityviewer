import { Viewer } from './Viewer';

function bootstrap() {
  const onInit = () => {
    viewer.update({});
  };
  const viewer = new Viewer({
    onInit,
    longitude: 11.9746,
    latitude: 57.7089,
    xOffset: 2 ** 16,
    yOffset: 2 ** 16,
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
