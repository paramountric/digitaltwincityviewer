// the convert is not used, but if geojson needs to support other crs than epsg4326 -> use it instead of coordinatesToMeterOffsets (or call it from within that function)
//import { convert as convertCoordinate } from '@dtcv/convert';
import { coordinatesToMeterOffsets } from './project';

const convert = (jsonData, crs: string, cityXY?: number[]) => {
  // todo: find different supported subgroups
  coordinatesToMeterOffsets(
    jsonData.features,
    cityXY[0] * -1,
    cityXY[1] * -1,
    false
  );
  const result = {
    buildings: jsonData.features,
  };
  return result;
};

export { convert };
