import { GetViewProps, GetViewStateProps, Layout, LayoutProps } from "./layout";
import { getMapLayers } from "./layers/map-layers";
import {
  Deck,
  DeckProps,
  MapView,
  _GlobeView as GlobeView,
  MapViewState,
  OrbitViewState,
  MapViewProps,
  Layer,
  OrbitView,
} from "@deck.gl/core";
import { getEditFeatureLayer } from "./layers/edit-feature-layer";
import { createGltfLayers } from "./layers/gltf-layer";
import { Feature } from "../feature";

export class MainLayout extends Layout {
  constructor({ parentFeature, viewport }: LayoutProps) {
    super({ parentFeature, viewport });
    this.baseMap = "mvt";
  }

  getView({ disableController, view3d }: GetViewProps) {
    const { width, height, viewX, viewY } = this.getCameraFrame();

    if (view3d) {
      return new OrbitView({
        id: this.getViewId(),
        controller: disableController
          ? false
          : {
              doubleClickZoom: false,
              dragMode: "pan",
              dragPan: true,
              inertia: false,
            },
      });
    }

    const viewProps: MapViewProps = {
      id: this.getViewId(),
      controller: disableController
        ? false
        : {
            doubleClickZoom: false,
            dragMode: "pan",
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

  getViewState({ view3d }: GetViewStateProps): MapViewState | OrbitViewState {
    const {
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
      target,
      rotationOrbit,
      rotationX,
    } = this.cameraFrame;

    if (view3d) {
      return {
        zoom,
        target: target as [number, number, number],
        rotationOrbit,
        rotationX,
      } as OrbitViewState;
    }

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
    const layers: Layer[] = [];
    const visibleFeatures = this.getVisibleFeatures();

    if (visibleFeatures.length > 0) {
      const gltfLayers = createGltfLayers({
        features: visibleFeatures,
        layout: this as Layout,
      });
      layers.push(...(gltfLayers || []));
    } else {
      const mapLayers: Layer[] = getMapLayers({
        layout: this as Layout,
        features: visibleFeatures,
      });
      layers.push(...(mapLayers || []));
      const editFeatureLayer = getEditFeatureLayer({
        layout: this as Layout,
        interactionManager: this.viewport.interactionManager,
        features: visibleFeatures,
        selectedFeatureIndexes: [],
      });
      layers.push(...(editFeatureLayer || []));
    }

    return layers;
  }
}
