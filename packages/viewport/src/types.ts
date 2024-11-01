import { Feature } from './feature';

export type ViewportProps = {
  mainFeature: Feature | undefined;
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onContextLost?: (error: Error) => void;
};

// min-x, min-y, min-z, max-x, max-y, max-z
export type PixelExtent = [number, number, number, number];
