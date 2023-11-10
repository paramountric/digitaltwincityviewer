import { MapView, MapViewState } from '@deck.gl/core/typed';
import { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller';
import {
  MVTLayerProps,
  MVTLayer,
  Tile3DLayerProps,
  Tile3DLayer,
  TerrainLayer,
  TerrainLayerProps,
} from '@deck.gl/geo-layers/typed';
import {
  _TerrainExtension as TerrainExtension,
  TerrainExtensionProps,
} from '@deck.gl/extensions/typed';
import { Feature, FeatureState } from './feature/feature';
import { Viewer } from './viewer';
import { LayoutManager } from './layout-manager';

export type SectionViewState = {
  id: string; // use for mapping section viewstate id (and nest the viewstates between view and view section ? viewId-sectionId?)
  // this is for the config of the order
  featureStates?: FeatureState[];
  // this is for caching (like layout engine)
  featureStateMap?: {
    [featureId: string]: FeatureState;
  };
  backgroundColor?: number[];
  zoom?: number;
  longitude?: number;
  latitude?: number;
  pitch?: number;
  bearing?: number;
} & MapViewState; // override viewState for section state;

export type View = {
  id: string; // use for mapping section viewstate id
  /** State of the view */
  sectionViewState: SectionViewState;
  // different sections of this view (if missing, use the viewState only)
  sections?: SectionViewState[];
  // parent section of a parent view
  parentSectionViewState?: SectionViewState; // to get back to the parent coordinates when nesting views
  mvtLayerConfig?: {
    // todo: use json config
    [layerId: string]: MVTLayerProps;
  };
  tile3dLayerConfig?: {
    // todo: use json config
    [layerId: string]: Tile3DLayerProps;
  };
  terrainLayerConfig?: {
    [layerId: string]: TerrainLayerProps;
  };
  /** A relative (e.g. `'50%'`) or absolute position. Default `0`. */
  x?: number | string;
  /** A relative (e.g. `'50%'`) or absolute position. Default `0`. */
  y?: number | string;
  /** A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`. */
  width?: number | string;
  /** A relative (e.g. `'50%'`) or absolute extent. Default `'100%'`. */
  height?: number | string;
  /** Padding around the view, expressed in either relative (e.g. `'50%'`) or absolute pixels. Default `null`. */
  padding?: {
    left?: number | string;
    right?: number | string;
    top?: number | string;
    bottom?: number | string;
  } | null;
};

export type ViewMap = {
  [path: string]: View;
};

export type ViewManagerProps = {
  viewer: Viewer;
};

export class ViewManager {
  viewer: Viewer;
  views: ViewMap;
  currentViewId: string | null = null;
  currentSectionViewState: string | null = null;
  layoutManager: LayoutManager;
  constructor({ viewer }: ViewManagerProps) {
    this.viewer = viewer;
    const {
      darkMode,
      darkModeBackgroundColor,
      lightModeBackgroundColor,
      backgroundColor,
    } = this.viewer.props;
    this.views = {
      main: {
        id: 'main',
        sectionViewState: {
          id: 'main',
          longitude: this.viewer.props.longitude || 0,
          latitude: this.viewer.props.latitude || 0,
          zoom: this.viewer.props.zoom || 0,
          pitch: this.viewer.props.pitch || 0,
          bearing: this.viewer.props.bearing || 0,
          minZoom: this.viewer.props.minZoom || 0,
          maxZoom: this.viewer.props.maxZoom || 25,
          backgroundColor: darkMode
            ? darkModeBackgroundColor || backgroundColor
            : lightModeBackgroundColor || backgroundColor,
        },
        width: this.viewer.props.width,
        height: this.viewer.props.height,
      },
    };
    if (viewer.props.mvtLayerConfig) {
      this.views.main.mvtLayerConfig = viewer.props.mvtLayerConfig;
    }
    if (viewer.props.tile3dLayerConfig) {
      this.views.main.tile3dLayerConfig = viewer.props.tile3dLayerConfig;
    }
    if (viewer.props.terrainLayerConfig) {
      this.views.main.terrainLayerConfig = viewer.props.terrainLayerConfig;
    }
    this.layoutManager = new LayoutManager(this.viewer);
    this.onViewStateChange = this.onViewStateChange.bind(this);
  }

  getCurrentView(): View | undefined {
    if (this.currentViewId) {
      return this.views[this.currentViewId];
    }
  }

  getCurrentSectionViewState(): SectionViewState | undefined {
    if (this.currentViewId) {
      const view = this.views[this.currentViewId];
      if (view) {
        return view.sections?.find(
          section => section.id === this.currentSectionViewState
        );
      }
    }
  }

  getCurrentSectionViewStateFeatureStates(): FeatureState[] | undefined {
    const section = this.getCurrentSectionViewState();
    if (section && section.featureStates) {
      return Object.values(section.featureStates);
    }
  }

  getMainView(): View {
    return this.views.main;
  }

  getMainSectionViewState(): SectionViewState {
    return this.views.main.sectionViewState;
  }

  getViews() {
    // todo: add more views and use this.views
    return [
      new MapView({
        id: 'main',
        controller: { dragMode: 'pan', dragPan: true, inertia: false },
        width: this.viewer.props.width,
        height: this.viewer.props.height,
      } as any),
    ];
  }

  getView(viewPath: string): View | undefined {
    return this.views[viewPath];
  }

  getViewStates(): {
    [viewId: string]: MapViewState;
  } {
    const viewStates: { [viewId: string]: MapViewState } = {};
    Object.values(this.views).forEach(view => {
      viewStates[view.id] = view.sectionViewState;
    });
    return viewStates;
  }

  onViewStateChange({
    viewState,
    viewId,
    interactionState,
    oldViewState,
  }: ViewStateChangeParameters & { viewId: string }) {
    if (!this.viewer) {
      return;
    }
    if (this.views[viewId]) {
      this.views[viewId].sectionViewState = {
        ...this.views[viewId].sectionViewState,
        ...viewState,
      };
    }
    this.viewer.update();
  }

  getSectionViewState(
    viewPath: string,
    sectionAnchor: string
  ): SectionViewState | undefined {
    const view = this.views[viewPath];
    if (view) {
      return view.sections?.find(section => section.id === sectionAnchor);
    }
  }

  getSectionViewStateIndex(sectionAnchor: string): number | undefined {
    if (this.currentViewId) {
      const view = this.views[this.currentViewId];
      if (view) {
        return view.sections?.findIndex(
          section => section.id === sectionAnchor
        );
      }
    }
  }

  // call this from app when new viewstate is rendered (fly to is done)
  // use json config to set instances from config in view
  async setView(viewPath: string): Promise<void> {
    this.currentViewId = viewPath;
    const view = this.views[viewPath] || this.views.main;
    if (!view) {
      return;
    }
    // process view to activate it

    // create map of all feature states
    for (const section of view.sections || []) {
      section.featureStateMap = {};
      if (section.featureStates) {
        for (const featureState of section.featureStates) {
          const feature = await this.viewer.featureManager.getFeatureById(
            featureState.featureId
          );
          if (feature) {
            featureState.feature = feature;
            section.featureStateMap[feature._id] = featureState;
          }
        }
      }
    }
  }

  setSectionViewState(sectionAnchor: string): void {
    const view = this.getCurrentView();
    if (!view) {
      return;
    }
    const sourceSection = this.getCurrentSectionViewState();
    const targetSection = view.sections?.find(
      section => section.id === sectionAnchor
    );
    if (!targetSection) {
      return;
    }
    this.currentSectionViewState = sectionAnchor;
    this.viewer.update();
  }

  getBackgroundColor(): number[] {
    return this.views.main.sectionViewState.backgroundColor || [99, 255, 255];
  }

  // "View layers" are more on base map / context side compared to "Feature layers" (in feature manager) that are more on the GeoJSON / overlay side
  getLayers() {
    const viewLayers: any[] = [];
    let hasTerrain = false;
    Object.values(this.views).forEach(view => {
      if (view.terrainLayerConfig) {
        Object.values(view.terrainLayerConfig).forEach(terrainLayerConfig => {
          hasTerrain = true;
          viewLayers.push(
            new TerrainLayer({
              id: 'terrain',
              minZoom: 0,
              maxZoom: 23,
              strategy: 'no-overlap',
              elevationDecoder: {
                rScaler: 6553.6,
                gScaler: 25.6,
                bScaler: 0.1,
                offset: -10000,
              },
              elevationData: terrainLayerConfig.data,
              texture: terrainLayerConfig.texture,
              operation: 'terrain+draw',
            })
          );
        });
      }
      if (view.tile3dLayerConfig) {
        Object.values(view.tile3dLayerConfig).forEach(tile3dLayerConfig => {
          hasTerrain = true;
          viewLayers.push(
            new Tile3DLayer({
              ...tile3dLayerConfig,
              ...{
                id: 'google-3d-tiles',
                data: tile3dLayerConfig.data,
                loadOptions: tile3dLayerConfig.loadOptions,
              },
              operation: 'terrain+draw',
            })
          );
        });
      }
      if (view.mvtLayerConfig) {
        const currentViewState = this.getCurrentSectionViewState();
        Object.values(view.mvtLayerConfig).forEach(mvtLayerConfig => {
          viewLayers.push(
            new MVTLayer({
              ...mvtLayerConfig,
              ...{
                getElevation: (f: any) => {
                  const defaultFeatureStates =
                    this.viewer.props.defaultFeatureStates || {};
                  const defaultFeatureState =
                    defaultFeatureStates[f.properties.layerName];
                  return (
                    // f.properties.render_height ||
                    defaultFeatureState?.elevation || 0
                  );
                },
                extruded: (this.views.main.sectionViewState.pitch || 0) > 0,
                opacity: 0.2,
                getFillColor: (f: any) => {
                  // todo: figure out how to be flexible with the feature state, so that property values can be used (like mapbox color expressions)
                  const defaultFeatureStates =
                    this.viewer.props.defaultFeatureStates || ({} as any);
                  const defaultFeatureState =
                    defaultFeatureStates[f.properties.layerName];
                  // const featureState = f.state;
                  // const sectionFeatureMap =
                  //   currentViewState?.featureStateMap || {};
                  // const sectionFeatureState = sectionFeatureMap[f._id];
                  if (!defaultFeatureStates[f.properties.layerName]) {
                    console.warn(
                      `Feature state for layer ${f.properties.layerName} not found`
                    );
                  }
                  return (
                    // sectionFeatureState?.fillColor ||
                    // featureState?.fillColor ||
                    defaultFeatureState?.fillColor || [255, 255, 255]
                  );
                },
                getLineColor: (f: any) => {
                  const defaultFeatureStates =
                    this.viewer.props.defaultFeatureStates || ({} as any);
                  const defaultFeatureState =
                    defaultFeatureStates[f.properties.layerName];
                  // const featureState = f.state;
                  // const sectionFeatureMap =
                  //   currentViewState?.featureStateMap || {};
                  // const sectionFeatureState = sectionFeatureMap[f._id];
                  if (!defaultFeatureStates[f.properties.layerName]) {
                    console.warn(
                      `Feature state for layer ${f.properties.layerName} not found`
                    );
                  }
                  return (
                    // sectionFeatureState?.strokeColor ||
                    // featureState?.strokeColor ||
                    defaultFeatureState?.strokeColor || [255, 255, 255]
                  );
                },
                extensions: hasTerrain ? [new TerrainExtension()] : [],
              },
            })
          );
        });
      }
    });
    return viewLayers;
  }

  // call this from app when user clicks to go to next view
  goToView(viewPath: string, viewSection?: string): void {
    // from viewstate
    const fromView: View = this.getCurrentView() || ({} as View);
    const fromSection: SectionViewState =
      this.getCurrentSectionViewState() || this.views.main.sectionViewState;
    const fromZoom = this.viewer.props.zoom || 0;
    // to viewstate
    const toView: View = this.views[viewPath];
    if (!toView) {
      console.warn(`View with path ${viewPath} not found`);
      return;
    }
    const toSection = toView.sections?.find(
      section => section.id === viewSection
    );
    if (!toSection) {
      console.warn(`Section with id ${viewSection} not found`);
      return;
    }
    const toZoom = toSection.zoom || 0;
    // figure out what is needed, it should be much simpler to just go from current state to a new state
    const zoomIn = toZoom > fromZoom;
    const mainViewState = this.views.main.sectionViewState;
    const targetFeatureState = toSection || mainViewState;
    const toLongitude = targetFeatureState.longitude;
    const toLatitude = targetFeatureState.latitude;
    const sourceFeatureState = fromView.parentSectionViewState || mainViewState;
    const fromLongitude = sourceFeatureState.longitude;
    const fromLatitude = sourceFeatureState.latitude;
    const toPitch = toSection.pitch || 0;
    const toBearing = toSection.bearing || 0;

    // if (!zoomIn) {
    //   // set zoom and target to the zoomed in version (because presentation view is in parent node view - full screen)
    //   Object.assign(this.viewport.props, {
    //     zoom: fromZoom,
    //     target: source,
    //   });
    //   // this is a hack to prevent the emit to update the view on the next cycle stopping the animation
    //   this.preventUpdate = true;
    //   // set back to the previous view before start animating
    //   this.viewport.emit('set-view', { view: toView }); // will call update
    // }
    // // first to an update for disable controller and animation of nodes
    // this.viewport.update();

    // // then update for the camera fly animation
    // this.viewport.update({
    //   flyTo: {
    //     target,
    //     zoom: toZoom,
    //     // always fly straight in
    //     rotationOrbit: 0,
    //     rotationX: 90,
    //     transitionDuration: toView.isPopup || fromView.isPopup ? 50 : 500,
    //     transitionInterruption: TRANSITION_EVENTS.IGNORE,
    //     transitionInterpolator: new ZoomToNodeInterpolator(!zoomIn),
    //     onTransitionEnd: () => {
    //       Object.assign(this.viewport.props, {
    //         // all presentation views are in default target (center NOT [0, 0, 0]!!!)
    //         // override target for views in setView
    //         target: [projectNode.x, projectNode.y, projectNode.z],
    //         // target: [0, 0, 0],
    //         // all presentation views are in zoom 0
    //         zoom: 0,
    //         rotationOrbit,
    //         rotationX,
    //         // rotationOrbit: 0,
    //         // rotationX: 90,
    //       });
    //       this.viewport.props.disableController2 = true;
    //       this.viewport.props.animateNodes = true;
    //       if (zoomIn) {
    //         // mostly used for testing
    //         if (toView.onLoad) {
    //           toView.onLoad();
    //         }
    //         // app needs to call the setView function since the elements need to be rendered first
    //         this.viewport.emit('set-view', { view: toView }); // will call update
    //       } else {
    //         this.viewport.update();
    //         // set back the flag to enable update on emit set-view
    //         this.preventUpdate = false;
    //       }
    //     },
    //   },
    // });
  }
}
