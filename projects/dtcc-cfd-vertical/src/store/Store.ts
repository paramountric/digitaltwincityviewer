import { makeObservable, observable, action } from 'mobx';
import {
  Viewer,
  ViewerProps,
  UpdateLayerProps,
  generateColor,
} from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';
// import { module as noise } from './noise';

// ! DISCLAIMER: this file is super messy, part of code sprint, and should be refactored

// we can only run this task atm
const taskName = 'generateTest';

// see this for logging format
// https://rocketry.readthedocs.io/en/stable/handbooks/logging.html

const env = process.env.NODE_ENV;
const websocketUrl =
  env === 'production'
    ? 'wss://pmtric.com/dtcv/ws'
    : env === 'localhost'
    ? 'ws://localhost:4000'
    : 'wss://pmtric-local.com/dtcv/ws';

type Layer = {
  id?: string;
  basemapString?: string;
  name: string;
  isLoading?: boolean;
  isVisible?: boolean;
  // for loading, not sure about this
  task?: string; // main task
  status?: string; // status text
  progress?: number; // percentage
  statusCode?: number; // some codes for success, failed, etc for color
};

export type Log = {
  task: string; // task name
  datetime: string; // Date.toIsoString
  message: string; // used as message in log
  statusCode: number; // green, gray or red
};
export class Store {
  public isLoading = false;
  public isProcessingTask = false;
  public overallProgressPercentage = 0;
  private currentPoller: ReturnType<typeof setInterval> | null;
  public showUiComponents: {
    [uiComponentKey: string]: boolean;
  };
  public progressList: Log[] = []; // fill this with numbers corresponding to loaded status messages, just for prototyping the loading function
  //public progressHistoryList: Layer[][] = []; // add previous progress lists in this list
  public activeLayer: string | null;
  public activeLayerDialogTab: string | null;
  public notificationMessage: string | null;
  public viewer: Viewer;
  private socket: WebSocket;
  public layers: Layer[] = [];
  private logReader: ReadableStreamDefaultReader<string> | null = null;
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.showUiComponents = {
      leftMenu: true,
      layerDialog: false,
      notificationDialog: false,
    };
    this.notificationMessage = null;
    this.currentPoller = null;
    makeObservable(this, {
      isLoading: observable,
      isProcessingTask: observable,
      showUiComponents: observable,
      notificationMessage: observable,
      progressList: observable,
      overallProgressPercentage: observable,
      layers: observable,
      setIsLoading: action,
      addLayer: action,
      showUiComponent: action,
      updateLayer: action,
      removeLayers: action,
      addLog: action,
      setNotificationMessage: action,
      clearProgressMessages: action,
      setIsProcessingTask: action,
    });
    this.init();
  }

  public setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  public showUiComponent(key: string, show: boolean) {
    this.showUiComponents[key] = show;
  }

  public setIsProcessingTask(isProcessingTask: boolean) {
    this.isProcessingTask = isProcessingTask;
  }

  public setNotificationMessage(message: string | null) {
    this.notificationMessage = message;
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

  public removeLayers() {
    this.layers = [];
  }

  public async getTasks() {
    try {
      const taskRequest = await fetch(
        'http://compute.dtcc.chalmers.se:8090/tasks/'
      );
      const data = await taskRequest.json();
      console.log(data);
    } catch (err) {
      console.log(err);
      this.showUiComponent('notificationDialog', true);
      this.setNotificationMessage('Server seems to be offline');
    }
  }

  public updateLayer(layerData: Layer) {
    const layer = this.layers.find(l => l.name === layerData.name);
    if (!layer) {
      return;
    }
    const { isLoading, isVisible, task, status, progress } = layerData;
    if (isLoading || isLoading === false) {
      layer.isLoading = isLoading;
    }
    if (isVisible || isVisible === false) {
      layer.isVisible = isVisible;
      this.viewer.setLayerProps(layer.id, {
        visible: isVisible,
      });
      this.viewer.render();
    }
    if (task || task === '') {
      layer.task = task;
    }
    if (status || status === '') {
      layer.status = status;
    }
    if (progress || progress === 0) {
      layer.progress = progress;
    }
  }

  public setActiveLayer(layerName: string) {
    this.activeLayer = layerName;
  }

  async init() {
    await this.connectToWebsocket();
    this.getTasks();
    // this.createTestData(
    //   'http://localhost:4000/cache?http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/CityModel',
    //   'buildings-layer-polygons-lod-1',
    //   'buildings'
    // );

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

    // this.addLayer({
    //   id: 'vectortiles-basemap',
    //   name: 'Basemap',
    //   isLoading: false,
    //   isVisible: true,
    //   // try the mapbox basemap this time
    //   basemapString: `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=${}`,
    // });

    // these three are the latest:
    // this.addLayer({
    //   id: 'buildings-layer-polygons-lod-1',
    //   name: 'Buildings',
    //   isLoading: true,
    //   isVisible: true,
    // });
    // this.addLayer({
    //   id: 'ground-layer-surface-mesh',
    //   name: 'Ground surface',
    //   isVisible: true,
    //   isLoading: true,
    // });
    // this.addLayer({
    //   id: 'ground-layer-result-mesh',
    //   name: 'Velocity magnitude surface',
    //   isLoading: true,
    //   isVisible: true,
    // });

    // this.addLayer({
    //   id: 'ground-layer-result-mesh-2',
    //   name: 'Pressure surface',
    //   isLoading: true,
    //   isVisible: false,
    // });

    // const test = await fetch(
    //   'http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/CityModel',
    //   {
    //     mode: 'cors',
    //   }
    // );
    // const data = await test.arrayBuffer();
    // console.log(data);

    // these three are the latest:
    // await this.getCachedLayer(
    //   'http://localhost:4000/cache?http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/CityModel',
    //   'buildings-layer-polygons-lod-1',
    //   'buildings'
    // );

    // await this.getCachedLayer(
    //   'http://localhost:4000/cache?http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/GroundSurface',
    //   'ground-layer-surface-mesh',
    //   'ground'
    // );

    // await this.getCachedLayer(
    //   'http://localhost:4000/cache?http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/VelocityMagnitudeSurface',
    //   'ground-layer-result-mesh',
    //   'surfaceField'
    // );

    // await this.getCachedLayer(
    //   'http://localhost:4000/cache?http://localhost:9000/files/HelsingborgOceanen/PressureSurface.pb',
    //   'ground-layer-result-mesh-2',
    //   'surfaceField'
    // );

    // await this.getCachedLayer(
    //   'http://localhost:4000/cache?http://localhost:9000/files/HelsingborgOceanen/FlowField.pb',
    //   'ground-layer-result-mesh',
    //   'surfaceField'
    // );

    // this.addLayer({
    //   name: 'Simulation result',
    //   isLoading: true,
    // });

    // setTimeout(() => {
    //   this.updateLayer({ name: 'Buildings', isLoading: false });
    //   this.updateLayer({ name: 'Ground surface', isLoading: false });
    //   this.updateLayer({ name: 'Simulation result', isLoading: false });
    //   this.updateLayer({
    //     name: 'Velocity magnitude surface',
    //     isLoading: false,
    //   });
    //   this.updateLayer({ name: 'Pressure surface', isLoading: false });
    // }, 1000);

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
    try {
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
    } catch (err) {
      console.log(err);
    }
  }

  async loadResult(url, layerId, key) {
    try {
      const res = await fetch(`http://localhost:4000/result?${url}`);
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
    } catch (err) {
      console.log(err);
    }
  }

  async createTestData(url, layerId, key) {
    try {
      const res = await fetch('http://localhost:4000/test');
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
    } catch (err) {
      console.log(err);
    }
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

  addLog(message: string, datetime: string, statusCode: number) {
    this.progressList.push({
      task: taskName,
      message,
      datetime,
      statusCode,
    });
  }

  clearProgressMessages() {
    this.progressList = [];
  }

  // init the list by checking the current state of the task
  async loadTaskProgress() {
    this.clearProgressMessages();
    this.addLog('Checking task progress', new Date().toISOString(), 0);
    try {
      const taskStatusRequest = await fetch(
        `http://compute.dtcc.chalmers.se:8090/tasks/${taskName}`,
        {
          mode: 'cors',
        }
      );
      const taskStatus = await taskStatusRequest.json();
      if (taskStatus.status) {
        console.log('current status', taskStatus);
        this.addLog(taskStatus.status, new Date().toISOString(), 0);
        const taskLogsRequest = await fetch(
          `http://compute.dtcc.chalmers.se:8090/task/${taskName}/logs`,
          {
            mode: 'cors',
          }
        );
        const existingLogs = await taskLogsRequest.json();
        console.log('existing logs', existingLogs);
        // todo: put the logs into the progress list
      } else {
        this.addLog('No task is running', new Date().toISOString(), 1);
      }
    } catch (err) {
      console.log(err);
      this.addLog('Failed to check task status', new Date().toISOString(), -1);
    }
  }

  async loadTestData(url, layerId, key) {
    // const res = await fetch(url);
    // if (res.status !== 200) {
    //   return console.warn('response status: ', res.status);
    // }
    // const parsed = parseCityModel(await res.json());
    // this.viewer.updateLayer({
    //   layerId,
    //   props: {
    //     data: parsed[key].data,
    //     modelMatrix: parsed[key].modelMatrix,
    //     //center: parsed[key].center,
    //   },
    //   state: {
    //     url,
    //   },
    // });
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

  // simulateLayerLoadingProgress(sequence, i = 0, percentage = 0) {
  //   if (percentage) {
  //     this.updateLayer({
  //       name: 'Buildings',
  //       progress: percentage,
  //     });
  //   } else {
  //     const { task, status } = sequence.reduce(
  //       (acc, s) => {
  //         if (acc.task) {
  //           return acc;
  //         }
  //         for (const p of s.progress) {
  //           if (acc.count === i) {
  //             acc.task = s.task;
  //             acc.status = p;
  //           }
  //           acc.count++;
  //         }
  //         return acc;
  //       },
  //       { task: '', status: '', count: 0 }
  //     );
  //     if (!status) {
  //       this.updateLayer({
  //         name: 'Buildings',
  //         task: '',
  //         status: 'Finished',
  //         progress: 0,
  //       });
  //       //this.progressHistoryList.push([...this.progressList]);
  //       this.progressList = [];
  //       return;
  //     }
  //     this.updateLayer({
  //       name: 'Buildings',
  //       task,
  //       status,
  //     });
  //     const previousProgressItem =
  //       this.progressList[this.progressList.length - 1];
  //     if (previousProgressItem) {
  //       previousProgressItem.statusCode = Math.random() > 0.9 ? -1 : 1;
  //       previousProgressItem.status = `${
  //         previousProgressItem.status
  //       } (${Math.ceil(Math.random() * 10).toFixed()}s)`;
  //     }
  //     this.progressList.push({
  //       name: 'Buildings',
  //       task,
  //       status: `${new Date().toLocaleString('se-SE', {
  //         timeZone: 'UTC',
  //       })} ${status}`,
  //       statusCode: null,
  //     });
  //     i++;
  //   }
  //   setTimeout(() => {
  //     percentage += 20;
  //     this.simulateLayerLoadingProgress(sequence, i, percentage % 120);
  //   }, 200);
  // }

  async generateFakeCityModel() {
    this.setIsProcessingTask(true);
    this.clearProgressMessages();
    // city model has two layers
    if (!this.layers.find(l => l.id === 'buildings-layer-polygons-lod-1')) {
      this.addLayer({
        id: 'buildings-layer-polygons-lod-1',
        name: 'Buildings',
        isLoading: true,
        isVisible: true,
      });
      this.addLayer({
        id: 'ground-layer-surface-mesh',
        name: 'Ground surface',
        isVisible: true,
        isLoading: true,
      });
    }

    this.addLog('Initialize task', new Date().toISOString(), 0);

    let count = 5;
    this.currentPoller = setInterval(async () => {
      this.addLog('Task in progress', new Date().toISOString(), 0);
      this.updateLayer({ name: 'Buildings', isLoading: false });
      this.updateLayer({ name: 'Ground surface', isLoading: false });

      if (count === 0) {
        this.createTestData(
          'http://localhost:4000/cache?http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/CityModel',
          'buildings-layer-polygons-lod-1',
          'buildings'
        );
        this.addLog(
          'Success generating city model!',
          new Date().toISOString(),
          1
        );
        clearTimeout(this.currentPoller);
        this.setIsProcessingTask(false);
        console.log('success');
      }
      count--;
    }, 1000);
  }

  async generateCityModel() {
    this.setIsProcessingTask(true);
    this.clearProgressMessages();
    // city model has two layers
    if (!this.layers.find(l => l.id === 'buildings-layer-polygons-lod-1')) {
      this.addLayer({
        id: 'buildings-layer-polygons-lod-1',
        name: 'Buildings',
        isLoading: true,
        isVisible: true,
      });
      this.addLayer({
        id: 'ground-layer-surface-mesh',
        name: 'Ground surface',
        isVisible: true,
        isLoading: true,
      });
    }

    this.addLog('Initialize task', new Date().toISOString(), 0);

    try {
      console.log('Calling the start task function');
      const taskRequest = await fetch(
        `http://compute.dtcc.chalmers.se:8090/tasks/${taskName}/start`,
        {
          mode: 'cors',
          method: 'post',
        }
      );
      const taskRequestData = await taskRequest.json();
      console.log(
        'Data returns null, but should return a task id',
        taskRequestData
      );

      console.log('Get the stream');
      const response = await fetch(
        `http://compute.dtcc.chalmers.se:8090/tasks/${taskName}/stream-logs`
      );

      this.currentPoller = setInterval(async () => {
        try {
          console.log('try get status log');
          const taskStatusRequest = await fetch(
            `http://compute.dtcc.chalmers.se:8090/tasks/${taskName}`,
            {
              mode: 'cors',
            }
          );
          const taskStatus = await taskStatusRequest.json();
          console.log('taskStatus', taskStatus);
          this.addLog('Task in progress', new Date().toISOString(), 0);
          // for (const log of logs) {
          //   this.addLog(log.message, log.created, 0);
          // }
          // const success = logs.find(l => l.status === 'success');
          if (taskStatus.status === 'success' && this.currentPoller) {
            const { url } = taskStatus;
            this.loadResult(url, 'buildings-layer-polygons-lod-1', 'buildings');
            clearTimeout(this.currentPoller);
            this.setIsProcessingTask(false);
            console.log('success');
            this.logReader.cancel();
          }
        } catch (err) {
          this.addLog(
            'Server progress returned an error',
            new Date().toISOString(),
            -1
          );
          if (this.currentPoller) {
            clearTimeout(this.currentPoller);
          }
          this.setIsProcessingTask(false);
          console.log(err);
        }
      }, 2000);

      console.log('Create the reader');
      this.logReader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      while (true) {
        console.log('reading the data');
        const { value, done } = await this.logReader.read();
        if (done) {
          console.log('Done', done);
          break;
        }
        this.addLog(value, new Date().toISOString(), 0);
        console.log(value);
      }
    } catch (err) {
      this.addLog('Could not start task', new Date().toISOString(), -1);
      this.setIsProcessingTask(false);
      this.removeLayers();
      console.log(err);
    }
  }

  // selectArea() {
  //   console.log('select area');
  //   this.updateLayer({ name: 'Buildings', isLoading: true });
  //   this.updateLayer({ name: 'Ground surface', isLoading: true });
  //   const sequence = [
  //     {
  //       task: 'Loading input data',
  //       progress: ['Loading point cloud', 'Loading shapefile'],
  //     },
  //     {
  //       task: 'Processing geometry',
  //       progress: [
  //         'Processing point cloud',
  //         'Processing polygon data',
  //         'Building meshes',
  //       ],
  //     },
  //     {
  //       task: 'Preparing surfaces',
  //       progress: ['Simplification', 'Serializing'],
  //     },
  //     {
  //       task: 'Preparing city model',
  //       progress: ['Extracting polygons', 'Adding buildings'],
  //     },
  //     {
  //       task: 'Finalizing',
  //       progress: ['Saving to db', 'loading...'],
  //     },
  //   ];
  //   this.simulateLayerLoadingProgress(sequence);
  // }

  cancelCurrentTask() {
    this.setIsProcessingTask(false);
    // this should not remove all layers only the relevant ones
    this.removeLayers();
    // const layer1 = this.layers.find(
    //   l => l.id === 'buildings-layer-polygons-lod-1'
    // );
    // if (layer1) {
    //   this.removeLayer(layer1);
    // }
    // const layer2 = this.layers.find(l => l.id === 'ground-layer-surface-mesh');
    // if (layer2) {
    //   this.removeLayer(layer2);
    // }
    // this.progressList.forEach(p => {
    //   p.isLoading = false;
    // });
    this.addLog('Task was cancelled', new Date().toISOString(), -1);
    // this.progressList.push({
    //   status: `${new Date().toLocaleString('se-SE', {
    //     timeZone: 'UTC',
    //   })} Task was cancelled`,
    //   statusCode: null,
    // });
    if (this.currentPoller) {
      clearTimeout(this.currentPoller);
    }
  }

  simulate() {
    this.updateLayer({ name: 'Simulation result', isLoading: true });
  }
}
