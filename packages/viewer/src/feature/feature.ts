import {
  Feature as GeojsonFeature,
  Geometry,
  GeoJsonProperties,
} from 'geojson';

export type FeatureProps = {
  type?: string;
  geometry?: Geometry;
  properties?: GeoJsonProperties;
  _id?: string;
  _type?: string;
  _namespace?: string;
  _displayValue?: number;
  _displayUnit?: string;
  _hidden?: boolean;
  _elevation?: number;
  _projectId?: string;
  _parentId?: string;
  _state?: FeatureState;
  _isSelected?: boolean;
};

export type FeatureState =
  | 'default'
  | 'hover'
  | 'dragging'
  | 'inside'
  | 'outside'
  | 'focus';
export class Feature implements GeojsonFeature {
  type: 'Feature' = 'Feature';
  geometry: Geometry;
  properties: GeoJsonProperties;
  _id?: string;
  _type?: string;
  _namespace?: string;
  _displayValue?: number;
  _displayUnit?: string;
  _hidden?: boolean;
  _elevation?: number;
  _projectId?: string;
  _parentId?: string;
  _state?: FeatureState;
  _isSelected?: boolean;

  constructor(props: FeatureProps = {}) {
    Object.assign(this, props);
    this.geometry = props.geometry || {
      type: 'Point',
      coordinates: [0, 0],
    };
    if (!props.geometry) {
      this._hidden = true;
    }
    this.properties = props.properties || {};
  }
}
