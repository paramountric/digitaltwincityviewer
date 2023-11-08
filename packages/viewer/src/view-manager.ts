import { Feature } from './feature/feature';
import { Viewer } from './viewer';
import { TRANSITION_EVENTS } from '@deck.gl/core/typed';

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
};

export type ViewSection = {
  anchor: string; // use as id (unique for view)
  featureStates?: FeatureState[];
  backgroundColor?: number[];
  zoom?: number;
  longitude?: number;
  latitude?: number;
  pitch?: number;
  bearing?: number;
};

export type View = {
  path: string;
  // different sections of this view
  sections: ViewSection[];
  // parent section of a parent view
  parentViewSection: ViewSection | null; // to get back to the parent coordinates when nesting views
  // current interpolated section state
  viewSection?: ViewSection;
  // set view
  viewXPercentage?: number;
  viewYPercentage?: number;
  viewWidthPercentage?: number;
  viewHeightPercentage?: number;
  // this is calculated from the above or set directly (for the view)
  viewX?: number;
  viewY?: number;
  viewWidth?: number;
  viewHeight?: number;
};

export type ViewMap = {
  [path: string]: View;
};

export type ViewManagerProps = {
  viewer: Viewer;
};

export class ViewManager {
  viewer: Viewer;
  views: ViewMap = {};
  currentViewPath: string | null = null;
  currentViewSection: string | null = null;
  constructor({ viewer }: ViewManagerProps) {
    this.viewer = viewer;
  }

  getCurrentView() {
    if (this.currentViewPath) {
      return this.views[this.currentViewPath];
    }
  }

  getCurrentViewSection() {
    if (this.currentViewPath) {
      const view = this.views[this.currentViewPath];
      if (view) {
        return view.sections.find(
          section => section.anchor === this.currentViewSection
        );
      }
    }
  }

  getCurrentViewSectionFeatureStates() {
    const section = this.getCurrentViewSection();
    if (section && section.featureStates) {
      return Object.values(section.featureStates);
    }
  }

  getView(viewPath: string) {
    return this.views[viewPath];
  }

  getViewSection(viewPath: string, sectionAnchor: string) {
    const view = this.views[viewPath];
    if (view) {
      return view.sections.find(section => section.anchor === sectionAnchor);
    }
  }

  getViewSectionIndex(sectionAnchor: string) {
    if (this.currentViewPath) {
      const view = this.views[this.currentViewPath];
      if (view) {
        return view.sections.findIndex(
          section => section.anchor === sectionAnchor
        );
      }
    }
  }

  // call this from app when new view is rendered, since activateScroll needs the elements in dom
  async setView(viewPath: string) {
    this.currentViewPath = viewPath;
    const view = this.views[viewPath];
    if (!view || !view.sections[0]) {
      return;
    }
    // do some preparations
  }

  setViewSection(sectionAnchor: string) {
    const view = this.getCurrentView();
    if (!view) {
      return;
    }
    const sourceSection = this.getCurrentViewSection();
    const targetSection = view.sections.find(
      section => section.anchor === sectionAnchor
    );
    if (!targetSection) {
      return;
    }
    this.currentViewSection = sectionAnchor;
    this.viewer._update();
  }

  // call this from app when user clicks to go to next view
  // goToView(viewPath: string, viewSection?: string) {
  //   const zoomMultiplier = 1;
  //   const toView = this.views[viewPath];
  //   if (!toView) {
  //     console.warn(`View with path ${viewPath} not found`);
  //     return;
  //   }
  //   const toSection =
  //     toView.sections.find(section => section.anchor === viewSection) ||
  //     toView.sections[0];
  //   if (!toSection) {
  //     console.warn(`Section with anchor ${viewSection} not found`);
  //     return;
  //   }
  //   const toZoom = toView.level * zoomMultiplier;
  //   const fromView =
  //     this.getCurrentView() ||
  //     ({
  //       level: 0,
  //     } as View);
  //   const fromZoom = fromView.level * zoomMultiplier;
  //   const zoomIn = toZoom > fromZoom;
  //   const projectNode = this.viewport.getProjectNode();
  //   const targetFeatureState = toView.parentLayoutNode || projectNode;
  //   const target =
  //     toView.isPopup || fromView.isPopup
  //       ? [projectNode.x, projectNode.y, 0] // this is not [0, 0, 0]
  //       : [targetFeatureState.x, targetFeatureState.y, 0];
  //   const sourceFeatureState = fromView.parentLayoutNode || projectNode;
  //   const source =
  //     toView.isPopup || fromView.isPopup
  //       ? [projectNode.x, projectNode.y, 0]
  //       : [sourceFeatureState.x, sourceFeatureState.y, 0];
  //   // fix this later - first make section camera change work
  //   const rotationOrbit = toSection.rotationOrbit || 0;
  //   const rotationX =
  //     toSection.rotationX || toSection.rotationX === 0
  //       ? toSection.rotationX
  //       : 90;

  //   // disable node animations
  //   this.viewport.props.animateNodes = false;
  //   // disable controller is needed for the fly around effect
  //   this.viewport.props.disableController2 = false;
  //   if (!zoomIn) {
  //     // set zoom and target to the zoomed in version (because presentation view is in parent node view - full screen)
  //     Object.assign(this.viewport.props, {
  //       zoom: fromZoom,
  //       target: source,
  //     });
  //     // this is a hack to prevent the emit to update the view on the next cycle stopping the animation
  //     this.preventUpdate = true;
  //     // set back to the previous view before start animating
  //     this.viewport.emit('set-view', { view: toView }); // will call _update
  //   }
  //   // first to an update for disable controller and animation of nodes
  //   this.viewport._update();

  //   // then update for the camera fly animation
  //   this.viewport._update({
  //     flyTo: {
  //       target,
  //       zoom: toZoom,
  //       // always fly straight in
  //       rotationOrbit: 0,
  //       rotationX: 90,
  //       transitionDuration: toView.isPopup || fromView.isPopup ? 50 : 500,
  //       transitionInterruption: TRANSITION_EVENTS.IGNORE,
  //       transitionInterpolator: new ZoomToNodeInterpolator(!zoomIn),
  //       onTransitionEnd: () => {
  //         Object.assign(this.viewport.props, {
  //           // all presentation views are in default target (center NOT [0, 0, 0]!!!)
  //           // override target for views in setView
  //           target: [projectNode.x, projectNode.y, projectNode.z],
  //           // target: [0, 0, 0],
  //           // all presentation views are in zoom 0
  //           zoom: 0,
  //           rotationOrbit,
  //           rotationX,
  //           // rotationOrbit: 0,
  //           // rotationX: 90,
  //         });
  //         this.viewport.props.disableController2 = true;
  //         this.viewport.props.animateNodes = true;
  //         if (zoomIn) {
  //           // mostly used for testing
  //           if (toView.onLoad) {
  //             toView.onLoad();
  //           }
  //           // app needs to call the setView function since the elements need to be rendered first
  //           this.viewport.emit('set-view', { view: toView }); // will call _update
  //         } else {
  //           this.viewport._update();
  //           // set back the flag to enable update on emit set-view
  //           this.preventUpdate = false;
  //         }
  //       },
  //     },
  //   });
  // }
}
