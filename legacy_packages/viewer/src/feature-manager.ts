import { BBox, FeatureCollection } from 'geojson';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions/typed';
import bbox from '@turf/bbox';
import {
  Feature,
  FeatureState,
  DEFAULT_FEATURE_FILL_COLOR,
  DEFAULT_FEATURE_STROKE_COLOR,
  DEFAULT_FEATURE_ELEVATION,
  DEFAULT_FEATURE_OPACITY,
} from './feature/feature';
import { Viewer } from './viewer';
import { Color } from '@deck.gl/core/typed';

export type FeatureStateMap = {
  [featureId: string]: FeatureState;
};

type FeatureManagerProps = {
  viewer: Viewer;
};

type FeatureLayer = {
  name: string;
} & FeatureCollection;

export class FeatureManager {
  viewer: Viewer;
  featureLayers: FeatureLayer[];
  featureMap: {
    [featureId: string]: Feature;
  };
  constructor({ viewer }: FeatureManagerProps) {
    this.viewer = viewer;
    this.featureLayers = [];
    this.featureMap = {};
  }

  async getFeatureById(id: string) {
    return this.featureMap[id];
  }

  async loadFeatures() {
    // todo: load from backend
  }

  async addFeatures(features: Feature[]) {
    for (const feature of features) {
      if (!feature._id) {
        // create a random id
        feature._id = Feature.createId();
      }
      if (!feature._type) {
        // default to point
        feature._type = 'point';
      }
      const featureObj = new Feature(feature);
      this.featureMap[feature._id] = featureObj;
    }
  }

  // minX, minY, maxX, maxY
  getExtent(): BBox {
    return bbox({
      type: 'FeatureCollection',
      features: Object.values(this.featureMap),
    });
  }

  getLayerExtent(layerId: string): BBox {
    const layer = this.featureLayers.find(l => l.name === layerId);
    if (!layer) {
      return this.getExtent();
    }
    return bbox(layer);
  }

  getLayers() {
    const featureLayers: GeoJsonLayer[] = [];
    const currentSectionViewState =
      this.viewer.viewManager.getCurrentSectionViewState();
    const featureStateMap =
      currentSectionViewState.featureStateMap || ({} as FeatureStateMap);
    // if no specific layers are specified, return all features
    if (this.featureLayers.length === 0) {
      featureLayers.push(
        new GeoJsonLayer({
          id: 'default-geojson-layer',
          data: Object.values(this.featureMap),
          pickable: true,
          stroked: !this.viewer.viewManager.isPitched(),
          filled: true,
          extruded: this.viewer.viewManager.isPitched(),
          pointType: 'circle',
          lineWidthScale: 1,
          lineWidthMinPixels: 2,
          getFillColor: (f: any) => {
            const featureState = featureStateMap[f.properties._id] || {};
            let opacity;
            if (featureState.opacity || featureState.opacity === 0) {
              opacity = featureState.opacity * 256;
            } else {
              opacity = DEFAULT_FEATURE_OPACITY * 256;
            }
            const color = [
              ...(featureState.fillColor || DEFAULT_FEATURE_FILL_COLOR),
              opacity,
            ];
            return color as Color;
          },
          getLineColor: (f: any) => {
            const featureState = featureStateMap[f.properties._id] || {};
            const opacity = 1;
            const color = [
              ...(featureState.strokeColor || DEFAULT_FEATURE_STROKE_COLOR),
              opacity,
            ];
            return color as Color;
          },
          getPointRadius: 100,
          getLineWidth: 1,
          getElevation: (f: any) => {
            const featureState = featureStateMap[f.properties._id] || {};
            return featureState.elevation || DEFAULT_FEATURE_ELEVATION;
          },
          terrainDrawMode: 'drape',
          extensions: this.viewer.props.showTerrain
            ? [new TerrainExtension()]
            : [],
        })
      );
    }
    return featureLayers;
  }

  getDefaultFeatureState(feature: Feature): FeatureState {
    const featureState: FeatureState = {
      featureId: feature._id,
    };
    const properties = feature.properties || {};
    const classifications = ['layerName'];
    // todo: figure out how to be flexible with the feature state, so that property values can be used (like mapbox color expressions)
    const defaultFeatureStates =
      this.viewer.props.defaultFeatureStates || ({} as any);

    for (const classification of classifications) {
      const classificationValue = properties[classification];
      const defaultFeatureState = defaultFeatureStates[classificationValue];
      if (defaultFeatureState) {
        const featureStateClone = JSON.parse(
          JSON.stringify(defaultFeatureState)
        );
        Object.assign(featureState, featureStateClone);
        break;
      }
    }

    featureState.fillColor = featureState.fillColor || [255, 255, 255];
    featureState.strokeColor = featureState.strokeColor || [0, 0, 0];
    featureState.opacity = featureState.opacity || 1;
    featureState.displayName = featureState.displayName || '';
    featureState.displayValue = featureState.displayValue || 0;
    featureState.displayUnit = featureState.displayUnit || '';
    featureState.hidden = featureState.hidden || false;
    featureState.elevation = featureState.elevation || 0;
    featureState.isSelected = featureState.isSelected || false;

    return featureState;
  }
}
