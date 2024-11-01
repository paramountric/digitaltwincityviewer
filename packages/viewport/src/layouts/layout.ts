import {
  Deck,
  Layer,
  MapView,
  _GlobeView as GlobeView,
  MapViewState,
  OrbitView,
  OrbitViewState,
  OrbitViewport,
  OrthographicView,
  OrthographicViewState,
} from '@deck.gl/core';
import { clamp } from '@math.gl/core';
import {
  MVTLayerProps,
  TerrainLayerProps,
  Tile3DLayerProps,
} from '@deck.gl/geo-layers';
import {
  Feature,
  FeatureMap,
  FeatureProperties,
  getVersionUri,
} from '../feature';
import { Timeline } from '../lib/timeline';
import { PixelExtent } from '../types';
import { DEFAULT_PITCH } from '../constants';
import { DEFAULT_BEARING } from '../constants';
import { DEFAULT_MAP_ZOOM } from '../constants';

export type LayoutProps = {
  parentFeature: Feature;
};
export type BaseMap = 'mvt' | 'tile3d' | 'none';

export type GetViewProps = {
  disableController: boolean;
};

export type CameraFrame = {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  width: number;
  height: number;
  viewX: number;
  viewY: number;
};

export abstract class Layout {
  id: string;
  featureMap: FeatureMap;
  baseMap: BaseMap = 'none';
  cameraFrame: CameraFrame;
  cameraAnimation: any;
  animationCursor: number | null;
  featureAnimations: any;
  updateTriggers: any;
  parentFeature: Feature;
  constructor({ parentFeature }: LayoutProps) {
    console.log('init layout');
    this.featureMap = new Map();
    this.parentFeature = parentFeature;
    this.id = parentFeature.key;

    if (
      parentFeature.properties._longitude &&
      parentFeature.properties._latitude
    ) {
      this.cameraFrame = {
        viewX: 0,
        viewY: 0,
        longitude: parentFeature.properties._longitude,
        latitude: parentFeature.properties._latitude,
        zoom: parentFeature.properties._zoom || DEFAULT_MAP_ZOOM,
        bearing: parentFeature.properties._bearing || DEFAULT_BEARING,
        pitch: parentFeature.properties._pitch || DEFAULT_PITCH,
        width: parentFeature.properties._width,
        height: parentFeature.properties._height,
      };
    }
  }

  applyFeatures(featureList: Feature[]) {
    // this merges the features by versionUri
    this.featureMap = new Map(featureList.map(f => [f.versionUri, f]));
    // this.featureMap = mergeFeatureList(
    //   featureList,
    //   this.featureMap,
    //   true
    // ) as FeatureMap;

    for (const n of featureList) {
      if (n.deletedAt) {
        this.featureMap.delete(n.versionUri);
      }
    }
  }

  // just in case we need to have several views with same versionUri
  getViewId() {
    return this.id;
  }

  // this matches from the above if using same layout, override to put in the parent view (for example boardLayout.id)
  getLayerId(layerKey: string, viewId?: string) {
    const viewIdToUse = viewId || this.id;
    return `${viewIdToUse}-${layerKey}`;
  }

  abstract getLayers(): Layer[];

  abstract getView(
    props: GetViewProps
  ): MapView | GlobeView | OrbitView | OrthographicView | undefined;

  applyUpdateTriggers(updateTriggers: any = {}) {
    for (const triggerKey of Object.keys(updateTriggers)) {
      if (updateTriggers[triggerKey]) {
        this.updateTriggers[triggerKey] = Date.now();
      }
    }
  }

  getZoomToExtent(extent: PixelExtent) {
    const { width, height } = this.cameraFrame;
    const [minX, minY, maxX, maxY] = extent;
    const xSize = maxX - minX;
    const ySize = maxY - minY;
    const xZoom = width / xSize;
    const yZoom = height / ySize;
    return Math.min(xZoom, yZoom);
  }

  hasView(): boolean {
    return Boolean(this.cameraFrame);
  }

  isTilted() {
    return false;
  }

  // get state of either user interaction or animation
  // use this to get frame data for setCameraFrame, then use getViewState
  getCameraFrame() {
    if (this.cameraAnimation && this.animationInProgress()) {
      return this.cameraAnimation.getFrame();
    } else {
      // only a part of the cameraFrame is the viewState
      return this.getViewState(); // this.cameraAnimation.getFrameAt(0);
    }
  }

  getCameraFrames() {
    // get all frames except for the last one
    return this.cameraAnimation?.keyframes.slice(0, -1) || [];
  }

  // set cameraFrame from either user interaction or animation
  // use getCameraFrame to set from animation, otherwise this is called from viewport user interaction
  setCameraFrame(cameraFrame: any) {
    this.cameraFrame = {
      ...this.cameraFrame,
      ...cameraFrame,
    };
  }

  getActiveFrame() {
    if (!this.animationInProgress()) {
      return null;
    }
    const animationCursor = this.animationCursor;
    const cameraFramesReversed = [...this.getCameraFrames()].reverse();
    const activeFrame = cameraFramesReversed.find(
      f => f.timing <= animationCursor
    );
    return activeFrame;
  }

  getViewState(): any {
    const frame = {
      ...this.cameraFrame,
    };
    return frame;
  }

  setAnimationCursor(time: number | null) {
    this.animationCursor = time;
    // animations must have been created first (this.createAnimations)
    if (this.animationInProgress()) {
      // only the board layout should have the camera animations
      if (this.cameraAnimation) {
        this.cameraAnimation.setTime(time);
        this.setCameraFrame(this.cameraAnimation.getFrame());
      }
      for (const [, animation] of this.featureAnimations) {
        animation.setTime(time);
      }
    }
  }

  animationInProgress() {
    return this.cameraAnimation && this.animationCursor !== null;
  }

  getBackgroundColor() {
    // return undefined if not exist to continue looking for background color in other settings
    if (this.animationInProgress()) {
      const activeFrame = this.cameraAnimation.getFrame();
      return activeFrame?.fillColor || this.getViewState()?.backgroundColor;
    }
    return this.getViewState()?.backgroundColor;
  }

  getZoom() {
    return this.getViewState()?.zoom || 0;
  }

  getFeatureFrame(feature: Feature): any | undefined {
    // no timing - return regular feature
    if (!this.animationInProgress()) {
      const versionUri = getVersionUri(feature);
      return this.getFeatureFrameByVersionUri(versionUri);
    }
    // timing - return animation frame
    const animation = this.featureAnimations.get(feature.key);
    if (animation) {
      const frame = animation.getFrame();
      const reversedTimings = [...(animation.timings as [])].reverse();
      frame.timing = reversedTimings.find(t => t <= this.animationCursor) || 0;
      return frame;
    }
  }

  // for edit mode
  getFeatureFrameByVersionUri(versionUri: string): Feature | undefined {
    const feature = this.featureMap.get(versionUri);
    if (feature) {
      return feature;
    } else {
      // const frameFeature = this.frames.find(n => n.versionUri === versionUri);
      // if (frameFeature) {
      //   return frameFeatureFeature.appearance;
      // }
    }
    return undefined;
  }

  getTransitions() {
    return undefined;
  }

  createCameraAnimation(frameFeatures: Feature[]) {
    // const animation = createCameraAnimation(frameFeatures);
    // console.log('createCameraAnimation', animation);
    // this.cameraAnimation = animation;
  }

  getCameraAnimationDuration() {
    const timings = this.cameraAnimation?.timings || [0];
    return timings[timings.length - 1];
  }

  createFeatureAnimations(featureLayouts: Layout[]) {
    const cameraFrames = this.cameraAnimation?.keyframes || [];
    // const featureAnimations = createFeatureAnimations(
    //   cameraFrames,
    //   this.featureMap,
    //   // so that featureViews can run by featureUri (several views can have the same featureUri)
    //   featureLayouts
    // );
    // const { animations, featureMap } = featureAnimations;
    // this.featureAnimations = animations;
  }

  createAnimations(frameFeatures: Feature[], featureLayouts: Layout[]) {
    this.createCameraAnimation(frameFeatures);
    this.createFeatureAnimations(featureLayouts);
  }

  getFrameTiming(versionUri: string): number | null {
    if (!this.cameraAnimation) {
      return null;
    }
    const frameIndex = this.cameraAnimation.keyframes.findIndex(
      k => k.versionUri === versionUri
    );
    if (frameIndex === -1) {
      return null;
    }
    return this.cameraAnimation.timings[frameIndex];
  }

  getCameraFrameByVersionUri(versionUri: string) {
    if (!this.cameraAnimation) {
      return null;
    }
    const frame = this.cameraAnimation.keyframes.find(
      k => k.versionUri === versionUri
    );
    return frame;
  }

  getVisibleFeatures(atTiming?: number): Feature[] {
    // override this function in specific layouts to get other kind of features
    // this is general
    const visibleFeatures = [...this.featureMap.values()].filter(
      f => !f.properties?._hide
    );
    return visibleFeatures;
  }
}
