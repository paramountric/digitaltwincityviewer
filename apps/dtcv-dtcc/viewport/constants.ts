export type FeatureColor = {
  fillColor?: number[];
  strokeColor?: number[];
  name: string;
};

export const DEFAULT_BACKGROUND_COLOR = [2, 6, 23, 255] as [
  number,
  number,
  number,
  number
];
export const DEFAULT_MAP_COORDINATES = [11.981, 57.6717];
export const DEFAULT_MAP_ZOOM = 16;
export const DEFAULT_MIN_ZOOM = 0;
export const DEFAULT_MAX_ZOOM = 20;
export const DEFAULT_BEARING = 0;
export const DEFAULT_PITCH = 0;

export const TILE_SIZE = 2 ** 18;

export const blue: FeatureColor = {
  fillColor: [184, 195, 202] as [number, number, number],
  strokeColor: [135, 157, 169] as [number, number, number],
  name: 'blue',
};
export const DEFAULT_FEATURE_SIZE = TILE_SIZE / 2 ** 12; // this is calculated as DEFAULT_FEATURE_SIZE / 2 ** zoom
export const FEATURE_MIN_SIZE = DEFAULT_FEATURE_SIZE / 2;
export const FEATURE_MAX_SIZE = DEFAULT_FEATURE_SIZE * 2 ** 4;

export const DEFAULT_FEATURE_FILL_COLOR = blue.fillColor;
export const DEFAULT_FEATURE_STROKE_COLOR = blue.strokeColor;
export const DEFAULT_FEATURE_STROKE_WIDTH = 1;
export const DEFAULT_FEATURE_OPACITY = 1;
export const DEFAULT_FEATURE_FONT_SIZE = 12;
