import { Feature } from './feature/feature';
import { Viewer } from './viewer';

type FeatureManagerProps = {
  viewer: Viewer;
};

export class FeatureManager {
  viewer: Viewer;
  featureMap: {
    [id: string]: Feature;
  };
  constructor({ viewer }: FeatureManagerProps) {
    this.viewer = viewer;
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
      this.featureMap[feature._id] = feature;
    }
  }

  getLayers() {
    return [] as any;
  }
}
