import { Geometry as GeoJsonGeometry } from "geojson";

export type FeatureProperties = {
  // View
  _viewX?: number;
  _viewY?: number;
  _width?: number; // this overrides the DeckProps width (should be number)
  _height?: number; // this overrides the DeckProps height (should be number)
  // Viewstate / Camera / spatial
  _latitude?: number;
  _longitude?: number;
  _zoom?: number;
  _minZoom?: number;
  _maxZoom?: number;
  _bearing?: number;
  _pitch?: number;
  // Viewstate / Camera / non-spatial
  _target?: [number, number, number];
  _rotationX?: number;
  _rotationOrbit?: number;
  _orthographic?: boolean;
  // Artifact / animation
  // BE CAREFUL: position this is offset in view (delete it there) but position in layout (meter offset from parent feature center)
  _position?: [number, number, number];
  _size?: [number, number];
  _scale?: [number, number, number];
  _rotation?: [number, number, number];
  _fillColor?: [number, number, number, number];
  _strokeColor?: [number, number, number, number];
  _strokeWidth?: number;
  _opacity?: number;
  _extrusion?: number;
  _elevation?: number;
  //
  _backgroundColor?: [number, number, number, number];
  _foregroundColor?: [number, number, number, number];
  _hide?: boolean;
  //
  _gltfUrl?: string;
};

export type Feature = {
  id?: string;
  key: string;
  type?: string;
  namespace?: string;
  createdAt?: string;
  description?: string | null;
  geometry?: GeoJsonGeometry | null;
  name?: string | null;
  position?: unknown | null;
  projectId?: string | null;
  properties?: FeatureProperties | null;
  updatedAt?: string;
  observedAt?: string;
  // local only
  deletedAt?: string | null;
  versionUri?: string;
};

export type FeatureMap = Map<string, Feature>;

export function getVersionUri(feature: Feature) {
  return `${feature.key}-${feature.observedAt}`;
}
