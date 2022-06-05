import osmtogeojson, { OsmToGeoJSONOptions } from 'osmtogeojson';

function toGeoJson(osmdata, options?) {
  if (options) {
    return osmtogeojson(osmdata, options);
  }
  return osmtogeojson(osmdata);
}

export { toGeoJson, OsmToGeoJSONOptions };
