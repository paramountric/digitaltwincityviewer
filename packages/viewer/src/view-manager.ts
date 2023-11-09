import {
  TRANSITION_EVENTS,
  MapView,
  MapViewState,
  MapController,
} from '@deck.gl/core/typed';

import { Feature } from './feature/feature';
import { Viewer } from './viewer';
import { LayoutManager } from './layout-manager';

export type FeatureState = {
  feature?: Feature; // ref during runtime - serialized to featureId
  label?: string; // override feature name
  fontSize?: number;
  // morph geometry?
  coordinate?: [number, number, number]; // lon, lat, z
  size?: [number, number]; // width, height, use for imageSize?
  scale?: [number, number, number]; // x, y, z
  rotation?: [number, number, number]; // x, y, z
  fillColor?: number[];
  strokeColor?: number[];
  elevation?: number;
  opacity?: number;
  // override feature properties from feature ref in this state
} & Partial<Feature>;

export type SectionViewState = {
  id: string; // use for mapping section viewstate id
  // use id (and nest the viewstates between view and view section)
  featureStates?: FeatureState[];
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
    [layerId: string]: {
      data?: string;
    };
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
  currentViewPath: string | null = null;
  currentSectionViewState: string | null = null;
  layoutManager: LayoutManager;
  constructor({ viewer }: ViewManagerProps) {
    this.viewer = viewer;
    const { darkMode, darkModeBackgroundColor, lightModeBackgroundColor } =
      this.viewer.props;
    this.views = {
      main: {
        id: 'main',
        sectionViewState: {
          id: 'main',
          longitude: this.viewer.props.longitude || 0,
          latitude: this.viewer.props.latitude || 0,
          backgroundColor: darkMode
            ? darkModeBackgroundColor
            : lightModeBackgroundColor,
          zoom: 0,
        },
        width: this.viewer.props.width,
        height: this.viewer.props.height,
      },
    };
    this.layoutManager = new LayoutManager(this.viewer);
  }

  getCurrentView(): View | undefined {
    if (this.currentViewPath) {
      return this.views[this.currentViewPath];
    }
  }

  getCurrentSectionViewState(): SectionViewState | undefined {
    if (this.currentViewPath) {
      const view = this.views[this.currentViewPath];
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
    if (this.currentViewPath) {
      const view = this.views[this.currentViewPath];
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
    this.currentViewPath = viewPath;
    const view = this.views[viewPath] || this.views.main;
    if (!view) {
      return;
    }
    // process view to activate it
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
    return this.views.main.sectionViewState.backgroundColor || [255, 255, 255];
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
