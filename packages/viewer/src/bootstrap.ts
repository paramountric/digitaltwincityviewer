import { Viewer } from './Viewer';
import geojsonTestData from '../example-data/OSM-malmo/osm-malmo';
import geojsonCountries from '../example-data/Countries/countries';

// todo: make proper city entities (multi-language support, ids, metadata, stat props)
const cities = [
  {
    cityLngLat: [12.6945, 56.0465] as [number, number],
    cityExtentRadius: 5000, // in meters, to determine extent
    name: 'Helsingborg',
  },
  {
    cityLngLat: [11.9746, 57.7089] as [number, number],
    cityExtentRadius: 10000, // in meters, to determine extent
    name: 'Göteborg',
  },
  {
    //cityLngLat: [13.0038, 55.605] as [number, number],
    cityLngLat: [12.965601, 55.591741] as [number, number],
    cityExtentRadius: 5000,
    name: 'Malmö',
  },
];

function bootstrap() {
  const onInit = () => {
    viewer.update({});
  };
  const viewer = new Viewer({
    onInit,
    center: [0, 0],
    zoom: 7,
    cameraPitch: 0,
    cameraBearing: 0,
    ...cities[2],
    sources: [
      {
        id: 'test-box-source',
        type: 'custom',
        layers: [
          // {
          //   id: 'box-layer',
          //   type: 'box',
          //   data: [
          //     {
          //       x: 0,
          //       y: 0,
          //       z: 0,
          //       w: 100,
          //       h: 100,
          //     },
          //   ],
          // },
          // {
          //   id: 'geojson-layer-countries',
          //   type: 'geojson',
          //   data: geojsonCountries,
          //   showLines: true,
          // },
          // {
          //   id: 'geojson-layer',
          //   type: 'geojson',
          //   data: geojsonTestData,
          //   showLines: true,
          // },
          {
            id: 'geojson-building-layer',
            type: 'geojson-building',
            data: geojsonTestData.features.filter(f => f.properties.building),
            showLines: true,
          },
        ],
      },
    ],
  });
}

export default bootstrap;
