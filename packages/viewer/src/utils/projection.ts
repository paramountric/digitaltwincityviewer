import proj4 from 'proj4';

proj4.defs(
  'EPSG:3008',
  '+proj=tmerc +lat_0=0 +lon_0=13.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
  'EPSG:3006',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

export function toWebmercator(lng, lat) {
  return proj4('EPSG:4326', 'EPSG:3857', [lng, lat]);
}

export function toLngLat(x, y) {
  return proj4('EPSG:3857', 'EPSG:4326', [x, y]);
}

export function projectCoordinate(x, y, fromProj = 'EPSG:3008') {
  return proj4(fromProj, 'EPSG:3857', [x, y]);
}
