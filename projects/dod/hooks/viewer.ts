import { useState, useEffect, useMemo } from 'react';
import { Viewer } from '@paramountric/viewer';
import {
  Exploration,
  Edge,
  Node,
  Graph,
  SimpleLayout,
  TreeLayout,
  ForceLayout,
  TimeProcessLayout,
} from '@paramountric/entity';
import { validateUntrusted } from '../lib/jdt';
import { Observable } from '../lib/Observable';
import { useStreams } from './streams';
import { useNode } from './node';
import { useUi } from './ui';
import { useGraph } from './graph';
import { useExploration } from './exploration';
import { useToken } from './token';
import { useObjects } from './objects';
import { Type, TypeMap, useTypes } from './types';

export type ViewerStore = {
  viewer: Viewer | undefined;
};

const viewerStore = new Observable<ViewerStore>({
  viewer: undefined,
});

export const useViewer = (): {
  initViewer: (ref: HTMLCanvasElement) => void;
  setData: (data: any) => void;
  viewer: Viewer | undefined;
  viewerLoading: boolean;
} => {
  const {
    nodes: baseBucketNodes,
    edges: baseBucketEdges,
    typeCommits,
    isLoading,
  } = useStreams();
  const tokenData = useToken();
  const [isInit, setIsInit] = useState<boolean>(false);
  const {
    actions: { setSelectedNodeId },
  } = useNode();
  const {
    state: { showTimelineX, showValidation },
    actions: { setShowRightMenu },
  } = useUi();
  const {
    state: { graph, layout },
  } = useGraph();
  const {
    state: { nodes: explorationNodes, edges: explorationEdges },
  } = useExploration();
  const {
    actions: { setTypes },
    state: { loadedTypeMap },
  } = useTypes();
  const {
    actions: { loadBucket, getBucketLoader },
    state: bucketLoaderState,
  } = useObjects();

  const [viewerState, setViewerState] = useState(viewerStore.get());

  useEffect(() => {
    return viewerStore.subscribe(setViewerState);
  }, []);

  const viewerActions = useMemo(() => {
    return {
      setViewer: (viewer: Viewer) =>
        viewerStore.set({ ...viewerState, viewer }),
    };
  }, [viewerState]);

  useEffect(() => {
    if (viewerState.viewer) {
      viewerState.viewer.setProps({
        showValidation,
      });
    }
  }, [showValidation]);

  const loadTypes = async () => {
    if (!typeCommits || !tokenData?.token) {
      return;
    }
    console.log(typeCommits);
    const loaders = [];
    for (const commit of typeCommits) {
      const bucketLoader = await loadBucket(
        commit.streamId,
        commit.id,
        commit.referencedObject,
        tokenData.token
      );
      loaders.push(bucketLoader);
    }
    const typeMap: TypeMap = {};
    for (const loader of loaders) {
      console.log('bucket loader', loader);
      Object.assign(typeMap, loader.typeMap);
    }
    console.log('typemap', typeMap);
    setTypes(Object.values(typeMap));
  };

  useEffect(() => {
    console.log('typeCommits');
    console.log(typeCommits);
    loadTypes();
  }, [typeCommits]);

  // UPDATE viewport if graph changes
  // todo: check if updated properly
  useEffect(() => {
    if (baseBucketNodes && baseBucketEdges && viewerState.viewer) {
      graph.reset();
      console.log(baseBucketNodes, explorationNodes);
      if (explorationNodes) {
        graph.batchAddNodes([...baseBucketNodes, ...explorationNodes]);
      } else {
        graph.batchAddNodes(baseBucketNodes);
      }
      if (explorationEdges) {
        graph.batchAddEdges([...baseBucketEdges, ...explorationEdges]);
      } else {
        graph.batchAddEdges(baseBucketEdges);
      }
      console.log('update graph', graph);
      // same graph reference is used and potentially same layout
      const forceUpdate = true;
      viewerState.viewer.updateGraph(graph, layout, forceUpdate);
      viewerState.viewer.setProps({
        showTimelineX,
        showValidation,
      });
    }
  }, [
    graph,
    layout,
    baseBucketNodes,
    baseBucketEdges,
    showTimelineX,
    // dont trigger on exploration, since layot MUST be used to switch between exploration and chronologic
    // explorationNodes,
    // explorationEdges,
  ]);

  // INIT
  useEffect(() => {
    if (viewerState.viewer && !isInit) {
      viewerState.viewer.setProps();
      setIsInit(true);
    }
  }, [viewerState.viewer, isInit]);

  return {
    initViewer: async ref => {
      if (viewerState.viewer) {
        return;
      }
      console.log('init viewer');
      ref.style.width = '100%'; //window.innerWidth;
      ref.style.height = '100%'; //window.innerHeight;
      ref.style.position = 'absolute';
      ref.style.top = '0px';
      ref.style.left = '0px';
      //ref.style.background = '#100';
      viewerActions.setViewer(
        new Viewer({
          canvas: ref,
          showTimelineX,
          showValidation,
          zoom: 1,
          // longitude: 11.9746,
          // latitude: 57.7089,
          width: '100%',
          height: '100%',
          onNodeClick: ({ object }) => {
            console.log(object);
            setSelectedNodeId(object.id);
            setShowRightMenu(true);
          },
        })
      );
    },
    setData: data => {
      if (!viewerState.viewer) {
        console.error('cannot set data until viewer is initialized');
      }
      viewerState.viewer?.setJson(data);
    },
    viewer: viewerState.viewer,
    viewerLoading: false,
  };
};

// const { modelMatrix } = getIfcUniformData(filteredEntities);
//   const data = filteredEntities.map(e => {
//     const dataObject = e.shape;
//     dataObject.entityId = e.id;
//     return dataObject;
//   });

// viewer.setJson({
//   views: [
//     {
//       '@@type': 'OrthographicView',
//       id: 'graphView',
//       controller: true,
//       x: 0,
//       y: 0,
//       // width: this.props.width,
//       // height: this.props.height,
//       flipY: false,
//     },
//   ],
//   viewState: {
//     graphView: {
//       zoom: 0,
//       target: [0, 0, 0],
//       longitude: 0,
//       latitude: 0,
//       rotationX: 0,
//       rotationOrbit: 0,
//     },
//   },
//   layers: [
//     {
//       '@@type': 'GraphLayer',
//       modelMatrix: {
//         '@@function': 'getTranslateMatrix',
//         translate: [-500, -500],
//       },
//       nodes,
//       edges: [],
//       radiusScale: 30,
//       radiusMinPixels: 0.25,
//       getPosition: '@@=-',
//       getFillColor: [0, 128, 255],
//       getRadius: 1,
//     },
//     {
//       '@@type': 'SimpleMeshLayer',
//       id: fileName,
//       pickable: true,
//       autoHighlight: true,
//       highlightColor: [10, 10, 100, 128],
//       data,
//       modelMatrix: {
//         '@@function': 'getTranslateMatrix',
//         translate: [-500, -500],
//       },
//       coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
//       wireframe: false,
//       getColor: shape => shape.color || [255, 255, 255, 255],
//       mesh: new CubeGeometry(),
//       getTransformMatrix: shape =>
//         shape?.modelMatrix ? shape.modelMatrix : mat4.create(),
//     },
//   ],
// });

//const viewerJson = {
// views: [
//   {
//     '@@type': 'OrthographicView',
//     id: 'graphView',
//     controller: true,
//     x: 0,
//     y: 0,
//     // width: this.props.width,
//     // height: this.props.height,
//     flipY: false,
//   },
// ],
// viewState: {
//   graphView: {
//     zoom: 0,
//     target: [0, 0, 0],
//     longitude: 0,
//     latitude: 0,
//     rotationX: 0,
//     rotationOrbit: 0,
//   },
// },
// views: [
//   {
//     '@@type': 'OrthographicView',
//     id: 'graphView',
//     controller: true,
//     x: 0,
//     y: 0,
//     // width: this.props.width,
//     // height: this.props.height,
//     flipY: false,
//   },
// ],
// viewState: {
//   graphView: {
//     zoom: 0,
//     target: [0, 0, 0],
//     longitude: 0,
//     latitude: 0,
//     rotationX: 0,
//     rotationOrbit: 0,
//   },
// },
// layers: [
// {
//   '@@type': 'AxesLayer',
//   id: 'axes',
//   modelMatrix: {
//     '@@function': 'getGridMatrix',
//     size: 1000,
//   },
//   drawAxes: true,
//   fontSize: 12,
//   xScale: {
//     '@@function': 'getLinearScale',
//     domain: [0, 1000],
//   },
//   yScale: {
//     '@@function': 'getLinearScale',
//     domain: [0, 1000],
//   },
//   zScale: {
//     '@@function': 'getLinearScale',
//     domain: [0, 1000],
//   },
//   xTicks: 4,
//   yTicks: 4,
//   zTicks: 1,
//   xTickFormat: '@@=-',
//   yTickFormat: '@@=-',
//   zTickFormat: '@@=-',
//   xTitle: 'X',
//   yTitle: 'Y',
//   zTitle: 'Z',
//   //padding: 0.01,
//   color: [200, 200, 200, 255],
//   coordinateSystem: '@@#COORDINATE_SYSTEM.CARTESIAN',
// },
// {
//   "@@type": "LineLayer",
//   modelMatrix: {
//     "@@function": 'getTranslateMatrix',
//     "translate": [-500, -500]
//   },
//   getColor: [0, 200, 0],
//   data: zOrderLines,//kdLines,
// },
// {
//   "@@type": "GraphLayer",
//   modelMatrix: {
//     "@@function": 'getTranslateMatrix',
//     "translate": [-500, -500]
//   },
//   nodes: [...mortonNodes, ...nodes],
//   edges: [],
//   "radiusScale": 30,
//   "radiusMinPixels": 0.25,
//   "getPosition": "@@=-",
//   "getFillColor": [
//     0,
//     128,
//     255
//   ],
//   "getRadius": 1
// }
// {
//   "@@type": "TreeLayer",
//   modelMatrix: {
//     "@@function": 'getTranslateMatrix',
//     "translate": [0, 250]
//   },
//   nodes: [],
//   edges: [],
//   parentId: null
// }
//     {
//       '@@type': 'GraphLayer',
//       modelMatrix: {
//         '@@function': 'getTranslateMatrix',
//         translate: [0, 250],
//       },
//       nodes: [
//         {
//           id: '1',
//           name: '1',
//         },
//         {
//           id: '2',
//           name: '2',
//         },
//       ],
//       edges: [
//         {
//           id: '1-2',
//           target: '1',
//           source: '2',
//         },
//       ],

//       parentId: null,
//     },
//   ],
// };

//useEffect(() => {
// console.log('init', isInit);
// if (isInit) {
//   return;
// }
// console.log('init pas', isInit, viewer, graph);

// if (viewer) {
//   if (graph) {
//     //viewer.render();
//     // const currentLayout = new ForceLayout();
//     // viewer.updateGraph(graph, currentLayout);
//   }
// const json: any = {
//   // views: [
//   //   {
//   //     '@@type': 'MapView',
//   //     id: 'mapview',
//   //     orthographic: true,
//   //     controller: true,
//   //   },
//   // ],
//   // viewState: {
//   //   mainview: {
//   //     longitude: 0, //11.9746,
//   //     latitude: 0, //57.7089,
//   //     zoom: 0,
//   //     target: [0, 0, 0],
//   //     pitch: 60,
//   //     bearing: 0,
//   //   },
//   // },
//   views: [
//     {
//       '@@type': 'OrthographicView',
//       id: 'graphView',
//       controller: true,
//       x: 0,
//       y: 0,
//       // width: this.props.width,
//       // height: this.props.height,
//       flipY: false,
//     },
//   ],
//   viewState: {
//     graphView: {
//       zoom: 0,
//       target: [0, 0, 0],
//       longitude: 0,
//       latitude: 0,
//       rotationX: 0,
//       rotationOrbit: 0,
//     },
//   },
//   layers: [
//     // {
//     //   '@@type': 'MVTLayer',
//     //   //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//     //   data: 'http://localhost:9000/tiles/{z}/{x}/{y}',
//     // },
//     // {
//     //   '@@type': 'QuadkeyLayer',
//     //   id: 'quadkeys',
//     //   data: [
//     //     {
//     //       quadkey: viewer.getQuadkey(1, 0, 1),
//     //       fillColor: [128, 255, 0],
//     //       elevation: 10,
//     //     },
//     //     {
//     //       quadkey: viewer.getQuadkey(1, 1, 1),
//     //       fillColor: [255, 128, 255],
//     //       elevation: 100,
//     //     },
//     //     {
//     //       quadkey: viewer.getQuadkey(0, 1, 1),
//     //       fillColor: [128, 255, 255],
//     //       elevation: 10,
//     //     },
//     //     {
//     //       quadkey: viewer.getQuadkey(0, 0, 1),
//     //       fillColor: [255, 0, 255],
//     //       elevation: 100,
//     //     },
//     //   ],
//     //   coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//     //   pickable: false,
//     //   wireframe: true,
//     //   stroked: true,
//     //   filled: true,
//     //   extruded: true,
//     //   elevationScale: 1,
//     //   getFillColor: '@@=fillColor || [255, 128, 18]',
//     //   getLineColor: [0, 0, 0],
//     //   getLineWidth: 10,
//     //   // lineWidthUnits,
//     //   // lineWidthScale,
//     //   lineWidthMinPixels: 10,
//     //   // lineWidthMaxPixels,
//     //   // lineJointRounded,
//     //   // lineMiterLimit,
//     //   // lineDashJustified,
//     //   getElevation: '@@=elevation || 1',
//     // },
//   ],
// };
// if (explorationGraph) {
//   const { nodes, edges } = explorationGraph;
//   json.layers.push({
//     '@@type': 'GraphGlLayer',
//     engine: {
//       '@@function': 'initEngine',
//       nodes,
//       edges,
//     },
//     modelMatrix: {
//       '@@function': 'getTranslateMatrix',
//       translate: [0, 250],
//     },
//     nodes,
//     edges,
//     edgeStyle: {
//       stroke: '#000',
//       strokeWidth: 1,
//       decorators: [],
//     },
//     enableDragging: true,
//     nodeStyle: [
//       {
//         type: 'CIRCLE',
//         radius: 10,
//         fill: 'rgb(236, 81, 72)',
//       },
//       {
//         type: 'MARKER',
//         marker: 'bell-filled',
//         fill: 'white',
//         size: 20,
//       },
//       {
//         type: 'LABEL',
//         text: 'bell',
//         color: 'rgb(236, 81, 72)',
//         fontSize: 10,
//         offset: [0, 15],
//       },
//     ],
//     // nodeEvents,
//     // edgeStyle,
//     // edgeEvents,
//     // enableDragging,
//     // resumeLayoutAfterDragging,
//   });
// }
// if (publicData) {
//   json.layers.push({
//     id: 'osm-context',
//     '@@type': 'GeoJsonLayer',
//     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//     modelMatrix: publicData.modelMatrix,
//     data: publicData.buildings,
//     pickable: false,
//     stroked: false,
//     filled: false,
//     extruded: false,
//     pointType: 'circle',
//     lineWidthScale: 1,
//     lineWidthMinPixels: 1,
//     getFillColor: [160, 160, 180, 200],
//     getLineColor: [100, 100, 100, 100],
//     getPointRadius: 100,
//     getLineWidth: 1,
//     getElevation: 30,
//   });
// }
// if (protectedData) {
//   json.layers.push({
//     id: 'bsm-data',
//     '@@type': 'SolidPolygonLayer',
//     //'@@type': 'GeoJsonLayer',
//     data: protectedData.buildings,
//     modelMatrix: protectedData.modelMatrix,
//     opacity: 1,
//     autoHighlight: true,
//     highlightColor: [100, 150, 250, 255],
//     extruded: true,
//     wireframe: true,
//     pickable: true,
//     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//     getPolygon: '@@=geometry.coordinates',
//     getFillColor: '@@=properties.color || [255, 255, 255, 255]',
//     getLineColor: [100, 100, 100],
//     getElevation: '@@=properties.height || 0',
//     useDevicePixels: true,
//     parameters: {
//       depthMask: true,
//       depthTest: true,
//       blend: true,
//       blendFunc: [
//         '@@#GL.SRC_ALPHA',
//         '@@#GL.ONE_MINUS_SRC_ALPHA',
//         '@@#GL.ONE',
//         '@@#GL.ONE_MINUS_SRC_ALPHA',
//       ],
//       polygonOffsetFill: true,
//       depthFunc: '@@#GL.LEQUAL',
//       blendEquation: '@@#GL.FUNC_ADD',
//     },
//   });
// }
// viewer.setJson(json);
//     // protectedDataLayer.data = protectedData.buildings;
//     // protectedDataLayer.modelMatrix = protectedData.modelMatrix;
//     //   viewer.setLayerProps('buildings-layer-polygons-lod-1', {
//     //     data: protectedData.buildings,
//     //     modelMatrix: protectedData.modelMatrix,
//     //     onDragEnd: updateTimeline,
//     //   });
//     //   viewer.setLayerState('buildings-layer-polygons-lod-1', {
//     //     url: 'http://localhost:9000/files/citymodel/CityModelWithBSMResults.json',
//     //     isLoaded: true,
//     //   });
//     //   viewer.render();
//   }
// }
// if (viewer) {
//   console.log('get tileset');
//   viewer.setJson({
// views: [
//   {
//     '@@type': 'MapView',
//     id: 'mainview',
//     controller: true,
//   },
// ],
// viewState: {
//   mainview: {
//     longitude: -75.152408, // -75.61209430782448, //11.9746,
//     latitude: 39.946975, //40.042530611425896, //57.7089,
//     zoom: 14,
//     target: [0, 0, 0],
//     pitch: 60,
//     bearing: 0,
//   },
// },
// layers: [
//   {
//     '@@type': 'Tile3DLayer',
//     //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//     data: 'http://localhost:9000/files/3dtiles/1.1/SparseImplicitQuadtree/tileset.json',
//     //loader: '@@#Tiles3DLoader',
//   },
//   ],
// });
// }
// if (viewer) {
//   console.log('get tileset');
//   viewer.setJson({
//     // views: [
//     //   {
//     //     '@@type': 'MapView',
//     //     id: 'mainview',
//     //     controller: true,
//     //   },
//     // ],
//     // viewState: {
//     //   mainview: {
//     //     longitude: -75.152408, // -75.61209430782448, //11.9746,
//     //     latitude: 39.946975, //40.042530611425896, //57.7089,
//     //     zoom: 14,
//     //     target: [0, 0, 0],
//     //     pitch: 60,
//     //     bearing: 0,
//     //   },
//     // },
//     layers: [
//       {
//         '@@type': 'MVTLayer',
//         //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//         data: 'http://localhost:9000/tiles/{z}/{x}/{y}',
//       },
//     ],
//   });
//   }
// }, [viewer, graph, isInit]); //[publicData, protectedData, viewer]);
