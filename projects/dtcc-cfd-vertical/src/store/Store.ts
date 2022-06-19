import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';

console.log(process.env.NODE_ENV);
const websocketUrl =
  process.env.NODE_ENV === 'production'
    ? 'wss://pmtric.com/dtcv/ws'
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
    this.connectToWebsocket();
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

  addData(json: any, url: string) {
    if (json.Buildings) {
      const { buildings, ground, modelMatrix } = parseCityModel(json);
      this.viewer.setLayerProps('buildings-layer-polygons-lod-1', {
        data: buildings,
        modelMatrix,
      });
      this.viewer.setLayerState('buildings-layer-polygons-lod-1', {
        url,
        isLoaded: true,
      });
      this.viewer.setLayerProps('ground-layer-surface-mesh', {
        data: ground,
        modelMatrix,
      });
      this.viewer.setLayerState('ground-layer-surface-mesh', {
        url,
        isLoaded: true,
      });
    }
  }

  sendMessage(topic: string, message: any) {
    this.socket.send(JSON.stringify({ topic, message }));
  }

  connectToWebsocket() {
    this.socket = new WebSocket(websocketUrl);

    this.socket.addEventListener('open', () => {
      this.sendMessage('status', 'Viewer opened socket connection');
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
    });
  }
}
