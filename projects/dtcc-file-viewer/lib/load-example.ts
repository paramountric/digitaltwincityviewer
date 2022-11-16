import {parseProtobuf, parseCityModel} from '@dtcv/citymodel';
import {cities} from '@dtcv/cities';
import {convert, getLayerPosition} from '@dtcv/geojson';

// for now a hard coded list of city data, because auth needs to be solved as well as how the data will be distributed
// here the data is just loaded to an AWS bucket

const helsingborg = cities.find(c => c.id === 'helsingborg');

export const cityDatasets = {
  helsingborg: {
    cityLabel: 'Helsingborg',
    files: [
      {
        ...helsingborg,
        id: 'helsingborg-citymodel',
        cityId: 'helsingborg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-citymodel-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'CityModel',
        layerType: 'CityModelLayer',
        text: 'Helsingborg buildings',
        origin: {x: 102000, y: 6213004.15744457},
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-citysurface',
        cityId: 'helsingborg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-citysurface-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'Surface3D',
        layerType: 'GroundSurfaceLayer',
        text: 'Helsingborg city surface',
        origin: {x: 102000, y: 6213004.15744457},
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-osm',
        cityId: 'helsingborg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-osm-nov-2022.geojson',
        fileType: 'geojson',
        pbType: null,
        layerType: 'GeoJsonLayer',
        text: 'Helsingborg OpenStreetMap',
        origin: {x: 0, y: 0},
        crs: 'EPSG:4326',
      },
    ],
  },
};

// the fileSetting is the object in files array above
export async function loadExampleData(fileSetting) {
  const {url, fileType, pbType, crs, x, y, lng, lat, origin} = fileSetting;
  const response = await fetch(url);
  const result: any = {};
  switch (fileType) {
    case 'protobuf':
      const pbData = new Uint8Array(await response.arrayBuffer());
      const pbJson = parseProtobuf(pbData, pbType);
      pbJson.origin = origin;
      //console.log('protobuf', pbJson);
      const layerData = parseCityModel(pbJson, crs, pbType);
      // , [
      //   fileSetting.x,
      //   fileSetting.y,
      // ]);

      switch (pbType) {
        case 'CityModel':
          result.data = layerData.buildings.data;
          //result.coordinateOrigin = [lng, lat];
          // this makes it works perfectly, but how should other layers realate?
          //result.modelMatrix = layerData.buildings.modelMatrix;
          result.pickable = true;
          result.autoHighlight = true;
          break;
        case 'Surface3D':
          result.data = layerData.ground.data;
          //result.coordinateOrigin = [lng, lat];
          //result.modelMatrix = layerData.ground.modelMatrix;
          break;
        default:
          result.data = [];
      }
      break;
    case 'geojson':
      const json = await response.json();
      //const processed = convert(json, crs, [x, y]);
      // this should not be used since it centers the layer relatively
      //const position = getLayerPosition(processed.features);
      result.data = json;
      result.opacity = 1;
      result.autoHighlight = false;
      result.highlightColor = [100, 150, 250, 255];
      result.extruded = false;
      result.wireframe = false;
      result.pickable = false;
      result.isClickable = false;
      // result.coordinateSystem = '@@#COORDINATE_SYSTEM.METER_OFFSETS';
      // result.coordinateOrigin = [lng, lat];
      result.getPolygon = '@@=geometry.coordinates';
      result.getFillColor = '@@=properties.color || [100, 150, 250, 30]';
      // todo: currently no json example, wait until so
      break;
    default:
      console.warn('example files should be explicit');
  }
  return result;
}
