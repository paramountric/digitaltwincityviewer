import { RootStore } from './store/RootStore';

type ViewerProps = {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  container?: HTMLElement | string;
};
class Viewer {
  store: RootStore;
  constructor(props) {
    this.store = new RootStore(props);
  }
}

export { Viewer, ViewerProps };
