import { GetViewProps, Layout, LayoutProps } from './layout';
import { getMapLayers } from './layers/map-layers';
import {
  Deck,
  DeckProps,
  MapView,
  _GlobeView as GlobeView,
  MapViewState,
  OrbitViewState,
  MapViewProps,
} from '@deck.gl/core';
import { getEditFeatureLayer } from './layers/edit-feature-layer';

export class MainLayout extends Layout {
  constructor({ parentFeature, viewport }: LayoutProps) {
    super({ parentFeature, viewport });
    this.baseMap = 'mvt';
  }

  getView({ disableController }: GetViewProps) {
    const { width, height, viewX, viewY } = this.getCameraFrame();

    const viewProps: MapViewProps = {
      id: this.getViewId(),
      controller: disableController
        ? false
        : {
            doubleClickZoom: false,
            dragMode: 'pan',
            dragPan: true,
            inertia: false,
          },
      width,
      height,
      x: viewX,
      y: viewY,
    };

    return new MapView(viewProps);
  }

  getViewState(): MapViewState | OrbitViewState {
    const { latitude, longitude, zoom, bearing, pitch } = this.cameraFrame;

    const viewState: MapViewState = {
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
    };

    return viewState;
  }

  getLayers() {
    const layers = [];

    const visibleFeatures = this.getVisibleFeatures();
    const mapLayers = getMapLayers({
      layout: this as Layout,
      features: visibleFeatures,
    });
    layers.push(...mapLayers);
    const editFeatureLayer = getEditFeatureLayer({
      layout: this as Layout,
      interactionManager: this.viewport.interactionManager,
      features: visibleFeatures,
      selectedFeatureIndexes: [],
    });
    layers.push(...editFeatureLayer);
    return layers;
  }
}
