import {LayerConfig} from '../hooks/use-layers';
import {parseCityGml, CityGmlParserOptions} from '@dtcv/citygml';

// todo: refactor out the callback using promises
// the preferred way is to return layer data without using callback
export async function parser(
  apiResponse: any,
  layerConfig: LayerConfig,
  callback?: (layerData: any) => any
) {
  const {fileType} = layerConfig;
  switch (fileType) {
    case 'gml':
      const options: CityGmlParserOptions = {
        cityObjectMembers: {
          'bldg:Building': true,
          'transportation:TrafficArea': true,
          'transportation:AuxiliaryTrafficArea': true,
          'transportation:TransportationComplex': false, // how to do with this?
          'luse:LandUse': true,
          'frn:CityFurniture': true,
          'trecim:Facility': true,
        },
      };
      const rawCityGml = await apiResponse.text();

      parseCityGml(rawCityGml, options, cityGmlResult => {
        console.log(cityGmlResult);
        // add to layerData
        const layerData = {};
        if (callback) {
          callback(layerData);
        }
      });
      break;
    default:
      console.warn('File type not supported by parser');
  }
}
