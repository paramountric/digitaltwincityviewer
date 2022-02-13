import { Viewer } from './Viewer';

function bootstrap() {
  new Viewer({
    longitude: 0,
    latitude: 0,
    xOffset: 2 ** 16,
    yOffset: 2 ** 16,
  });
}

export default bootstrap;
