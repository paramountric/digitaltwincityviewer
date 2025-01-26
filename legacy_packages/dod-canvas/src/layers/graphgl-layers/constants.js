// the interaction state of a node.
export const NODE_STATE = {
  DEFAULT: 'default',
  HOVER: 'hover',
  DRAGGING: 'dragging',
  SELECTED: 'selected',
};

// node visual marker type
export const NODE_TYPE = {
  CIRCLE: 'CIRCLE',
  RECTANGLE: 'RECTANGLE',
  ICON: 'ICON',
  LABEL: 'LABEL',
  MARKER: 'MARKER',
};

// edge shape
export const EDGE_TYPE = {
  SPLINE_CURVE: 'SPLINE_CURVE',
  LINE: 'LINE',
  PATH: 'PATH',
  CURVE: 'CURVE',
};

// decorators on edges
export const EDGE_DECORATOR_TYPE = {
  LABEL: 'EDGE_LABEL',
  FLOW: 'FLOW',
};

// All the markers supported by node type MARKER
import Markers from '../deckgl-layers/marker-layer/marker-list.js';
export const MARKER_TYPE = Markers;
