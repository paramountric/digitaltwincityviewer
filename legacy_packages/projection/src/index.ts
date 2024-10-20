import proj4 from 'proj4';

// This package exports some helper functions for projecting coordinates in the DTCV projects

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

export function projectCoordinate(x, y, fromProj, toProj) {
  return proj4(fromProj, toProj, [x, y]);
}

export function from4326to3857(x, y) {
  return projectCoordinate(x, y, 'EPSG:4326', 'EPSG:3857');
}

export function from3857to4326(x, y) {
  return projectCoordinate(x, y, 'EPSG:3857', 'EPSG:4326');
}

export function from3006to4326(x, y) {
  return projectCoordinate(x, y, 'EPSG:3006', 'EPSG:4326');
}

export function from3007to4326(x, y) {
  return projectCoordinate(x, y, 'EPSG:3007', 'EPSG:4326');
}

export function from3008to4326(x, y) {
  return projectCoordinate(x, y, 'EPSG:3008', 'EPSG:4326');
}

export function from3006to3857(x, y) {
  return projectCoordinate(x, y, 'EPSG:3006', 'EPSG:3857');
}

export function from3007to3857(x, y) {
  return projectCoordinate(x, y, 'EPSG:3007', 'EPSG:3857');
}

export function from3008to3857(x, y) {
  return projectCoordinate(x, y, 'EPSG:3008', 'EPSG:3857');
}
