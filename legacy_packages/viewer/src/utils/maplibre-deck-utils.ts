// This code is derived from Deck.gl. Copyright MIT, 2020 Urban Computing Foundation
// Here Maplibre is used.
// https://github.com/visgl/deck.gl/tree/master/modules/mapbox/src
import {
  Deck,
  WebMercatorViewport,
  MapView,
  _flatten as flatten,
} from '@deck.gl/core/typed';
import type { DeckProps, MapViewState, Layer } from '@deck.gl/core/typed';
import type MapboxLayer from './maplibre-layer';
import type { Map } from 'maplibre-gl';

import { lngLatToWorld, unitsPerMeter } from '@math.gl/web-mercator';
import GL from '@luma.gl/constants';

type UserData = {
  isExternal: boolean;
  currentViewport?: WebMercatorViewport | null;
  mapboxLayers: Set<MapboxLayer<any>>;
  // mapboxVersion: {minor: number; major: number};
};

// Mercator constants
const TILE_SIZE = 512;
const DEGREES_TO_RADIANS = Math.PI / 180;

// Create an interleaved deck instance.
export function getDeckInstance({
  map,
  gl,
  deck,
}: {
  map: Map & { __deck?: Deck | null };
  gl: WebGLRenderingContext;
  deck?: Deck;
}): Deck {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  // Only initialize certain props once per context
  const customRender = deck?.props._customRender;
  const onLoad = deck?.props.onLoad;

  const deckProps = getInterleavedProps({
    ...deck?.props,
    _customRender: () => {
      map.triggerRepaint();
      // customRender may be subscribed by DeckGL React component to update child props
      // make sure it is still called
      // Hack - do not pass a redraw reason here to prevent the React component from clearing the context
      // Rerender will be triggered by MapboxLayer's render()
      customRender?.('');
    },
  });

  let deckInstance: Deck;

  if (!deck || deck.props.gl === gl) {
    // If deck isn't defined (Internal MapboxLayer use case),
    // or if deck is defined and is using the WebGLContext created by mapbox (MapboxOverlay and External MapboxLayer use case),
    // block deck from setting the canvas size, and use the map's viewState to drive deck.
    // Otherwise, we use deck's viewState to drive the map.
    Object.assign(deckProps, {
      gl,
      width: null,
      height: null,
      touchAction: 'unset',
      viewState: getViewState(map),
    });
    if (deck?.isInitialized) {
      watchMapMove(deck, map);
    } else {
      deckProps.onLoad = () => {
        onLoad?.();
        watchMapMove(deckInstance, map);
      };
    }
  }

  if (deck) {
    deckInstance = deck;
    deck.setProps(deckProps);
    (deck.userData as UserData).isExternal = true;
  } else {
    deckInstance = new Deck(deckProps);
    map.on('remove', () => {
      removeDeckInstance(map);
    });
  }

  (deckInstance.userData as UserData).mapboxLayers = new Set();
  // (deckInstance.userData as UserData).mapboxVersion = getMapboxVersion(map);
  map.__deck = deckInstance;
  map.on('render', () => {
    if (deckInstance.isInitialized) afterRender(deckInstance, map);
  });

  return deckInstance;
}

function watchMapMove(deck: Deck, map: Map & { __deck?: Deck | null }) {
  const _handleMapMove = () => {
    if (deck.isInitialized) {
      // call view state methods
      onMapMove(deck, map);
    } else {
      // deregister itself when deck is finalized
      map.off('move', _handleMapMove);
    }
  };
  map.on('move', _handleMapMove);
}

export function removeDeckInstance(map: Map & { __deck?: Deck | null }) {
  map.__deck?.finalize();
  map.__deck = null;
}

export function getInterleavedProps(currProps: DeckProps) {
  const nextProps: DeckProps = {
    ...currProps,
    // TODO: import these defaults from a single source of truth
    parameters: {
      depthMask: true,
      depthTest: true,
      blend: true,
      blendFunc: [
        GL.SRC_ALPHA,
        GL.ONE_MINUS_SRC_ALPHA,
        GL.ONE,
        GL.ONE_MINUS_SRC_ALPHA,
      ],
      polygonOffsetFill: true,
      depthFunc: GL.LEQUAL,
      blendEquation: GL.FUNC_ADD,
      ...currProps.parameters,
    },
    views: currProps.views || [new MapView({ id: 'mapbox' })],
  };

  return nextProps;
}

export function addLayer(deck: Deck, layer: MapboxLayer<any>): void {
  (deck.userData as UserData).mapboxLayers.add(layer);
  updateLayers(deck);
}

export function removeLayer(deck: Deck, layer: MapboxLayer<any>): void {
  (deck.userData as UserData).mapboxLayers.delete(layer);
  updateLayers(deck);
}

export function updateLayer(deck: Deck, layer: MapboxLayer<any>): void {
  updateLayers(deck);
}

export function drawLayer(deck: Deck, map: Map, layer: MapboxLayer<any>): void {
  let { currentViewport } = deck.userData as UserData;
  let clearStack = false;
  if (!currentViewport) {
    // This is the first layer drawn in this render cycle.
    // Generate viewport from the current map state.
    currentViewport = getViewport(deck, map, true);
    (deck.userData as UserData).currentViewport = currentViewport;
    clearStack = true;
  }

  if (!deck.isInitialized) {
    return;
  }

  deck._drawLayers('mapbox-repaint', {
    viewports: [currentViewport],
    layerFilter: ({ layer: deckLayer }) => layer.id === deckLayer.id,
    clearStack,
    clearCanvas: false,
  });
}

export function getViewState(map: Map): MapViewState & {
  repeat: boolean;
  padding: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
} {
  const { lng, lat } = map.getCenter();

  const viewState: MapViewState & {
    repeat: boolean;
    padding: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
  } = {
    // Longitude returned by getCenter can be outside of [-180, 180] when zooming near the anti meridian
    // https://github.com/visgl/deck.gl/issues/6894
    longitude: ((lng + 540) % 360) - 180,
    latitude: lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    padding: map.getPadding(),
    repeat: map.getRenderWorldCopies(),
  };

  return viewState;
}

function getViewport(
  deck: Deck,
  map: Map,
  useMapboxProjection = true
): WebMercatorViewport {
  return new WebMercatorViewport({
    id: 'mapbox',
    x: 0,
    y: 0,
    width: deck.width,
    height: deck.height,
    ...getViewState(map),
    nearZMultiplier: useMapboxProjection
      ? // match mapbox-gl@>=1.3.0's projection matrix
        0.02
      : // use deck.gl's own default
        0.1,
  });
}

function afterRender(deck: Deck, map: Map): void {
  const { mapboxLayers, isExternal } = deck.userData as UserData;

  if (isExternal) {
    // Draw non-Mapbox layers
    const mapboxLayerIds = Array.from(mapboxLayers, layer => layer.id);
    const deckLayers = flatten(deck.props.layers, Boolean) as Layer[];
    const hasNonMapboxLayers = deckLayers.some(
      layer => layer && !mapboxLayerIds.includes(layer.id)
    );
    let viewports = deck.getViewports();
    const mapboxViewportIdx = viewports.findIndex(vp => vp.id === 'mapbox');
    const hasNonMapboxViews = viewports.length > 1 || mapboxViewportIdx < 0;

    if (hasNonMapboxLayers || hasNonMapboxViews) {
      if (mapboxViewportIdx >= 0) {
        viewports = viewports.slice();
        viewports[mapboxViewportIdx] = getViewport(deck, map, false);
      }

      deck._drawLayers('mapbox-repaint', {
        viewports,
        layerFilter: params =>
          (!deck.props.layerFilter || deck.props.layerFilter(params)) &&
          (params.viewport.id !== 'mapbox' ||
            !mapboxLayerIds.includes(params.layer.id)),
        clearCanvas: false,
      });
    }
  }

  // End of render cycle, clear generated viewport
  (deck.userData as UserData).currentViewport = null;
}

function onMapMove(deck: Deck, map: Map): void {
  deck.setProps({
    viewState: getViewState(map),
  });
  // Camera changed, will trigger a map repaint right after this
  // Clear any change flag triggered by setting viewState so that deck does not request
  // a second repaint
  deck.needsRedraw({ clearRedrawFlags: true });
}

function updateLayers(deck: Deck): void {
  if ((deck.userData as UserData).isExternal) {
    return;
  }

  const layers: Layer[] = [];
  (deck.userData as UserData).mapboxLayers.forEach(deckLayer => {
    const LayerType = deckLayer.props.type;
    const layer = new LayerType(deckLayer.props);
    layers.push(layer);
  });
  deck.setProps({ layers });
}
