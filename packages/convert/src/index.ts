// import { vec3, mat4 } from 'gl-matrix';

import proj4 from 'proj4';

// SWEREF 99 TM
proj4.defs(
  'EPSG:3006',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
// SWEREF 99 12 00
proj4.defs(
  'EPSG:3007',
  '+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
// SWEREF 99 13 30
proj4.defs(
  'EPSG:3008',
  '+proj=tmerc +lat_0=0 +lon_0=13.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

// function transformCoordinate(x, y, transform) {
//   if (!transform) {
//     return [x, y];
//   }
//   const s = transform.scale || [1, 1, 1];
//   const t = transform.translate || [0, 0, 0];
//   return [x * s[0] + t[0], y * s[1] + t[1]];
// }

function translateCoordinate(
  coordX: number,
  coordY: number,
  offsetX: number,
  offsetY: number
) {
  return [coordX - offsetX, coordY - offsetY];
}

function projectCoordinate(x, y, fromProj = 'EPSG:3006') {
  return proj4(fromProj, 'EPSG:3857', [x, y]);
}

const CrsList = {
  'EPSG:3006': 'EPSG:3006',
  SWEREF99TM: 'EPSG:3006',
  'EPSG:3007': 'EPSG:3007',
  SWEREF991200: 'EPSG:3007',
  'EPSG:3008': 'EPSG:3008',
  SWEREF991330: 'EPSG:3008',
  'EPSG:3857': 'EPSG:3857',
  'EPSG:4326': 'EPSG:4326',
};

// this function projects and converts the data to meter offsets from city center
const convert = (
  x: number, // x or longitude to project/convert
  y: number, // y or latitude to project/convert
  crs: string, // from crs
  cityXY?: number[], // webmercator for translating, this should probably be mandatory, but if omitted the function can be used as pure projection function
  out?: number[], // optional for using reference on coord, send in [x, y] reference here for mutation
  setZToZero?: boolean // optional for setting the out coord z to zero (useful for extruded footprint on 2D ground if original data is 3D)
) => {
  const supportedCrs = CrsList[crs];
  if (!supportedCrs) {
    throw new Error(
      `The CRS ${crs} is not supported. Add it to the source code of the convert package`
    );
  }
  const result = out || [x, y];
  if (crs !== 'EPSG:3857') {
    const projected = projectCoordinate(x, y, supportedCrs);
    result[0] = projected[0];
    result[1] = projected[1];
  }
  if (cityXY) {
    const translated = translateCoordinate(
      result[0],
      result[1],
      cityXY[0],
      cityXY[1]
    );
    result[0] = translated[0];
    result[1] = translated[1];
    if (setZToZero) {
      result[2] = 0;
    }
    if (Math.abs(result[0]) > 1000000) {
      const cityXYDebug = cityXY || [];
      throw new Error(
        `The meter offset is too large, check that coordinates and city center matches and that city x,y are given in web mercator. IN: [${x}, ${y}], OUT: [${result[0]}, ${result[1]}, CITY: [${cityXYDebug[0]}, ${cityXYDebug[1]}]`
      );
    }
  }

  return result;
};

export { convert };
