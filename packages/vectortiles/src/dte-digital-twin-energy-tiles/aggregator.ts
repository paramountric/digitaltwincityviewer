import fs from 'fs';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import clone from '@turf/clone';
import bbox from '@turf/bbox';
import { toWgs84 } from 'reproject';
import RBush from 'rbush';
import { Feature, FeatureCollection } from 'geojson';

// ! note, this file is only for the dte project case

// these geojson files are used for segmentation of the areas used for aggregation, and not included in the source code.
const cityDistricts = JSON.parse(
  fs.readFileSync('../../data/boundaries/city_district.json', 'utf8')
);
const baseAreas = JSON.parse(
  fs.readFileSync('../../boundaries/base_areas.json', 'utf8')
);
const primaryAreas = JSON.parse(
  fs.readFileSync('../../boundaries/primary_areas.json', 'utf8')
);
const grid1km = JSON.parse(
  fs.readFileSync('../../boundaries/grid_1km.json', 'utf8')
);
const grid250m = JSON.parse(
  fs.readFileSync('../../boundaries/grid_250m.json', 'utf8')
);
const grid100m = JSON.parse(
  fs.readFileSync('../../boundaries/grid_100m.json', 'utf8')
);

// the segmentation files (as well as the input geoJson) needs to be standard coordinates
const epsg3006 =
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
const segmentations = {
  cityDistricts: toWgs84(cityDistricts, epsg3006),
  baseAreas: toWgs84(baseAreas, epsg3006),
  primaryAreas: toWgs84(primaryAreas, epsg3006),
  grid1km: toWgs84(grid1km, epsg3006),
  grid250m: toWgs84(grid250m, epsg3006),
  grid100m: toWgs84(grid100m, epsg3006),
};

type AggregateOptions = {
  segmentation: string;
};

/*
 * Get a representative point for a feature that is used to determine if the feature is inside of polygon
 */
function getPointFromFeature(feature: Feature) {
  // for now just take the first point in polygon
  if (feature.geometry.type === 'Polygon') {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: feature.geometry.coordinates[0][0],
      },
    };
  }
  // do something about this later..
  return 'crash';
}

function pointInPolygon(pointFeature, polygonFeature) {
  return booleanPointInPolygon(pointFeature, polygonFeature);
}

/*
 * properties Array of strings for the keys in feature.properties to use for aggregation
 * options.segmentation 'cityDistricts', 'baseAreas', 'primaryAreas', 'grid1km', 'grid250km', 'grid100m' (for now fixed for gbg geojson files)
 * Future considerations:
 * How is a feature inside a segment? Center point, % of feature area, etc?
 */
export function aggregate(
  geoJson: FeatureCollection, // need to be already in EPSG:4326
  properties: string[] = [],
  options: AggregateOptions
) {
  // prepare features to searchtree
  const { features } = geoJson;
  const searchItems = [];
  for (let i = 0; i < features.length; i++) {
    const [minX, minY, maxX, maxY] = bbox(features[i]);
    searchItems.push({
      minX,
      minY,
      maxX,
      maxY,
      i,
    });
  }
  const searchTree = new RBush();
  searchTree.load(searchItems);
  // use the segments to aggregate feature data
  const seg = segmentations[options.segmentation];
  const output = [];
  for (let i = 0; i < seg.features.length; i++) {
    const c = clone(seg.features[i]);
    const [minX, minY, maxX, maxY] = bbox(c);
    // first to a rough filtering
    const searchResult = searchTree.search({
      minX,
      minY,
      maxX,
      maxY,
    });
    // then check the results if inside segment
    for (let j = 0; j < searchResult.length; j++) {
      const feature = features[searchResult[j].i];
      const point = getPointFromFeature(feature);
      if (pointInPolygon(point, c)) {
        for (let k = 0; k < properties.length; k++) {
          const key = properties[k];
          const countKey = `${key}Count`;
          const sumKey = `${key}Sum`;
          if (!c.properties[sumKey]) {
            c.properties[sumKey] = 0;
            c.properties[countKey] = 0;
          }
          if (feature.properties[key] || feature.properties[key] === 0) {
            c.properties[sumKey] += feature.properties[key];
            c.properties[countKey]++;
          }
        }
      }
    }
    output.push(c);
  }
  // then calculate the mean of each property
  for (let l = 0; l < output.length; l++) {
    const outSeg = output[l];
    for (let m = 0; m < properties.length; m++) {
      if (outSeg.properties[`${properties[m]}Count`]) {
        outSeg.properties[properties[m]] =
          outSeg.properties[`${properties[m]}Sum`] /
          outSeg.properties[`${properties[m]}Count`];
      }
    }
  }
  return {
    type: 'FeatureCollection',
    features: output,
  };
}
