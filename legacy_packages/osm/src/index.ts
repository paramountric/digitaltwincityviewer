import osmtogeojson, { OsmToGeoJSONOptions } from 'osmtogeojson';
import { FeatureCollection } from 'geojson';

function toGeoJson(
  osmdata: any,
  options?: OsmToGeoJSONOptions
): FeatureCollection {
  if (options) {
    return osmtogeojson(osmdata, options);
  }
  return osmtogeojson(osmdata);
}

export { toGeoJson, OsmToGeoJSONOptions };
