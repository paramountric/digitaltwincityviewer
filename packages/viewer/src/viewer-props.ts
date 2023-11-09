// Part of this code is derived from deck.gl under MIT license:
// https://github.com/visgl/deck.gl/tree/master/examples/playground/src

import { Viewer } from './viewer';
import { defaultViewerPropsJsonConfig } from './default-viewer-props-config';
import { DeckProps } from '@deck.gl/core/typed';
import { MVTLayerProps, Tile3DLayerProps } from '@deck.gl/geo-layers/typed';
import { FeatureState } from './feature/feature';

export const DEFAULT_START_ZOOM = -2;
export const DEFAULT_MIN_ZOOM = -5;
export const DEFAULT_MAX_ZOOM = 5;

export type ViewerProps = {
  container?: HTMLElement;
  height?: number;
  width?: number;
  longitude?: number;
  latitude?: number;
  zoom?: number;
  backgroundColor?: number[];
  darkMode?: boolean;
  darkModeBackgroundColor?: number[];
  lightModeBackgroundColor?: number[];
  minZoom?: number;
  maxZoom?: number;
  pitch?: number;
  bearing?: number;
  position?: number[];
  defaultFeatureStates?: {
    [type: string]: Omit<FeatureState, 'featureId'>;
  };
  mvtLayerConfig?: {
    [layerId: string]: MVTLayerProps;
  };
  tile3dLayerConfig?: {
    [layerId: string]: Tile3DLayerProps;
  };
  // re-think the json spec below
  layers?: any[];
  // Needed on init for JSON config: this is dependency injection for the JSON props parser and will override the default if same name
  classes?: {
    [className: string]: any;
  };
  // Needed on init for JSON config: this is dependency injection for the JSON props parser and will override the default if same name
  functions?: {
    [functionName: string]: (d: any) => any;
  };
  // Needed on init for JSON config: this is dependency injection for the JSON props parser and will override the default if same name
  enumerations?: {
    [enumerationName: string]: any;
  };
  // Needed on init for JSON config: this is dependency injection for the JSON props parser and will override the default if same name
  constants?: {
    [constantName: string]: any;
  };
};

export function getJsonConfig({
  classes = {},
  functions = {},
  enumerations = {},
  constants = {},
}: ViewerProps) {
  // note: some logic is anticipated here, but for the moment any props will
  return Object.assign({}, defaultViewerPropsJsonConfig, {
    classes: Object.assign(defaultViewerPropsJsonConfig.classes, classes),
    functions: Object.assign(defaultViewerPropsJsonConfig.functions, functions),
    enumerations: Object.assign(
      defaultViewerPropsJsonConfig.enumerations,
      enumerations
    ),
    constants: Object.assign(defaultViewerPropsJsonConfig.constants, constants),
  });
}

function isFunctionObject(value: any) {
  return typeof value === 'object' && '@@function' in value;
}

function addUpdateTriggersForAccessors(newProps: any) {
  if (!newProps || !newProps.layers) return;

  for (const layer of newProps.layers) {
    const updateTriggers = {} as any;
    for (const [key, value] of Object.entries(layer)) {
      if (
        (key.startsWith('get') && typeof value === 'string') ||
        isFunctionObject(value)
      ) {
        // it's an accessor and it's a string
        // we add the value of the accesor to update trigger to refresh when it changes
        updateTriggers[key] = value;
      }
    }
    if (Object.keys(updateTriggers).length) {
      layer.updateTriggers = updateTriggers;
    }
  }
}

export function setProps(viewer: Viewer, newProps: ViewerProps): boolean {
  // todo: apply logic for all props in ViewerProps
  const needsUpdate = true;

  // addUpdateTriggersForAccessors(newProps);
  return needsUpdate;
}

export const defaultViewerProps: ViewerProps = {
  minZoom: DEFAULT_MIN_ZOOM,
  maxZoom: DEFAULT_MAX_ZOOM,
  backgroundColor: [255, 255, 255],
  darkModeBackgroundColor: [0, 0, 0],
  lightModeBackgroundColor: [255, 255, 255],
};
