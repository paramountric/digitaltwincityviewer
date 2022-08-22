import {useState, useRef, useEffect} from 'react';
import {Viewer, getCity, toLngLat, toWebmercator} from '@dtcv/viewer';
import {
  Feature,
  getLayerPosition,
  coordinatesToMeterOffsets,
} from '@dtcv/geojson';
import {useUserInfo} from '../hooks/use-userinfo';

type ViewerProps = {};

const Viewport: React.FC<ViewerProps> = () => {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  useEffect(() => {
    console.log('init canvas');
    const viewer = new Viewer({
      canvas: canvasRef1.current,
      width: '100%',
      height: '100%',
      onLoad: () => {
        const sampleCenter = [-75.61209430782448, 40.042530611425896];

        const jsonData = {
          views: [
            {
              '@@type': 'MapView',
              id: 'mainview',
              controller: true,
            },
          ],
          viewState: {
            mainview: {
              longitude: sampleCenter[0],
              latitude: sampleCenter[1],
              // longitude: 0, //cityLocation[0],
              // latitude: 0, //cityLocation[1],
              zoom: 14,
              target: [0, 0, 0],
              pitch: 60,
              bearing: 0,
            },
          },
          layers: [
            //         {
            //           '@@type': 'GeoJsonLayer',
            //           data: contextFeatures,
            //           // modelMatrix: {
            //           //   '@@function': 'getTranslateMatrix',
            //           //   translate: [-500, -500],
            //           // },
            //           //getColor: [0, 200, 0],
            //           //modelMatrix: Array.from(modelMatrix),
            //           coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
            //           pickable: true,
            //           stroked: true,
            //           filled: false,
            //           extruded: false,
            //           pointType: 'circle',
            //           lineWidthScale: 1,
            //           lineWidthMinPixels: 2,
            //           getFillColor:
            //             '@@=properties.color ? properties.color : [255, 255, 255, 0]', // color or transparent - use this to mark the features according to status (valid, typed but unvalid, etc)
            //           getLineColor: [100, 100, 100, 100],
            //           getPointRadius: 10,
            //           getLineWidth: 1,
            //         },
            {
              '@@type': 'QuadkeyLayer',
              id: 'quadkeys',
              data: [
                {
                  quadkey: viewer.getQuadkey(1, 0, 1),
                  fillColor: [128, 255, 0],
                  elevation: 10,
                },
                {
                  quadkey: viewer.getQuadkey(1, 1, 1),
                  fillColor: [255, 128, 255],
                  elevation: 100,
                },
                {
                  quadkey: viewer.getQuadkey(0, 1, 1),
                  fillColor: [128, 255, 255],
                  elevation: 10,
                },
                {
                  quadkey: viewer.getQuadkey(0, 0, 1),
                  fillColor: [255, 0, 255],
                  elevation: 100,
                },
              ],
              pickable: false,
              wireframe: true,
              stroked: true,
              filled: false,
              extruded: true,
              elevationScale: 1,
              getFillColor: '@@=fillColor || [255, 128, 18]',
              getLineColor: [0, 0, 0],
              getLineWidth: 10,
              // lineWidthUnits,
              // lineWidthScale,
              lineWidthMinPixels: 10,
              // lineWidthMaxPixels,
              // lineJointRounded,
              // lineMiterLimit,
              // lineDashJustified,
              getElevation: '@@=elevation || 1',
            },
            {
              '@@type': 'Tile3DLayer',
              id: 'tile3d',
              DracoWorkerLoader: '@!DracoWorkerLoader',
              loader: '@@#Tiles3DLoader',
              onTileLoad: '@@#onTileLoad',
              onTilesetLoad: '@@#onTilesetLoad',
              // data: 'http://localhost:9000/files/3dtiles/1.0/Samples/TilesetWithDiscreteLOD/tileset.json',
              // data: 'http://localhost:9000/files/3dtiles/1.0/Samples/TilesetWithExpiration/tileset.json',
              // data: 'http://localhost:9000/files/3dtiles/1.0/Samples/TilesetWithRequestVolume/tileset.json',
              // data: 'http://localhost:9000/files/3dtiles/1.0/Samples/TilesetWithTreeBillboards/tileset.json',
              data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
              // data: 'http://localhost:9000/files/3dtiles/1.0/Hierarchy/BatchTableHierarchy/tileset.json',
            },
          ],
        };

        viewer.setJson(jsonData);
      },
    });
    setViewer(viewer);

    // todo: decide how to set the current city
    const cityLocation = [13.0109, 55.5791];
    const cityCenter = toWebmercator(...cityLocation);
    const city = getCity(cityCenter[0], cityCenter[1]);
    viewer.setCity(city);

    //viewer.setJson();

    // fetch('http://localhost:9000/files/geojson/osm-malmo.json')
    //   .then(res => res.json())
    //   .then(data => {
    //     setLoading(false);
    //     if (!viewer) {
    //       return console.error('viewer is not initialized');
    //     }
    //     const contextFeatures = data.features;
    //     coordinatesToMeterOffsets(contextFeatures, ...cityLocation);

    // });
  }, []);

  return (
    <canvas
      id="canvas-1"
      style={{background: '#eee', width: '100%', height: '400px'}}
      ref={canvasRef1}
    ></canvas>
  );
};

export default Viewport;
