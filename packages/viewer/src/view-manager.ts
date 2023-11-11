import {
  MapView,
  MapViewState,
  WebMercatorViewport,
} from '@deck.gl/core/typed';
import { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller';
import {
  MVTLayerProps,
  MVTLayer,
  Tile3DLayerProps,
  Tile3DLayer,
  TerrainLayer,
  TerrainLayerProps,
} from '@deck.gl/geo-layers/typed';
import { _TerrainExtension as TerrainExtension } from '@deck.gl/extensions/typed';
import {
  Feature,
  FeatureState,
  DEFAULT_FEATURE_FILL_COLOR,
  DEFAULT_FEATURE_STROKE_COLOR,
  DEFAULT_FEATURE_ELEVATION,
  DEFAULT_FEATURE_OPACITY,
} from './feature/feature';
import { Viewer } from './viewer';
import { LayoutManager } from './layout-manager';
import { FeatureStateMap } from './feature-manager';

export type SectionViewState = {
  id: string; // use for mapping section viewstate id (and nest the viewstates between view and view section ? viewId-sectionId?)
  // this is for the config of the order
  featureStates?: FeatureState[];
  // this is for caching (like layout engine)
  featureStateMap?: FeatureStateMap;
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
  currentSectionViewStateId: string | null = null;
  layoutManager: LayoutManager;
  constructor({ viewer }: ViewManagerProps) {
    this.viewer = viewer;
    const {
      darkMode,
      darkModeBackgroundColor,
      lightModeBackgroundColor,
      backgroundColor,
    } = this.viewer.props;
    this.currentViewId = 'main';
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

  getCurrentSectionViewState(): SectionViewState {
    const view = this.views[this.currentViewId || 'main'];
    return view.sectionViewState;
  }

  getCurrentSectionViewStateFeatureStates(): FeatureState[] {
    const section = this.getCurrentSectionViewState();
    return section.featureStates || [];
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
        id: this.currentViewId,
        controller: { dragMode: 'pan', dragPan: true, inertia: false },
        width: this.viewer.props.width,
        height: this.viewer.props.height,
      } as any),
    ];
  }

  getView(viewId: string): View | undefined {
    return this.views[viewId];
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
    viewId: string,
    sectionId: string
  ): SectionViewState | undefined {
    const view = this.views[viewId];
    if (view) {
      return view.sections?.find(section => section.id === sectionId);
    }
  }

  getSectionViewStateIndex(sectionId: string): number | undefined {
    if (this.currentViewId) {
      const view = this.views[this.currentViewId];
      if (view) {
        return view.sections?.findIndex(section => section.id === sectionId);
      }
    }
  }

  addSectionViewState(viewState: SectionViewState, viewId: string): boolean {
    const view = this.views[viewId];
    if (view) {
      view.sections = view.sections || [];
      if (!view.sections.find(section => section.id === viewState.id)) {
        view.sections.push(viewState);
        return true;
      }
      return false;
    }
    return false;
  }

  updateSectionViewState(viewState: SectionViewState, viewId: string): void {
    const view = this.views[viewId];
    if (view) {
      const section = view.sections?.find(
        section => section.id === viewState.id
      );
      if (section) {
        Object.assign(section, viewState);
      }
    }
  }

  addView(view: View): void {
    const currentView = this.getCurrentView();
    const { height, width } = currentView || { height: 0, width: 0 };
    const currentViewState = this.getCurrentSectionViewState();
    const {
      longitude,
      latitude,
      zoom,
      pitch,
      bearing,
      minZoom,
      maxZoom,
      backgroundColor,
    } = currentViewState || {};
    const newViewState = {
      ...(view.sectionViewState || {}),
      longitude: view.sectionViewState?.longitude || longitude || 0,
      latitude: view.sectionViewState?.latitude || latitude || 0,
      zoom: view.sectionViewState?.zoom || zoom || 0,
      pitch: view.sectionViewState?.pitch || pitch || 0,
      bearing: view.sectionViewState?.bearing || bearing || 0,
      minZoom: view.sectionViewState?.minZoom || minZoom || 0,
      maxZoom: view.sectionViewState?.maxZoom || maxZoom || 25,
    };
    const newView = {
      ...view,
      width: view.width || width,
      height: view.height || height,
      viewState: newViewState,
      parentSectionViewState: currentViewState,
    };
    this.views[newView.id] = view;
  }

  // call this from app when new viewstate is rendered (fly to is done)
  // todo: use json config to set instances from config in view
  async setView(viewId: string): Promise<void> {
    this.currentViewId = viewId;
    const view = this.views[viewId] || this.views.main;
    if (!view) {
      return;
    }
    // process view to activate it, for example json config

    // create map of all feature states and add instances to section
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

  getZoomToExtentParams(bounds: [number, number, number, number]) {
    // todo: get width and height from view (after converted to pixels as it can be defined in percentage..)
    const width = window.innerWidth;
    const height = window.innerHeight;
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const viewport = new WebMercatorViewport({ width, height });
    const { longitude, latitude, zoom } = viewport.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 0 }
    );

    return { longitude, latitude, zoom };
  }

  setSectionViewState(sectionId: string): void {
    const view = this.getCurrentView();
    if (!view) {
      return;
    }
    const sourceSection = this.getCurrentSectionViewState();
    const targetSection = view.sections?.find(
      section => section.id === sectionId
    );
    if (!targetSection) {
      return;
    }
    this.currentSectionViewStateId = sectionId;
    view.sectionViewState = JSON.parse(JSON.stringify(targetSection));
    // todo: do animation between current and new section viewstate
    this.viewer.update();
  }

  getBackgroundColor(): number[] {
    return this.views.main.sectionViewState.backgroundColor || [99, 255, 255];
  }

  // "View layers" are more on base map / context side compared to "Feature layers" (in feature manager) that are more on the GeoJSON / overlay side
  getLayers() {
    const viewLayers: any[] = [];
    const currentSectionViewState = this.getCurrentSectionViewState();
    const featureStateMap =
      currentSectionViewState.featureStateMap || ({} as FeatureStateMap);
    Object.values(this.views).forEach(view => {
      if (view.terrainLayerConfig && this.viewer.props.showTerrain) {
        Object.values(view.terrainLayerConfig).forEach(terrainLayerConfig => {
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
                extruded: this.isPitched(),
                opacity: 0.2,
                getFillColor: (f: any) => {
                  const featureState = featureStateMap[f.properties._id] || {};
                  return featureState.fillColor || DEFAULT_FEATURE_FILL_COLOR;
                },
                getLineColor: (f: any) => {
                  const featureState = featureStateMap[f.properties._id] || {};
                  return (
                    featureState.strokeColor || DEFAULT_FEATURE_STROKE_COLOR
                  );
                },
                extensions: this.viewer.props.showTerrain
                  ? [new TerrainExtension()]
                  : [],
              },
            })
          );
        });
      }
    });
    return viewLayers;
  }

  isPitched(): boolean {
    const currentViewState = this.getCurrentSectionViewState();
    return (currentViewState?.pitch || 0) > 0 ? true : false;
  }

  // call this from app when user clicks to go to next view
  goToView(viewId: string, viewSection?: string): void {
    // from viewstate
    const fromView: View = this.getCurrentView() || ({} as View);
    const fromSection: SectionViewState =
      this.getCurrentSectionViewState() || this.views.main.sectionViewState;
    const fromZoom = this.viewer.props.zoom || 0;
    // to viewstate
    const toView: View = this.views[viewId];
    if (!toView) {
      console.warn(`View with path ${viewId} not found`);
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
