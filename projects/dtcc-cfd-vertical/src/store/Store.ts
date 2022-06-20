import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps, UpdateLayerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';

const env = process.env.NODE_ENV;
const websocketUrl =
  env === 'production'
    ? 'wss://pmtric.com/dtcv/ws'
    : env === 'localhost'
    ? 'ws://localhost:4000'
    : 'wss://pmtric-local.com/dtcv/ws';

export class Store {
  public isLoading = false;
  public showLeftMenu = false;
  public viewer: Viewer;
  private socket: WebSocket;
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    makeObservable(this, {
      setIsLoading: action,
      isLoading: observable,
    });
    this.init();
  }

  public setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  public reset() {
    this.viewer.setSelectedObject(null);
    this.viewer.unload();
  }

  public render() {
    this.viewer.render();
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
  }

  async loadTestData(url, layerId, key) {
    const res = await fetch(url);
    if (res.status !== 200) {
      return console.warn('response status: ', res.status);
    }
    const parsed = parseCityModel(await res.json());
    console.log(parsed);
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
