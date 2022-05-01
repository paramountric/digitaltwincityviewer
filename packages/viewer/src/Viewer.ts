import { RootStore } from './store/RootStore';
class Viewer {
  store: RootStore;
  constructor(props) {
    this.store = new RootStore(props);
  }
}

export { Viewer };
