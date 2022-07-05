import http from 'http';
import fetch from 'node-fetch';
import WebSocket, { WebSocketServer } from 'ws';
import NodeCache from 'node-cache';
import { parseCityModel } from '@dtcv/citymodel';

const cache = new NodeCache();
export const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  const split = req.url.split('?');
  if (split[0] === '/cache') {
    res.writeHead(200);
    const cacheData = cache.get(split[1]);
    res.end(JSON.stringify(cacheData));
    return;
  }
  res.statusCode = 404;
  res.statusMessage = 'Not found';
  res.end();
});

let wss = new WebSocketServer({
  noServer: true,
  maxPayload: 4096,
});

function handleMessageFromClient(wsClient, data) {
  try {
    const payload = JSON.parse(data);
    console.log('coming in', payload);
    // possible to send messages to mqtt
    server.onWebsocketMessage(payload);
  } catch (e) {
    console.log(e);
  }
}

const addCodeSprintData = async (url, type) => {
  // code sprint example - this should be removed!
  const res = await fetch(url);
  if (res.status !== 200) {
    console.error('File could not be loaded');
  }
  const typeData = server.protoRoot.lookupType(type);
  const decoded = typeData.decode(new Uint8Array(await res.arrayBuffer()));
  const decodedJson = decoded.toJSON();
  const parsed = parseCityModel(decodedJson, type);
  console.log('parsed', parsed);
  cache.set(url, parsed);
};

// this should be removed, only for codesprint data
// addCodeSprintData(
//   'http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/CityModel',
//   'CityModel'
// );
// addCodeSprintData(
//   'http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/GroundSurface',
//   'Surface3D'
// );
// addCodeSprintData(
//   'http://compute.dtcc.chalmers.se:8000/api/GetDataSet/Helsingborg2021/VelocityMagnitudeSurface',
//   'SurfaceField3D'
// );

// await addCodeSprintData(
//   'http://localhost:9000/files/HelsingborgOceanen/CityModel.pb',
//   'CityModel'
// );

// await addCodeSprintData(
//   'http://localhost:9000/files/HelsingborgOceanen/GroundSurface.pb',
//   'Surface3D'
// );
// await addCodeSprintData(
//   'http://localhost:9000/files/HelsingborgOceanen/VelocityMagnitudeSurface.pb',
//   'SurfaceField3D'
// );
// await addCodeSprintData(
//   'http://localhost:9000/files/HelsingborgOceanen/PressureSurface.pb',
//   'SurfaceField3D'
// );

// setup traffic from websocket to mqtt (will be overwritten from parent context)
server.onWebsocketMessage = json => {
  console.warn(
    'onWebsocketMessage: this method must be implemented by mqtt context'
  );
};

server.onMqttSubscribe = (topic, user) => {
  console.warn(
    'onMqttSubscribe: this method must be implemented by mqtt context'
  );
};

server.fetchEntities = async user => {
  console.warn(
    'fetchEntities: this method must be implemented by mqtt context'
  );
};

// TODO: load public key instead
server.getPublicKey = async () => {
  console.warn('this method must be implemented by mqtt context');
};

// setup traffic from mqtt to websocket (will be called from mqtt context)
server.onMqttMessage = (topic, jsonData) => {
  console.log('mqtt msg coming in ', jsonData);
  wss.clients.forEach(wsClient => {
    // here the layers must be checked, since no point broadcasting updates on all data to all clients
    if (wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(
        JSON.stringify({
          topic,
          message: jsonData,
        })
      );
    }
  });
};

wss.on('connection', async function connection(wsClient, request, user) {
  // keep track if the connection is alive from the ping message on setInterval
  // https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
  wsClient.isAlive = true;
  wsClient.on('pong', () => {
    wsClient.isAlive = true;
  });

  wsClient.on('message', function (message) {
    handleMessageFromClient(wsClient, message);
  });

  wsClient.send(
    JSON.stringify({
      message: 'ws connection established',
    })
  );

  // somehow the client must tell which layers are needed, and subscribe to those layers
  wsClient.layers = [];
  wsClient.layers.forEach(layer => {
    server.onMqttSubscribe(layer.id, user);
  });

  // here the cache should be used for init on the layers, since connection was established

  // for cache miss - layer data should be loaded
});

server.on('upgrade', async function upgrade(request, socket, head) {
  // todo: this is not solved, how should user authenticate, and how is authz needed?
  const userId = 'userId';
  // authorization can be done here
  if (false) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  console.log('handle upgrade');
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request, { userId });
  });
});

function noop() {}

// https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    // * each ping message will trigger a pong message if client is responsive and refresh isAlive
    ws.ping(noop);
  });
}, 60 * 1000);

wss.on('listening', e => {
  console.log('listening');
});

wss.on('open', function open() {
  wss.send('something');
});

wss.on('error', e => {
  console.log(e);
});

wss.on('close', function close() {
  clearInterval(interval);
});

export { wss };
