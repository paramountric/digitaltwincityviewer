import type {NextPage} from 'next';
import {useRef, useState, useEffect} from 'react';
import {Viewer, getCity, toLngLat, toWebmercator} from '@dtcv/viewer';
import {
  Feature,
  getLayerPosition,
  coordinatesToMeterOffsets,
} from '@dtcv/geojson';

const ViewerPage: NextPage = () => {
  const canvasRef1 = useRef(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (canvasRef1.current && !viewer) {
      console.log('init canvas');
      const viewer = new Viewer({
        canvas: canvasRef1.current,
        width: '100%',
        height: '100%',
      });
      setViewer(viewer);

      // todo: decide how to set the current city
      const cityLocation = [13.0109, 55.5791];
      const cityCenter = toWebmercator(...cityLocation);
      const city = getCity(cityCenter[0], cityCenter[1]);
      viewer.setCity(city);

      fetch('http://localhost:9000/files/geojson/osm-malmo.json')
        .then(res => res.json())
        .then(data => {
          setLoading(false);
          if (!viewer) {
            return console.error('viewer is not initialized');
          }
          const contextFeatures = data.features;
          coordinatesToMeterOffsets(contextFeatures, ...cityLocation);

          const sampleCenter = [-75.152408, 39.946975];

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
                // longitude: sampleCenter[0],
                // latitude: sampleCenter[1],
                longitude: 0, //cityLocation[0],
                latitude: 0, //cityLocation[1],
                zoom: 14,
                target: [0, 0, 0],
                pitch: 60,
                bearing: 0,
              },
            },
            layers: [
              {
                '@@type': 'GeoJsonLayer',
                data: contextFeatures,
                // modelMatrix: {
                //   '@@function': 'getTranslateMatrix',
                //   translate: [-500, -500],
                // },
                //getColor: [0, 200, 0],
                //modelMatrix: Array.from(modelMatrix),
                coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
                pickable: true,
                stroked: true,
                filled: false,
                extruded: false,
                pointType: 'circle',
                lineWidthScale: 1,
                lineWidthMinPixels: 2,
                getFillColor:
                  '@@=properties.color ? properties.color : [255, 255, 255, 0]', // color or transparent - use this to mark the features according to status (valid, typed but unvalid, etc)
                getLineColor: [100, 100, 100, 100],
                getPointRadius: 10,
                getLineWidth: 1,
              },
              // {
              //   '@@type': 'QuadkeyLayer',
              //   id: 'quadkeys',
              //   data: [
              //     {
              //       quadkey: viewer.getQuadkey(1, 0, 1),
              //       fillColor: [128, 255, 0],
              //       elevation: 10,
              //     },
              //     {
              //       quadkey: viewer.getQuadkey(1, 1, 1),
              //       fillColor: [255, 128, 255],
              //       elevation: 100,
              //     },
              //     {
              //       quadkey: viewer.getQuadkey(0, 1, 1),
              //       fillColor: [128, 255, 255],
              //       elevation: 10,
              //     },
              //     {
              //       quadkey: viewer.getQuadkey(0, 0, 1),
              //       fillColor: [255, 0, 255],
              //       elevation: 100,
              //     },
              //   ],
              //   pickable: false,
              //   wireframe: true,
              //   stroked: true,
              //   filled: false,
              //   extruded: true,
              //   elevationScale: 1,
              //   getFillColor: '@@=fillColor || [255, 128, 18]',
              //   getLineColor: [0, 0, 0],
              //   getLineWidth: 10,
              //   // lineWidthUnits,
              //   // lineWidthScale,
              //   lineWidthMinPixels: 10,
              //   // lineWidthMaxPixels,
              //   // lineJointRounded,
              //   // lineMiterLimit,
              //   // lineDashJustified,
              //   getElevation: '@@=elevation || 1',
              // },
              // {
              //   '@@type': 'Tile3DLayer',
              //   id: 'tiles-with-discrete-lods',
              //   //DracoWorkerLoader: '@!DracoWorkerLoader',
              //   loader: '@@#Tiles3DLoader',
              //   data: 'http://localhost:9000/files/3dtiles/Batched/BatchedColors/tileset.json',
              // },
            ],
          };

          viewer.setJson(jsonData);
        });
    }
  }, [viewer]);

  return (
    <div>
      <main>
        {/* Use a wrapper for the app UI to keep the canvas fixed */}
        <div className="absolute z-50 overflow-hidden">
          {/* Header */}
          <div className="w-full bg-slate-100">Header</div>
          {/* App menu */}
          <div className="w-full bg-slate-100">
            <button onClick={() => {}} className="p-3 border-full bg-slate-100">
              Login
            </button>
          </div>
        </div>

        <canvas
          id="canvas-1"
          style={{background: '#eee', width: '100%', height: '400px'}}
          ref={canvasRef1}
        ></canvas>
      </main>
    </div>
  );
};

export default ViewerPage;
