// Copyright (C) 2022 Paramountric

import {
  Deck,
  DeckProps,
  COORDINATE_SYSTEM,
  OrthographicView,
  LinearInterpolator,
  OrbitView,
  Layer,
  View,
  OrtographicViewState,
  OrbitViewState,
} from '@deck.gl/core';
// import { ScatterplotLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import {
  JSONConverter,
  JSONConfiguration,
  _shallowEqualObjects,
} from '@deck.gl/json';
import {
  Graph,
  Node,
  Edge,
  TimelineLayout,
  TimeProcessLayout,
  ForceLayout,
  TreeLayout,
  LayoutEngine,
  LAYOUT_STATE,
} from '@paramountric/entity';
import { mat4, quat, vec3, vec2 } from 'gl-matrix';
// import { Exploration } from './Exploration.js';
import JSON_CONVERTER_CONFIGURATION from './configuration.js';
import GraphLayer from './layers/graphgl-layers/graph-layer.js';
import TimelineLayer from './layers/timeline-layer/timeline-layer.js';
import ZoomToNodeInterpolator from './ZoomToNodeInterpolator.js';

// https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
function deferred(ms) {
  let cancel;
  const promise = new Promise((resolve, reject) => {
    cancel = reject;
    setTimeout(resolve, ms);
  });
  return { promise, cancel };
}
function debounce(task, ms) {
  let t = { promise: null, cancel: _ => void 0 };
  return async (...args) => {
    try {
      t.cancel(null);
      t = deferred(ms);
      await t.promise;
      await task(...args);
    } catch (_) {
      /* prevent memory leak */
    }
  };
}

const MAX_ZOOM = 10;
const MIN_ZOOM = 0;
const DEFAULT_ZOOM = 1;
const EXPLORE_ZOOM = 2;
const VIEWER_ZOOM = 6;
const TIMELINE_HEIGHT = 100;

//
type ViewerProps = {
  width?: number | string;
  height?: number | string;
  zoom?: number;
  canvas?: HTMLElement | string;
  bearing?: number;
  pitch?: number;
  target?: [number, number];
  onWebGLInitialized?: () => void;
  onLoad?: () => void;
  json?: any;
  onNodeClick?: (info: any) => any;
  onNodeMouseLeave?: () => any;
  onNodeHover?: () => any;
  onNodeMouseEnter?: () => any;
  onEdgeClick?: () => any;
  onEdgeHover?: () => any;
  showTimelineX?: boolean;
  showValidation?: boolean;
  importNodes?: Node[] | null; // null for reset
};

function generateLayerIdFromNodeId(nodeId: string) {
  return `${nodeId}-mesh-layer`;
}

function getTimelineModelMatrix() {
  const position = [-500, -50, -50];
  const rotation = [0, 0, 0];
  const scale = [1000, 100, 100];
  const origin = [0, 0, 0];

  const rotQuat = quat.fromEuler(
    quat.create(),
    rotation[0],
    rotation[1],
    rotation[2]
  );
  const modelMatrix = mat4.fromRotationTranslationScaleOrigin(
    mat4.create(),
    rotQuat,
    position as vec3,
    scale as vec3,
    origin as vec3
  );
  return modelMatrix;
}

// can be overridden
const defaultProps = {};

function isFunctionObject(value) {
  return typeof value === 'object' && '@@function' in value;
}

function addUpdateTriggersForAccessors(json) {
  if (!json || !json.layers) return;

  for (const layer of json.layers) {
    const updateTriggers = {};
    for (const [key, value] of Object.entries(layer)) {
      if (
        (key.startsWith('get') && typeof value === 'string') ||
        isFunctionObject(value)
      ) {
        // it's an accessor and it's a string
        // we add the value of the accesor to update trigger to refresh when it changes
        updateTriggers[key] = value;
      }
    }
    if (Object.keys(updateTriggers).length) {
      layer.updateTriggers = updateTriggers;
    }
  }
}

class Viewer {
  public deck: Deck;
  private socket: WebSocket | undefined;
  private props: DeckProps;
  private jsonConverter: JSONConverter;
  private websocketUrl: string | undefined;
  private mainLayoutEngine: LayoutEngine;
  private timelineLayoutEngine: LayoutEngine;
  private mainLayout: TimeProcessLayout | ForceLayout | TreeLayout;
  private timelineLayout: TimelineLayout;
  private graph: Graph;
  private timelineGraph: Graph;
  private mainViewState: OrtographicViewState;
  private timelineViewState: OrtographicViewState;
  private viewer3dViewState: OrbitViewState;
  //private timelineZoom: number; // zoom will separate nodes in both timeline and main view
  onEdgeClick: () => any | undefined;
  onEdgeHover: () => any | undefined;
  // private activeExplorationId: string;
  // private activeExploration: Exploration;
  private zoomToPosition: number[] | null;
  private zoomToZoom: number[] | null;
  // todo: use activeNodeId and other flags to decide on viewer
  private activeViewerNodeId: string;
  private activeExploreNodeId: string;
  private activeViewerNodeX: number;
  private activeViewerNodeY: number;
  private activeViewerModelMatrix: mat4;
  constructor(props: ViewerProps, websocketUrl?: string) {
    this.mainLayoutEngine = new LayoutEngine();
    this.timelineLayoutEngine = new LayoutEngine();
    this.mainLayout = new ForceLayout();
    this.timelineLayout = new TimelineLayout({});
    //this.timelineZoom = 0; // zoom in time
    this.graph = new Graph();
    this.timelineGraph = new Graph();
    this.websocketUrl = websocketUrl;
    const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIGURATION);
    this.jsonConverter = new JSONConverter({ configuration });
    const internalProps = {
      onWebGLInitializedCallback: props.onWebGLInitialized || null,
      onWebGLInitialized: this.onWebGLInitialized.bind(this),
      getCursor: this.getCursor.bind(this),
      getTooltip: this.getTooltip.bind(this),
    };
    // move to separate method? or always boot the viewer with json?
    if (props.json) {
      addUpdateTriggersForAccessors(props.json);
      const jsonProps = this.jsonConverter.convert(props.json);
      Object.assign(props, jsonProps);
    }
    this.mainViewState = {
      zoom: [props.zoom || 0, props.zoom || 0],
      target: [0, 0, 0],
      longitude: 0,
      latitude: 0,
      rotationX: 0,
      rotationOrbit: 0,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    };

    this.timelineViewState = {
      // only x axis
      zoom: [props.zoom || 0, 0],
      target: [0, 0, 0],
      longitude: 0,
      latitude: 0,
      rotationX: 0,
      rotationOrbit: 0,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
    };

    this.viewer3dViewState = {
      zoom: -7,
      target: [0, 0, 0],
      rotationX: 45,
      rotationOrbit: 45,
      longitude: 0,
      latitude: 0,
    };
    const resolvedProps = Object.assign({}, defaultProps, props, internalProps);
    this.props = resolvedProps;
    console.log(resolvedProps);

    this.deck = new Deck(resolvedProps);

    this.zoomToPosition = null;
    this.zoomToZoom = null;
    this.activeViewerNodeId = '';
    this.activeExploreNodeId = '';
    this.activeViewerModelMatrix = mat4.create();

    // setTimeout(() => {
    //   try {
    //     this.updateLayoutEngines();
    //   } catch (err) {
    //     setTimeout(() => {
    //       try {
    //         this.updateLayoutEngines();
    //       } catch (err) {
    //         console.log('todo: how to wait for viewManager???');
    //       }
    //     }, 200);
    //   }
    // }, 200);
  }
  async onWebGLInitialized(gl) {
    console.log('webgl initialized');
    if (this.props.onWebGLInitializedCallback) {
      this.props.onWebGLInitializedCallback(gl);
    }
    if (this.websocketUrl) {
      await this.connectToWebsocket(this.websocketUrl);
      // load current exploration (or create one automatically)
    }
  }
  // ! principles: the main view must be feeded with the zoom of the timeline to know the horizontal separation of objects
  // ! the main views own zoom is used to scale the objects. Cluster function?
  // todo: x must move relative to zoom, since main is not at depth -> it's at detail level

  // todo: refactor -> only change viewState here, the new views and layers should be triggered by async event (loader)
  onViewStateChange({ viewState, viewId, interactionState, oldViewState }) {
    if (!this.deck) {
      return;
    }

    // do not change viewState if viewer is active
    // if (viewId !== 'viewer' && this.activeViewerNodeId) {
    //   return;
    // }
    // get existing state
    // const viewports = this.deck.viewManager.getViewports();
    // const viewStates = viewports.reduce((memo, viewport) => {
    //   memo[viewport.id] = this.deck.viewManager.getViewState(viewport.id);
    //   return memo;
    // }, {});

    // if (!viewStates.main) {
    //   console.log(oldViewState);
    //   viewStates.main = oldViewState;
    // }

    if (viewId === 'nodeViewer') {
      console.log('set viewstate to node viewer', viewState);
      this.viewer3dViewState = viewState;
    } else if (viewId === 'main') {
      // if (this.activeViewerNodeId) {
      //   return;
      // }
      this.mainViewState = viewState;
      this.timelineViewState.target[0] = viewState.target[0];
      this.timelineViewState.zoom[0] = viewState.zoom[0];
      // need to update the extent and zoom on the main viewport for loading more data / unloading old data
      // ! note: use tile loader instead on zoom + extent and feed new loaded nodes into layout
      // const { minX, minY, maxX, maxY } = this.calculateCartesianExtent();
      // this.layoutEngine.setExtent(minX, minY, maxX, maxY);
      // this.layoutEngine.setZoom(viewState.zoom);
      // todo: get nodes within extent, trigger a load for more contains/composes depending on zoom (also unload not visible node contains/composes)
      // ! note: this should not be done in layout engine since that one only cares about the existing nodes and how to position them on the current canvase
      // ! instead trigger a reload as the user zooms and pans according to tile loader
      this.updateLayoutEngines();
      // todo: first fix the viewer statically
      // if (this.activeViewerNodeId) {
      //   // const zoomDiff = oldViewState.zoom - viewState.zoom;
      //   // this.viewer3dViewState.zoom += zoomDiff;
      //   const viewerView = this.getViewerView();
      //   const existingViews = this.deck.viewManager.getViews();
      //   //const existingLayers = this.deck.props.layers;
      //   this.deck.setProps({
      //     viewState: {
      //       main: this.mainViewState,
      //       timeline: this.timelineViewState,
      //       viewer3d: this.viewer3dViewState,
      //     },
      //     views: [...Object.values(existingViews), viewerView],
      //     // layers: existingLayers,
      //   });
      //   return;
      // }
    } else if (viewId === 'timeline') {
      // timeline zoom will not change on zoom -> but the zoom will be saved for the layout to change the time resolution
      // ! main and timeline zoom is in sync -> but time resolution is separate
      this.timelineViewState = viewState;
      this.timelineViewState.target[1] = 0; //oldViewState.target[1];
      // this.timelineViewState.zoom[0] = oldViewState.zoom[0];
      // this.timelineZoom = Math.max(
      //   MIN_TIMELINE_ZOOM,
      //   Math.min(MAX_TIMELINE_ZOOM, (this.timelineZoom || 0) + zoomDiff)
      // );
      this.mainViewState.target[0] = viewState.target[0];
      this.mainViewState.zoom[0] = viewState.zoom[0];

      this.updateLayoutEngines();
      // ! note: timeline can calculate layout instantly since it only needs the zoom level and the center target
    }

    this.render();
  }

  onInteractionStateChange(extra) {
    if (!extra.isDragging) {
      //console.log('now it is time to update the queried data');
    }
  }

  layerFilter({ layer, viewport }) {
    if (viewport.id === 'main') {
      if (layer.id === 'graph-layer') {
        return true;
      } else {
        return false;
      }
    } else if (viewport.id === 'timeline') {
      if (layer.id === 'timeline-layer') {
        return true;
      } else {
        return false;
      }
    } else if (viewport.id === 'nodeViewer') {
      if (
        this.activeViewerNodeId &&
        layer.id.startsWith(this.activeViewerNodeId)
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  setJson(json) {
    const jsonProps = this.jsonConverter.convert(json);
    this.deck.setProps(jsonProps);
  }

  // ! important
  // ! layouts and the engine only works on LayoutNode (concerned with x, y) that has the same id as Node
  // ! for updating the values on node (affecting text) the layers must be re-rendered (but layout should not run again)
  // ! if position of node is affected in any way, the layout must normally be run again completely using engine.run()

  // this function is called from outside when completely new nodes should be added or the layout should change
  // don't use for updating node values or adding/removing smaller set of nodes -> but what to use then since layout.updateGraph needs to be called?
  // todo: should graph and layout be put on this.props?
  updateGraph(
    graph: Graph,
    layout: ForceLayout | TreeLayout | TimeProcessLayout,
    forceUpdate?: boolean
  ) {
    console.log('UPDATE');
    const graphChanged = !graph.equals(this.graph);
    if (graphChanged || forceUpdate) {
      this.graph = graph;
    }

    const layoutChanged = !layout.equals(this.mainLayout);
    const previousLayout = this.mainLayout;
    if (layoutChanged || forceUpdate) {
      this.mainLayout = layout;
    }

    const layoutEngineIsProcessing =
      this.mainLayoutEngine.layoutState === LAYOUT_STATE.START ||
      this.mainLayoutEngine.layoutState === LAYOUT_STATE.CALCULATING;
    if (!graphChanged && !layoutChanged && layoutEngineIsProcessing) {
      return;
    }

    // if graph or layout is changed, re-run the layout calculation
    if (graphChanged || layoutChanged || forceUpdate) {
      this.mainLayoutEngine.clear();
      if (layout instanceof ForceLayout) {
        const nodePositionMap = previousLayout.getLayoutPositions();
        console.log('use these positions');
        console.log(nodePositionMap);
        const nodes = Object.values(graph.nodeMap);

        for (const node of nodes) {
          if (
            node.getPropertyValue('isBaseBucket') &&
            nodePositionMap[node.id]
          ) {
            node.locked = true;
            node.x = nodePositionMap[node.id][0];
            node.y = nodePositionMap[node.id][1];
          } else {
            node.locked = false;
            node.x = 0;
            node.y = 0;
          }
        }
        console.log(nodes);
      }
      this.updateLayoutEngines();
      this.runLayoutEngines();
    }
  }

  // todo: add TimeSliderLayout and enable switching between them
  updateLayoutEngines() {
    debounce(() => {
      const { minX, minY, maxX, maxY } = this.calculateCartesianExtent();
      this.mainLayoutEngine.setExtent(minX, minY, maxX, maxY);
      this.mainLayoutEngine.setZoom(this.mainViewState.zoom[0]);
      this.timelineLayoutEngine.setExtent(minX, -1, maxX, 1);
      this.timelineLayoutEngine.setZoom(this.mainViewState.zoom[0]);
    }, 200);
  }

  runLayoutEngines() {
    this.mainLayoutEngine.run(this.graph, this.mainLayout);
    if (this.props.showTimelineX) {
      this.timelineLayoutEngine.run(this.timelineGraph, this.timelineLayout);
    }
  }

  // since props can only be set from outside to this.props this function should not be called internally - use render function
  setProps(props: ViewerProps = {}) {
    if (props.zoom) {
      this.mainViewState.zoom = [props.zoom, props.zoom];
    }
    if (props.showTimelineX || props.showTimelineX === false) {
      this.props.showTimelineX = props.showTimelineX;
    }
    if (props.showValidation || props.showValidation === false) {
      this.props.showValidation = props.showValidation;
    }
    if (props.importNodes || props.importNodes === null) {
      this.props.importNodes = props.importNodes;
    }

    this.render();
  }

  // ! API function helper to set transition state
  // this function does not change props only the view and state of node
  zoomToNodeViewer(node: Node) {
    this.activeViewerNodeId = node.getId();
    const position = this.mainLayoutEngine.getNodePosition(node);
    this.activeViewerNodeX = position[0];
    this.activeViewerNodeY = position[1];
    this.zoomToPosition = position;
    this.zoomToZoom = [VIEWER_ZOOM, VIEWER_ZOOM];
    this.render();
  }

  zoomToExploreNode(node: Node) {
    this.activeExploreNodeId = node.getId();
    const position = this.mainLayoutEngine.getNodePosition(node);
    // maybe these can be reused for explore - rename?
    this.activeViewerNodeX = position[0];
    this.activeViewerNodeY = position[1];
    this.zoomToPosition = position;
    this.zoomToZoom = [EXPLORE_ZOOM, EXPLORE_ZOOM];
    this.render();
  }

  zoomOut(zoom?: number) {
    console.log('zoom out not working?');
    this.activeViewerNodeId = null;
    this.activeViewerNodeX = null;
    this.activeViewerNodeY = null;
    this.zoomToZoom = [zoom || DEFAULT_ZOOM, zoom || DEFAULT_ZOOM];
    this.render();
  }

  public getNodePosition(node: Node): number[] {
    return this.mainLayoutEngine.getNodePosition(node);
  }

  // return a view for the active node
  // DO NOT return null or undefined since it will go into views array
  getViewerView(): OrthographicView | OrbitView {
    const { x, y, width, height } = this.calculateViewerPosition();
    // todo: this should be different depending on view type (viewer3d, list, sankey, etc)
    return new OrbitView({
      id: 'nodeViewer', // because a node will always only be shown ONE at a time (but consider have several node viewer connected to each other in infographic viewer)
      orthographic: true,
      controller: true,
      x,
      y,
      width,
      height,
      clear: true,
    });
  }

  getCursor({ isDragging, isHovering }) {
    return isHovering ? 'pointer' : 'grab';
  }

  getTooltip({ object, layer, x, y, sourceLayer, coordinate }) {
    if (!object) {
      return null;
    }
    return null;
    // return {
    //   className: 'z-50 rounded-md absolute bg-slate-500',
    //   html: `
    //     <div>
    //       ${object.getPropertyValue('name')}
    //     </div>
    //   `,
    // };
  }

  // call this internally after changing viewer state
  render() {
    if (!this.deck) {
      return;
    }

    const zoom = this.mainViewState[0] || DEFAULT_ZOOM;

    this.deck.setProps({
      parameters: {
        clearColor: [250, 250, 250, 1],
      },
      // retina displays will double resolution
      useDevicePixels: true,
      views: [
        new OrthographicView({
          id: 'main',
          controller: true,
          x: 0,
          y: 0,
          width: this.props.width,
          height:
            window.innerHeight -
            (this.props.showTimelineX ? TIMELINE_HEIGHT : 0),
          flipY: true,
        }),
        this.props.showTimelineX &&
          new OrthographicView({
            id: 'timeline',
            controller: {
              zoomAxis: 'X',
            },
            x: 0,
            y: window.innerHeight - TIMELINE_HEIGHT,
            width: window.innerWidth,
            height: TIMELINE_HEIGHT,
            flipY: true,
          }),
        //this.activeViewerNodeId && this.getViewerView(),
      ],
      viewState: {
        main: Object.assign(
          {},
          this.mainViewState,
          {
            zoom: [
              this.mainViewState.zoom[0] || 0,
              this.mainViewState.zoom[1] || 0,
            ],
          },
          this.zoomToPosition
            ? {
                target: this.zoomToPosition,
                zoom: this.zoomToZoom,
                transitionDuration: 500,
                transitionInterpolator: new ZoomToNodeInterpolator(),
                transitionEasing: (t: any) => {
                  return t;
                },
                onTransitionEnd: () => {
                  console.log('transition ended');
                  this.zoomToPosition = null;
                },
                onTransitionStart: () => {
                  console.log('transition started');
                  this.zoomToPosition = null;
                },
                onTransitionInterrupt: () => {
                  console.log('transition interrupt');
                  this.zoomToPosition = null;
                },
              }
            : {}
        ),
        timeline: Object.assign(this.timelineViewState, {
          zoom: [this.timelineViewState.zoom[0] || 0, 0],
        }),
        // specific for each node viewer and should be maintained to allow user to switch between viewers and retain the viewState
        // todo: create a generic nodeViewer way, like prefix-viewType-nodeId
        // ! needs the same name as View!
        nodeViewer: this.viewer3dViewState,
      },
      onViewStateChange: this.onViewStateChange.bind(this),
      onInteractionStateChange: this.onInteractionStateChange.bind(this),
      layerFilter: this.layerFilter.bind(this),
      layers: [
        new GraphLayer({
          id: 'graph-layer',
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          engine: this.mainLayoutEngine,
          nodeStyle: [
            // {
            //   type: 'RECTANGLE',
            //   width: 10,
            //   height: 10,
            //   fill: 'rgb(230, 230,230)',
            //   stroke: 'rgb(210, 210, 210)',
            //   strokeWidth: 1,
            //   ':hover': {
            //     fill: 'rgb(210, 210, 210)',
            //     stroke: 'rgb(190, 190, 190)',
            //   },
            //   ':empty': {
            //     fill: 'rgb(255, 255, 255)',
            //     stroke: 'rgb(230, 230, 230)',
            //   },
            //   ':selected': {
            //     fill: 'rgb(170, 170, 170)',
            //     stroke: 'rgb(190, 190, 190)',
            //   },
            //   minZoom: 4,
            // },
            {
              type: 'CIRCLE',
              radius: 5,
              radiusMinPixels: 1,
              radiusMaxPixels: 100,
              fill: 'rgb(230, 230, 230)',
              stroke: this.props.showValidation
                ? (n: Node) => {
                    const validState = n.getValidState();
                    switch (validState) {
                      case 'valid':
                        return 'rgb(0, 190, 0)';
                      case 'not-valid':
                        return 'rgb(190, 0, 0)';
                      case 'no-schema':
                        return 'rgb(0, 190, 190)';
                      default:
                        return 'rgb(190, 190, 190)';
                    }
                  }
                : 'rgb(190, 190, 190)',
              strokeWidth: 1, // this is hard coded in circle-layer for now
              ':hover': {
                fill: 'rgb(210, 210, 210)',
                stroke: 'rgb(190, 190, 190)',
              },
              ':selected': {
                fill: 'rgb(170, 170, 170)',
                stroke: 'rgb(50, 50, 50)',
              },
              ':empty': {
                fill: 'rgb(255, 255, 255)',
                stroke: 'rgb(230, 230, 230)',
              },
              //maxZoom: 4,
            },
            // {
            //   type: 'MARKER',
            //   marker: 'plus',
            //   fill: 'gray',
            //   size: 1,
            //   scaleWithZoom: true,
            //   filterKeys: ['isEmpty'],
            //   minZoom: 9,
            // },
            {
              type: 'LABEL',
              text: node => node.getPropertyValue('name'),
              color: 'rgb(0,0,0)',
              fontSize: 12,
              offset: zoom <= 4 ? [0, 8] : undefined,
              pixelOffset: zoom > 4 ? [0, 30] : undefined,
              minZoom: 2,
              maxZoom: 5,
              sizeMaxPixels: 14,
              scaleWithZoom: true,
            },
          ],
          nodeEvents: {
            onClick: this.onNodeClick.bind(this),
            // onMouseLeave: this.onNodeMouseLeave.bind(this),
            // onHover: this.onNodeHover.bind(this),
            // onMouseEnter: this.onNodeMouseEnter.bind(this),
          },
          edgeStyle: {
            stroke: '#101010',
            // ! problem with thickness could be caused by shader not manage project to pixel property
            strokeWidth: 1,
            //widthScale: 1 / 2 ** this.mainViewState.zoom[0],
            widthMinPixels: 1,
            widthMaxPixels: 10,
            decorators: [
              {
                type: 'EDGE_LABEL',
                text: edge => edge.getPropertyValue('name'),
                color: '#101010',
                fontSize: 12, //this.props.edgeLabelSize,
              },
              // {
              //   type: 'FLOW',
              //   color: '#00f',
              //   speed: 1,
              //   tailLength: 15,
              //   width: 5,
              // },
            ],
          },
          edgeEvents: {
            onClick: this.onEdgeClick,
            onHover: this.onEdgeHover,
          },
          enableDragging: false,
        }),
        new TimelineLayer({
          id: 'timeline-layer',
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          engine: this.timelineLayoutEngine,
          nodeStyle: [
            // {
            //   type: 'RECTANGLE',
            //   width: 200,
            //   height: 40,
            //   //radius: 17,
            //   fill: 'rgb(200, 200,200)',
            // },
            // {
            //   type: 'CIRCLE',
            //   radius: 15,
            //   fill: 'rgb(230, 230,230)',
            // },
            // {
            //   type: 'MARKER',
            //   marker: 'circle',
            //   fill: 'gray',
            //   size: 20,
            // },
            {
              type: 'LABEL',
              text: node => node.getPropertyValue('name'),
              scaleWithZoom: false,
              color: 'rgb(0,0,0)',
              offset: [0, 8],
            },
          ],
          nodeEvents: {
            onClick: this.onNodeClick,
            // ? should first use interaction manager
            // onMouseLeave: this.onNodeMouseLeave,
            // onHover: this.onNodeHover,
            // onMouseEnter: this.onNodeMouseEnter,
          },
          edgeStyle: {
            stroke: '#101010',
            strokeWidth: 2,
            decorators: [
              // {
              //   type: 'EDGE_LABEL',
              //   text: edge => edge.getPropertyValue('name'),
              //   color: '#101010',
              //   fontSize: this.props.edgeLabelSize,
              // },
              // {
              //   type: 'FLOW',
              //   color: '#00f',
              //   speed: 1,
              //   tailLength: 15,
              //   width: 5,
              // },
            ],
          },
          // edgeEvents: {
          //   onClick: this.onEdgeClick,
          //   onHover: this.onEdgeHover,
          // },
          enableDragging: false,
        }),
        // this.activeViewerNodeId &&
        //   new SimpleMeshLayer({
        //     id: generateLayerIdFromNodeId(this.activeViewerNodeId),
        //     data: this.props.importNodes || [],
        //     modelMatrix: this.activeViewerModelMatrix || mat4.create(),
        //     coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        //     wireframe: false,
        //     getColor: node => node.data?.color || [255, 0, 0, 200],
        //     mesh: new BoxGeometry(),
        //     parameters: {
        //       depthTest: true,
        //     },
        //     getTransformMatrix: node => {
        //       return node?.modelMatrix ? node.modelMatrix : mat4.create();
        //     },
        //   }),
      ],
    });
  }

  // ! before using hover, check if interaction manager is appropriate

  // onNodeHover(e) {
  //   console.log(e.object);
  //   if (e.object && e.object.state !== 'selected') {
  //     e.object.setState('hover');
  //     console.log(e.object.state);
  //   }
  //   console.log(e.object.state);
  // }

  // onNodeMouseEnter(e) {
  //   if (e.object && e.object.state !== 'selected') {
  //     e.object.setState('hover');
  //   }
  // }

  // onNodeMouseLeave(e) {
  //   if (e.object && e.object.state !== 'selected') {
  //     e.object.setState('default');
  //   }
  // }

  onNodeClick(e) {
    if (this.props.onNodeClick) {
      this.props.onNodeClick(e);
    }
  }

  calculateViewerPosition() {
    const nodeX = this.activeViewerNodeX || 0;
    const nodeY = this.activeViewerNodeY || 0;
    const padding = 0.009;
    return this.calculatePixelExtent(
      nodeX - padding,
      nodeY - padding,
      padding + padding,
      padding + padding
    );
  }

  // from cartesian to screen pixels
  calculatePixelExtent(x: number, y: number, width: number, height: number) {
    const viewport = this.deck.viewManager.getViewport('main');
    const { pixelProjectionMatrix } = viewport;
    const p1Pixels = [x, y];
    const p2Pixels = [x + width, y + height];
    const p1Trans = vec2.transformMat4(
      vec2.create(),
      p1Pixels as vec2,
      pixelProjectionMatrix
    );
    const p2Trans = vec2.transformMat4(
      vec2.create(),
      p2Pixels as vec2,
      pixelProjectionMatrix
    );
    const extentSize = vec2.sub(vec2.create(), p2Trans, p1Trans);
    return {
      x: p1Trans[0],
      y: p1Trans[1],
      width: extentSize[0],
      height: extentSize[1],
    };
  }

  // from screen pixels to cartesian
  calculateCartesianExtent(
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ) {
    const viewport = this.deck.viewManager.getViewport('main');
    const {
      pixelUnprojectionMatrix,
      x: defaultX,
      y: defaultY,
      width: defaultW,
      height: defaultH,
    } = viewport;
    const p1Pixels = [x || defaultX, y || defaultY];
    const p2Pixels = [
      p1Pixels[0] + (width || defaultW),
      p1Pixels[1] + (height || defaultH),
    ];
    const p1Trans = vec2.transformMat4(
      vec2.create(),
      p1Pixels as vec2,
      pixelUnprojectionMatrix
    );
    const p2Trans = vec2.transformMat4(
      vec2.create(),
      p2Pixels as vec2,
      pixelUnprojectionMatrix
    );
    return {
      minX: p1Trans[0],
      minY: p1Trans[1],
      maxX: p2Trans[0],
      maxY: p2Trans[1],
    };
  }

  // ! API helper function to center the nodes in viewer
  setImportNodes(importNodes: Node[]) {
    const nodeBounds = this.getNodeBounds(importNodes);
    const modelMatrix = this.getOffsetModelMatrix(nodeBounds);
    this.activeViewerModelMatrix = modelMatrix;
    console.log('import Nodes', importNodes, modelMatrix);
    this.setProps({
      importNodes,
    });
  }

  getNodeBounds(nodes: Node[]): number[] {
    const bounds = [
      Infinity,
      Infinity,
      Infinity,
      -Infinity,
      -Infinity,
      -Infinity,
    ];
    for (const node of nodes) {
      if (node.bounds) {
        const s = node.bounds;
        if (s[0] < bounds[0]) {
          bounds[0] = s[0];
        }
        if (s[1] < bounds[1]) {
          bounds[1] = s[1];
        }
        if (s[2] < bounds[2]) {
          bounds[2] = s[2];
        }
        if (s[3] > bounds[3]) {
          bounds[3] = s[3];
        }
        if (s[4] > bounds[4]) {
          bounds[4] = s[4];
        }
        if (s[5] > bounds[5]) {
          bounds[5] = s[5];
        }
      }
    }
    return bounds;
  }

  // todo: move this code, also it's already duplicated
  getModelMatrix(
    rotation = [0, 0, 0],
    position = [0, 0, 0],
    scale = [1, 1, 1],
    origin = [0, 0, 0],
    parentMatrix?: mat4
  ) {
    const rotQuat = quat.fromEuler(
      quat.create(),
      rotation[0],
      rotation[1],
      rotation[2]
    );
    const modelMatrix = mat4.fromRotationTranslationScaleOrigin(
      mat4.create(),
      rotQuat,
      position as vec3,
      scale as vec3,
      origin as vec3
    );
    return parentMatrix
      ? mat4.multiply(mat4.create(), parentMatrix, modelMatrix)
      : modelMatrix;
  }

  // todo: move this code, also why is it needed? use modelMatrix on node
  getOffsetModelMatrix(bounds) {
    const min = [bounds[0], bounds[1], bounds[2]];
    const max = [bounds[3], bounds[4], bounds[5]];

    const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
    const offset = vec3.add(
      vec3.create(),
      min as vec3,
      vec3.scale(vec3.create(), size, 0.5)
    );
    const position = vec3.negate(vec3.create(), offset);

    const modelMatrix = this.getModelMatrix(
      [0, 0, 0],
      position as number[], //: offset, //: [0, 0, 0],
      [1, 1, 1]
    );

    return modelMatrix;
  }

  // this function is called from main viewstate change to load or unload viewers
  // it will run before the viewstate is set to set views and layers for the viewers <- for NEW viewers only the existing should be cached
  // updateViewers(): {
  //   layers: Layer[];
  //   views: View[];
  // } {
  //   // todo: refactor -> if viewers -> get all nodes WITHIN VIEWPORT and create viewers, combine with existingLayers
  //   // todo: also remove viewers out of viewport from cached viewers
  //   // todo: if not viewers because of zoom -> remove all cached viewers
  //   const nodes = this.mainLayoutEngine.getGraph().getNodes(); // todo: <- use cache instead here since it's used to check visible viewers

  //   // todo: cache - only run if viewer needs to be added or removed (changed major zoom level, ...)
  //   // note: at some zoom viewer should be removed
  //   const showViewersAtZoom = 2;
  //   const viewport = this.deck.viewManager.getViewport('main');
  //   const existingLayers = this.deck.props.layers.filter(
  //     layer => !nodes.find(n => generateLayerIdFromNodeId(n.id) === layer.id)
  //   );
  //   const existingViews = this.deck.viewManager.getViews();
  //   if (viewport.zoom < showViewersAtZoom) {
  //     return {
  //       views: Object.values(existingViews),
  //       layers: existingLayers,
  //     };
  //   }
  //   // todo: use rect to see if some cached viewer should be removed
  //   const viewports = this.deck.viewManager.getViewports();
  //   // todo: find visible nodes in current main viewport
  //   const viewerViews = nodes
  //     .filter(node => {
  //       // todo: if inside
  //       return node;
  //     })
  //     .reduce((acc, node) => {
  //       const { x, y, width, height } = this.calculateViewerPosition();
  //       acc[node.id] = new OrthographicView({
  //         id: node.id,
  //         orthographic: true,
  //         controller: Boolean(viewport.zoom > 20),
  //         x,
  //         y,
  //         width,
  //         height,
  //         clear: true,
  //       });
  //       return acc;
  //     }, {});
  //   // todo: load data for each node that is not already loaded and cached

  //   // todo: determine viewer type to generate the layers and what kind of view
  //   const viewerLayers = nodes.map(node => {
  //     // todo: <- use ALL visible nodes here NOT CACHE
  //     return new SimpleMeshLayer({
  //       id: generateLayerIdFromNodeId(node.id),
  //       data: [node],
  //       modelMatrix: mat4.identity(mat4.create()),
  //       coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  //       wireframe: false,
  //       getColor: shape => shape.color || [255, 0, 0, 200],
  //       mesh: new BoxGeometry(),
  //       parameters: {
  //         depthTest: true,
  //       },
  //       getTransformMatrix: shape =>
  //         shape?.modelMatrix ? shape.modelMatrix : mat4.create(),
  //     });
  //   });

  //   // console.log(viewerViews);
  //   // console.log(existingViews);
  //   // console.log(existingLayers);
  //   const views = [
  //     ...Object.values(existingViews),
  //     ...Object.values(viewerViews),
  //   ];
  //   return {
  //     views,
  //     layers: [...existingLayers, ...viewerLayers],
  //   };
  // }

  // updateGraph(graphLayerProps) {
  //   console.log('uypdate graph');
  //   if (!this.deck) {
  //     return;
  //   }
  //   this.deck.setProps({
  //     views: [
  //       new OrthographicView({
  //         id: 'graphView',
  //         controller: true,
  //         x: 0,
  //         y: 0,
  //         width: this.props.width,
  //         height: this.props.height,
  //         flipY: false,
  //       }),
  //     ],
  //     viewState: {
  //       graphView: {
  //         zoom: 0,
  //         target: [0, 0, 0],
  //         longitude: 0,
  //         latitude: 0,
  //         rotationX: 0,
  //         rotationOrbit: 0,
  //       },
  //     },
  //     // viewState: this.mainViewer.getViewState(),
  //     // onInteractionStateChange: this.onInteractionStateChange.bind(this),
  //     onViewStateChange: this.onViewStateChange.bind(this),
  //     // layerFilter: this.getLayerFilter(),
  //     layers: [
  //       // new GraphLayer({
  //       //   nodes: [
  //       //     {
  //       //       id: '1',
  //       //       name: 'node 1',
  //       //     },
  //       //     {
  //       //       id: '2',
  //       //       name: 'node 2',
  //       //     },
  //       //   ],
  //       //   edges: [
  //       //     {
  //       //       source: '1',
  //       //       target: '2',
  //       //       id: '1',
  //       //       name: 'edge 1',
  //       //     },
  //       //   ],
  //       // }),
  //       // new AxesLayer({
  //       //   id: 'axes',
  //       //   //modelMatrix,
  //       //   drawAxes: true,
  //       //   fontSize: 12,
  //       //   xScale: scaleLinear().domain([0, 200]),
  //       //   yScale: scaleLinear().domain([0, 200]),
  //       //   zScale: scaleLinear().domain([0, 200]),
  //       //   xTicks: 100,
  //       //   yTicks: 100,
  //       //   zTicks: 10,
  //       //   xTickFormat: x => x.toFixed(0),
  //       //   yTickFormat: x => x.toFixed(0),
  //       //   zTickFormat: x => x.toFixed(2),
  //       //   xTitle: '',
  //       //   yTitle: 'Wood volume',
  //       //   zTitle: '',
  //       //   padding: 0.01,
  //       //   color: [200, 200, 200, 255],
  //       //   coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  //       // }),
  //       // new ScatterplotLayer({
  //       //   id: 'scatterplot-layer',
  //       //   coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  //       //   pickable: true,
  //       //   opacity: 0.8,
  //       //   stroked: true,
  //       //   filled: true,
  //       //   radiusScale: 6,
  //       //   radiusMinPixels: 1,
  //       //   radiusMaxPixels: 100,
  //       //   lineWidthMinPixels: 1,
  //       //   getPosition: d => [d.x, d.y],
  //       //   getRadius: d => 10,
  //       //   getFillColor: d => [255, 140, 0],
  //       //   getLineColor: d => [0, 0, 0],
  //       //   data: [
  //       //     {
  //       //       x: 0,
  //       //       y: 0,
  //       //     },
  //       //     {
  //       //       x: 100,
  //       //       y: 0,
  //       //     },
  //       //   ],
  //       // }),
  //     ],
  //   });
  // }

  sendMessage(topic: string, message: any) {
    this.socket.send(JSON.stringify({ topic, message }));
  }

  async connectToWebsocket(websocketUrl): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(websocketUrl);

      this.socket.addEventListener('open', () => {
        this.sendMessage('status', 'Viewer opened socket connection');
        resolve();
      });

      this.socket.addEventListener('message', (event: any) => {
        const data = JSON.parse(event.data);
        console.log('Message from server', data);
      });

      this.socket.addEventListener('close', (event: any) => {
        console.log('Socket closed, attempt to reconnect', event.reason);
        setTimeout(() => {
          this.connectToWebsocket(websocketUrl);
        }, 1000);
      });

      this.socket.addEventListener('error', (event: any) => {
        console.error('Socket error, closing connections', event.message);
        this.socket.close();
        reject();
      });
    });
  }

  // use this to re-check auth
  reconnectToWebsocket() {
    this.socket.close();
  }
}

export { Viewer };
