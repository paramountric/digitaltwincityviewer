import { makeObservable, observable, action } from 'mobx';
import {
  Viewer,
  ViewerProps,
  UpdateLayerProps,
  generateColor,
} from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';
// import { module as noise } from './noise';

const env = process.env.NODE_ENV;
const websocketUrl =
  env === 'production'
    ? 'wss://pmtric.com/dtcv/ws'
    : env === 'localhost'
    ? 'ws://localhost:4000'
    : 'wss://pmtric-local.com/dtcv/ws';

type Layer = {
  name: string;
  isLoading: boolean;
};
export class Store {
  public isLoading = false;
  public showUiComponents: {
    [uiComponentKey: string]: boolean;
  };
  public activeLayer: string | null;
  public viewer: Viewer;
  private socket: WebSocket;
  public layers: Layer[] = [];
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.showUiComponents = {
      leftMenu: true,
      layerDialog: false,
    };
    makeObservable(this, {
      isLoading: observable,
      showUiComponents: observable,
      layers: observable,
      setIsLoading: action,
      addLayer: action,
      showUiComponent: action,
    });
    this.init();
  }

  public setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  public showUiComponent(key: string, show: boolean) {
    this.showUiComponents[key] = show;
  }

  public reset() {
    this.viewer.setSelectedObject(null);
    this.viewer.unload();
  }

  public render() {
    this.viewer.render();
  }

  public addLayer(layer: Layer) {
    this.layers.push(layer);
  }

  public updateLayer(layerData: Layer) {
    const layer = this.layers.find(l => l.name === layerData.name);
    layer.isLoading = layerData.isLoading;
  }

  public setActiveLayer(layerName: string) {
    this.activeLayer = layerName;
  }

  async init() {
    await this.connectToWebsocket();
    // await this.loadTestData(
    //   'http://localhost:9000/files/HelsingborgOceanen/GroundSurface.json',
    //   'ground-layer-surface-mesh',
    //   'ground'
    // );
    // await this.loadTestData(
    //   'http://localhost:9000/files/HelsingborgOceanen/CityModel.json',
    //   'buildings-layer-polygons-lod-1',
    //   'buildings'
    // );

    await this.getCachedLayer(
      'http://localhost:4000/cache?http://localhost:9000/files/HelsingborgOceanen/CityModel.pb',
      'buildings-layer-polygons-lod-1',
      'buildings'
    );

    this.addLayer({
      name: 'Buildings',
      isLoading: true,
    });

    await this.getCachedLayer(
      'http://localhost:4000/cache?http://localhost:9000/files/HelsingborgOceanen/GroundSurface.pb',
      'ground-layer-surface-mesh',
      'ground'
    );

    this.addLayer({
      name: 'Ground surface',
      isLoading: true,
    });

    await this.getCachedLayer(
      'http://localhost:4000/cache?http://localhost:9000/files/HelsingborgOceanen/FlowField.pb',
      'ground-layer-result-mesh',
      'surfaceField'
    );

    this.addLayer({
      name: 'Simulation result',
      isLoading: true,
    });

    setTimeout(() => {
      this.updateLayer({ name: 'Buildings', isLoading: false });
      this.updateLayer({ name: 'Ground surface', isLoading: false });
      this.updateLayer({ name: 'Simulation result', isLoading: false });
    }, 1000);

    // await this.loadLayerData(
    //   'http://localhost:9000/files/movement/Haga.json',
    //   'movement-layer',
    //   {
    //     bearing: 26.92866082603254,
    //     latitude: 57.68707775219609,
    //     longitude: 11.946664730624665,
    //     pitch: 37.6264395061573,
    //     zoom: 12.711646498498286,
    //   }
    // );
  }

  async getCachedLayer(url, layerId, key) {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
    this.viewer.updateLayer({
      layerId,
      props: {
        data: data[key].data,
        modelMatrix: data[key].modelMatrix,
        //center: parsed[key].center,
      },
      state: {
        url,
      },
    });
  }

  // This is a debug functino for messing with colors, to be removed
  // async getResultLayer(url, layerId, key) {
  //   const res = await fetch(url);
  //   const data = await res.json();

  //   noise.seed(454);
  //   const vertices = data[key].data.vertices;

  //   const size = Math.sqrt(vertices.length);
  //   const colors = [];
  //   for (var x = 0; x < size; x++) {
  //     for (var y = 0; y < size; y++) {
  //       var value = noise.simplex2(x / 200, y / 200);
  //       var value2 = noise.simplex2(y / 200, x / 200);
  //       var value3 = noise.simplex2(x / 100, y / 100);

  //       colors.push(value2 + 2 / 2, value3 + 2 / 2, value + 2 / 2, 0.2);
  //       //colors[x][y].r = Math.abs(value) * 256; // Or whatever. Open demo.html to see it used with canvas.
  //     }
  //   }

  //   data[key].data.colors = colors;

  //   // const colors = data[key].data.vertices.reduce((acc, i) => {
  //   //   acc.push(1, 1, 0, 1);
  //   //   return acc;
  //   // }, []);
  //   // data[key].data.colors = colors;

  //   // console.log(data[key].data);

  //   this.viewer.updateLayer({
  //     layerId,
  //     props: {
  //       data: data[key].data,
  //       modelMatrix: data[key].modelMatrix,
  //       //center: parsed[key].center,
  //     },
  //     state: {
  //       url,
  //     },
  //   });
  // }

  async loadTestData(url, layerId, key) {
    const res = await fetch(url);
    if (res.status !== 200) {
      return console.warn('response status: ', res.status);
    }
    const parsed = parseCityModel(await res.json());
    this.viewer.updateLayer({
      layerId,
      props: {
        data: parsed[key].data,
        modelMatrix: parsed[key].modelMatrix,
        //center: parsed[key].center,
      },
      state: {
        url,
      },
    });
  }

  // async loadLayerData(url, layerId, viewState) {
  //   const res = await fetch(url);
  //   if (res.status !== 200) {
  //     return console.warn('response status: ', res.status);
  //   }
  //   const data = await res.json();
  //   console.log(data);
  //   this.viewer.updateLayer({
  //     layerId,
  //     props: {
  //       data: data.features,
  //     },
  //     state: {
  //       url,
  //     },
  //   });
  //   // this.viewer.viewStore.setViewState(viewState);
  //   // this.viewer.maplibreMap.setCenter([
  //   //   viewState.longitude,
  //   //   viewState.latitude,
  //   // ]);
  //   // this.viewer.maplibreMap.setZoom(viewState.zoom);
  //   this.viewer.render();
  // }

  sendMessage(topic: string, message: any) {
    this.socket.send(JSON.stringify({ topic, message }));
  }

  connectToWebsocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(websocketUrl);

      this.socket.addEventListener('open', () => {
        this.sendMessage('status', 'Viewer opened socket connection');
        resolve();
      });

      this.socket.addEventListener('message', (event: any) => {
        const data = JSON.parse(event.data);
        console.log('Message from server', data);
      });

      this.socket.addEventListener('close', (event: any) => {
        console.log('Socket closed, attempt to reconnect', event.reason);
        setTimeout(() => {
          this.connectToWebsocket();
        }, 1000);
      });

      this.socket.addEventListener('error', (event: any) => {
        console.error('Socket error, closing connections', event.message);
        this.socket.close();
        reject();
      });
    });
  }
}
