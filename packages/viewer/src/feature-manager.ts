import { Viewer } from './viewer';

type FeatureManagerProps = {
  viewer: Viewer;
};

export class FeatureManager {
  viewer: Viewer;
  constructor({ viewer }: FeatureManagerProps) {
    this.viewer = viewer;
  }

  getLayers() {
    return [] as any;
  }
}
