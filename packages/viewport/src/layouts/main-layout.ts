import { GetViewProps, Layout, LayoutProps } from './layout';
import { getMapLayers } from './layers/map-layers';
import {
  Deck,
  DeckProps,
  MapView,
  _GlobeView as GlobeView,
  MapViewState,
  OrbitViewState,
} from '@deck.gl/core/typed';

export class MainLayout extends Layout {
  constructor({ parentFeature }: LayoutProps) {
    super({ parentFeature });
  }

  getView({ disableController }: GetViewProps) {
    const { width, height, viewX, viewY } = this.getCameraFrame();

    const viewProps = {
      id: this.getViewId(),
      //   controller: disableController
      //     ? false
      //     : { dragMode: 'pan', dragPan: true, inertia: false },
      controller: true,
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
    return layers;
  }
}
