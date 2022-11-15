import {parseProtobuf, parseCityModel} from '@dtcv/citymodel';

// for now a hard coded list of city data, because auth needs to be solved as well as how the data will be distributed
// here the data is just loaded to an AWS bucket

export const cityDatasets = {
  helsingborg: {
    cityLabel: 'Helsingborg',
    files: [
      {
        id: 'helsingborg-citymodel',
        cityId: 'helsingborg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-citymodel-june-2022.pb',
        fileType: 'protobuf',
        pbType: 'CityModel',
        layerType: 'CityModelLayer',
        text: 'Helsingborg CityModel objects',
      },
      {
        id: 'helsingborg-groundsurface',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-groundsurface-june-2022.pb',
        fileType: 'protobuf',
        pbType: 'Surface3D',
        layerType: 'GroundSurfaceLayer',
        text: 'Helsingborg ground surface',
        cityId: 'helsingborg',
      },
    ],
  },
};

export async function loadExampleData(fileSetting) {
  const {url, fileType, pbType} = fileSetting;
  const response = await fetch(url);
  let data;
  let modelMatrix;
  switch (fileType) {
    case 'protobuf':
      const pbData = new Uint8Array(await response.arrayBuffer());
      const pbJson = parseProtobuf(pbData, pbType);
      const layerData = parseCityModel(pbJson, 'EPSG:3007');

      switch (pbType) {
        case 'CityModel':
          data = layerData.buildings.data;
          modelMatrix = layerData.buildings.modelMatrix;
          break;
        case 'Surface3D':
          data = layerData.ground.data;
          modelMatrix = layerData.ground.modelMatrix;
          break;
        default:
          data = [];
          modelMatrix = null;
      }
      console.log(pbJson);
      break;
    case 'json':
      const json = await response.json();
      // todo: currently no json example, wait until so
      break;
    default:
      console.warn('example files should be explicit');
  }
  return {
    data,
    modelMatrix,
  };
}
