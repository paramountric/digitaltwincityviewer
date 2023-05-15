// Part of this code is derived from deck.gl under MIT license:
// https://github.com/visgl/deck.gl/tree/master/examples/playground/src

import { Viewer } from './Viewer';
import { defaultViewerPropsJsonConfig } from './default-viewer-props-config';
export type ViewerProps = {
  container?: HTMLElement;
  height?: number;
  width?: number;
  longitude?: number;
  latitude?: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  pitch?: number;
  // return the viewer instance to the app on load
  onLoad?: (viewer: Viewer) => void;
  // Needed on init: this is dependency injection for the JSON props parser and will override the default if same name
  classes?: {
    [className: string]: any;
  };
  // Needed on init: this is dependency injection for the JSON props parser and will override the default if same name
  functions?: {
    [functionName: string]: (d: any) => any;
  };
  // Needed on init: this is dependency injection for the JSON props parser and will override the default if same name
  enumerations?: {
    [enumerationName: string]: any;
  };
  // Needed on init: this is dependency injection for the JSON props parser and will override the default if same name
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
  const needsUpdate = false;

  addUpdateTriggersForAccessors(newProps);
  return needsUpdate;
}
