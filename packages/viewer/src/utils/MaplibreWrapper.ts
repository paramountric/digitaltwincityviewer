// This code is derived from Deck.gl. Copyright MIT, 2020 Urban Computing Foundation
// Here Maplibre is used.
import { Deck, WebMercatorViewport, MapView, Layer } from '@deck.gl/core/typed';
import { Map as MaplibreMap } from 'maplibre-gl';

function getDeckInstance({
  map,
  gl,
  deck,
}: {
  map: MaplibreMap;
  gl: WebGLRenderingContext;
  deck: Deck;
}) {
  // Only create one deck instance per context
  if (map.__deck) {
    return map.__deck;
  }

  // const customRender = deck && deck.props._customRender;

  const deckProps = {
    useDevicePixels: true,
    // _customRender: () => {
    //   map.triggerRepaint();
    //   if (customRender) {
    //     // customRender may be subscribed by DeckGL React component to update child props
    //     // make sure it is still called
    //     customRender();
    //   }
    // },
    // TODO: import these defaults from a single source of truth
    parameters: {
      depthMask: true,
      depthTest: true,
      blend: true,
      blendFunc: [
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA,
      ],
      polygonOffsetFill: true,
      depthFunc: gl.LEQUAL,
      blendEquation: gl.FUNC_ADD,
    },
    userData: {
      isExternal: false,
      maplibreLayers: new Set(),
    },
    views: (deck && deck.props.views) || [new MapView({ id: 'mapview' })],
  };

  if (!deck || deck.props.gl === gl) {
    console.warn('dont use maplibre gl context');
    // deck is using the WebGLContext created by maplibre
    // block deck from setting the canvas size
    Object.assign(deckProps, {
      gl,
      width: false,
      height: false,
      touchAction: 'unset',
      viewState: getViewState(map),
    });
    // If using the WebGLContext created by deck (React use case), we use deck's viewState to drive the map.
    // Otherwise (pure JS use case), we use the map's viewState to drive deck.
    map.on('move', () => onMapMove(deck, map));
  }

  if (deck) {
    deck.setProps(deckProps);
    // @ts-ignore
    deck.props.userData.isExternal = true;
  } else {
    deck = new Deck(deckProps);
    map.on('remove', () => {
      deck.finalize();
      // @ts-ignore
      map.__deck = null;
    });
  }

  // @ts-ignore
  deck.props.userData.mapboxVersion = getMapboxVersion(map);
  // @ts-ignore
  map.__deck = deck;
  map.on('render', () => {
    if (deck.layerManager) afterRender(deck, map);
  });

  return deck;
}

function addLayer(deck: Deck, layer: Layer) {
  // @ts-ignore
  deck.props.userData.maplibreLayers.add(layer);
  // updateLayers(deck);
}

function removeLayer(deck: Deck, layer: Layer) {
  // @ts-ignore
  deck.props.userData.maplibreLayers.delete(layer);
  // updateLayers(deck);
}

// function updateLayer(deck, layer) {
//   updateLayers(deck);
// }

function drawLayer(deck: Deck, map: MaplibreMap, layer: Layer) {
  // @ts-ignore
  let { currentViewport } = deck.props.userData;
  if (!currentViewport) {
    // This is the first layer drawn in this render cycle.
    // Generate viewport from the current map state.
    currentViewport = getViewport(deck, map, true);
    // @ts-ignore
    deck.props.userData.currentViewport = currentViewport;
  }
  // @ts-ignore
  if (!deck.layerManager) {
    return;
  }

  deck._drawLayers('mapbox-repaint', {
    viewports: [currentViewport],
    layerFilter: ({ layer: deckLayer }: any) => layer.id === deckLayer.id,
    clearCanvas: false,
  });
}

function getViewState(map: MaplibreMap) {
  const { lng, lat } = map.getCenter();
  return {
    longitude: lng,
    latitude: lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    repeat: map.getRenderWorldCopies(),
  };
}

function getMapboxVersion(map: MaplibreMap) {
  // parse mapbox version string
  let major = 0;
  let minor = 0;
  if (map.version) {
    [major, minor] = map.version.split('.').slice(0, 2).map(Number);
  }
  return { major, minor };
}

function getViewport(deck: Deck, map: MaplibreMap, useMapboxProjection = true) {
  // @ts-ignore
  const { mapboxVersion } = deck.props.userData;

  return new WebMercatorViewport(
    Object.assign(
      {
        id: 'mapbox',
        x: 0,
        y: 0,
        width: deck.width,
        height: deck.height,
      },
      getViewState(map),
      useMapboxProjection
        ? {
            // match mapbox's projection matrix
            // A change of near plane was made in 1.3.0
            // https://github.com/mapbox/mapbox-gl-js/pull/8502
            nearZMultiplier:
              (mapboxVersion.major === 1 && mapboxVersion.minor >= 3) ||
              mapboxVersion.major >= 2
                ? 0.02
                : 1 / (deck.height || 1),
          }
        : {
            // use deck.gl's own default
            nearZMultiplier: 0.1,
          }
    )
  );
}

function afterRender(deck: Deck, map: MaplibreMap) {
  const { maplibreLayers, isExternal } = deck.props.userData;

  if (isExternal) {
    // Draw non-Mapbox layers
    const mapboxLayerIds = Array.from(
      maplibreLayers,
      (layer: Layer) => layer.id
    );
    const hasNonmaplibreLayers = deck.props.layers.some(
      (layer: Layer) => !mapboxLayerIds.includes(layer.id)
    );
    let viewports = deck.getViewports();
    const mapboxViewportIdx = viewports.findIndex(vp => vp.id === 'mapbox');
    const hasNonMapboxViews = viewports.length > 1 || mapboxViewportIdx < 0;

    if (hasNonmaplibreLayers || hasNonMapboxViews) {
      if (mapboxViewportIdx >= 0) {
        viewports = viewports.slice();
        viewports[mapboxViewportIdx] = getViewport(deck, map, false);
      }

      deck._drawLayers('mapbox-repaint', {
        viewports,
        layerFilter: (params: any) =>
          (!deck.props.layerFilter || deck.props.layerFilter(params)) &&
          (params.viewport.id !== 'mapbox' ||
            !mapboxLayerIds.includes(params.layer.id)),
        clearCanvas: false,
      });
    }
  }

  // End of render cycle, clear generated viewport
  // @ts-ignore
  deck.props.userData.currentViewport = null;
}

function onMapMove(deck: Deck, map: MaplibreMap) {
  deck.setProps({
    viewState: getViewState(map),
  });
  // Camera changed, will trigger a map repaint right after this
  // Clear any change flag triggered by setting viewState so that deck does not request
  // a second repaint
  deck.needsRedraw({ clearRedrawFlags: true });
}

// function updateLayers(deck) {
//   if (deck.props.userData.isExternal) {
//     return;
//   }

//   const layers: Layer[] = [];
//   let layerIndex = 0;
//   deck.props.userData.maplibreLayers.forEach(deckLayer => {
//     const LayerType = deckLayer.props.type;
//     const layer = new LayerType(deckLayer.props, { _offset: layerIndex++ });
//     layers.push(layer);
//   });
//   deck.setProps({ layers });
// }

export default class MaplibreWrapper {
  id: string;
  type: string;
  renderingMode: string;
  map: maplibregl.Map | null;
  deck: Deck | null;
  props: any;
  /* eslint-disable no-this-before-super */
  constructor(props: any) {
    if (!props.id) {
      throw new Error('Layer must have an unique id');
    }

    this.id = props.id;
    this.type = 'custom';
    this.renderingMode = props.renderingMode || '3d';
    this.map = null;
    this.deck = null;
    this.props = props;
  }

  /* Mapbox custom layer methods */

  onAdd(map: MaplibreMap, gl: WebGL2RenderingContext) {
    if (this.deck === null) {
      return;
    }
    this.map = map;
    this.deck = getDeckInstance({ map, gl, deck: this.props.deck });
    addLayer(this.deck, this);
  }

  onRemove() {
    removeLayer(this.deck, this);
  }

  // setProps(props) {
  //   // id cannot be changed
  //   Object.assign(this.props, props, { id: this.id });
  //   // safe guard in case setProps is called before onAdd
  //   if (this.deck) {
  //     updateLayer(this.deck, this);
  //   }
  // }

  render(gl: WebGL2RenderingContext) {
    if (!this.deck || !this.map) {
      return;
    }
    drawLayer(this.deck, this.map, this);
  }
}
