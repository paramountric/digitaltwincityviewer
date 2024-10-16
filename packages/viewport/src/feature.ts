export type FeatureProperties = {
  _hide?: boolean;
};

export type Feature = {
  id?: string;
  key: string;
  type?: string;
  namespace?: string;
  createdAt?: string;
  description?: string | null;
  geometry?: unknown | null;
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
