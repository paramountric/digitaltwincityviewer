import {
  Feature as GeojsonFeature,
  Geometry,
  GeoJsonProperties,
} from 'geojson';

export type InteractionState =
  | 'default'
  | 'hover'
  | 'dragging'
  | 'inside'
  | 'outside'
  | 'focus';

export type FeatureState = {
  featureId: string;
  feature?: Feature; // ref during runtime - serialized to featureId
  fontSize?: number;
  // morph geometry?
  coordinate?: [number, number, number]; // lon, lat, z
  size?: [number, number]; // width, height, use for imageSize?
  scale?: [number, number, number]; // x, y, z
  rotation?: [number, number, number]; // x, y, z
  fillColor?: number[];
  strokeColor?: number[];
  opacity?: number;
  displayName?: string;
  displayValue?: number;
  displayUnit?: string;
  hidden?: boolean;
  elevation?: number;
  interactionState?: InteractionState;
  isSelected?: boolean;
};

export type FeatureProps = {
  // geojson type
  type?: string;
  geometry?: Geometry;
  // original properties
  properties?: GeoJsonProperties;
  state?: FeatureState;
  _id?: string;
  // semantic type
  _type?: string;
  _namespace?: string;
  _projectId?: string;
  _parentId?: string;
};

export class Feature implements GeojsonFeature {
  type: 'Feature' = 'Feature';
  geometry: Geometry;
  properties: GeoJsonProperties;
  _id: string;
  _type?: string;
  _namespace?: string;
  _projectId?: string;
  _parentId?: string;
  state: FeatureState;

  constructor(props: FeatureProps = {}) {
    Object.assign(this, props);
    const id = props._id || 'create-a-unique-id';
    this._id = id;
    this.state = props.state || {
      featureId: id,
      feature: this,
    };
    this.geometry = props.geometry || {
      type: 'Point',
      coordinates: [0, 0],
    };
    if (!props.geometry) {
      this.state.hidden = true;
    }
    this.properties = props.properties || {};
  }
}
