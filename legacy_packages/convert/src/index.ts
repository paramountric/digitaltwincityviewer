import proj4 from 'proj4';

// this package was initally for converting coordinates to "meter" offset from a center reference coordinate
// due to convenince and optimization it is now possible to project the coordinate, and change the values by reference

// some example of use:
// convert coordinates to be "meter" offset from the reference center coordinate
// project coordinates
// usually in pure preprocessing with geojson/cityjson geometries it's efficient to use "out" to change value by reference
// ! be careful with the mutation of coordinates

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

proj4.defs(
  'EPSG:3011',
  '+proj=tmerc +lat_0=0 +lon_0=18 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
);

proj4.defs(
  'EPSG:31256',
  '+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs'
);

// this is to remove the reference x and y (center of area of interest) from the coordinate
// so that the coordinates are just the offset from center
function translateCoordinate(
  coordX: number,
  coordY: number,
  translateX: number,
  translateY: number
) {
  return [coordX - translateX, coordY - translateY];
}

export function projectCoordinate(
  x,
  y,
  fromProj = 'EPSG:3008',
  toProj = 'EPSG:3857'
) {
  return proj4(fromProj, toProj, [x, y]);
}

const CrsList = {
  'EPSG:3006': 'EPSG:3006',
  SWEREF99TM: 'EPSG:3006',
  'EPSG:3007': 'EPSG:3007',
  SWEREF991200: 'EPSG:3007',
  'EPSG:3008': 'EPSG:3008',
  SWEREF991330: 'EPSG:3008',
  'EPSG:3011': 'EPSG:3011',
  'EPSG:3857': 'EPSG:3857',
  'EPSG:4326': 'EPSG:4326',
};

export type ConvertOptions = {
  x: number; // x or longitude to project/convert
  y: number; // y or latitude to project/convert
  z?: number; // altitude
  fromCrs?: string; // if omitted, no projection is done
  toCrs?: string; // this should be given if fromCrs is given
  center?: [number, number, number]; // will subtract this to coordinates - use same projection as toCrs!
  out?: number[]; // optional for using reference on coord, send in [x, y] reference here for mutation
  setZToZero?: boolean; // optional for setting the out coord z to zero (useful for extruded footprint on 2D ground if original data is 3D)
};

// this function projects and converts the data to meter offsets from city center
const convert = (options: ConvertOptions) => {
  const { x, y, z, fromCrs, toCrs, center, out, setZToZero } = options;

  // to be returned
  const result = out || [x, y, z || 0];

  // project
  if (fromCrs) {
    // to be on the safe side, supported projection systems are added in a list
    const supportedCrs = CrsList[fromCrs];
    if (!supportedCrs) {
      throw new Error(
        `The CRS ${fromCrs} is not supported. Add it to the source code of the convert package`
      );
    }
    const projected = projectCoordinate(x, y, supportedCrs, toCrs);
    result[0] = projected[0];
    result[1] = projected[1];
  }

  // convert/translate
  if (center) {
    const translated = translateCoordinate(
      result[0],
      result[1],
      center[0],
      center[1]
    );
    result[0] = translated[0];
    result[1] = translated[1];
    if (setZToZero) {
      result[2] = 0;
    }
  }

  return result;
};

export { convert };
