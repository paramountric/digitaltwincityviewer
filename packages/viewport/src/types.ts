import { DeckProps } from '@deck.gl/core/typed';

export type ViewportProps = {
  // initial viewstate
  zoom?: number;
  // send this in as [255, 255, 255, 255] for white background
  backgroundColor?: [number, number, number, number];
  foregroundColor?: [number, number, number, number];
  onLoad?: () => void;
  onContextLost?: (error: Error) => void;
} & Omit<DeckProps, 'views'>;

// min-x, min-y, min-z, max-x, max-y, max-z
export type PixelExtent = [number, number, number, number];
