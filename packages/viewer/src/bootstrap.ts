import { Viewer } from './Viewer';

function bootstrap() {
  new Viewer({
    xMin: 0,
    yMin: 0,
    xMax: 2 ** 16,
    yMax: 2 ** 16,
  });
}

export default bootstrap;
