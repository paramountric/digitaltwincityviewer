import { COORDINATE_SYSTEM, OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import { scaleLinear } from 'd3-scale';
import { mat4, vec3 } from 'gl-matrix';
import { GraphLayer } from './layers/GraphLayer.js';
import { default as GraphGlLayer } from './layers/graphgl-layers/graph-layer.js';
import { TreeLayer } from './layers/TreeLayer.js';
import { AxesLayer } from './layers/plot-layer/index.js';
// import GraphEngine from './graph/graph-engine.js';
// import ForceLayout from './graph/layouts/force-layout.js';
// import Graph from './graph/graph.js';
// import Node from './graph/node.js';
// import Edge from './graph/edge.js';

// todo: check whether to use 'get' or not, since these will generate updateTriggers
function getLinearScale({ domain }) {
  return scaleLinear().domain(domain);
}

function getGridMatrix({ size }) {
  const m = getOffsetMatrix({ size });
  return mat4.scale(m, m, vec3.fromValues(size, size, size));
}

function getOffsetMatrix({ size }) {
  const half = size * 0.5;
  const position = vec3.negate(
    vec3.create(),
    vec3.fromValues(half, half, half)
  );
  return mat4.fromTranslation(mat4.create(), position);
}

function getTranslateMatrix({ translate }) {
  return mat4.fromTranslation(
    mat4.create(),
    vec3.fromValues(translate[0] || 0, translate[1] || 0, translate[2] || 0)
  );
}

// function initEngine({ nodes, edges }) {
//   const engine = new GraphEngine();
//   const layout = new ForceLayout();
//   const graph = new Graph();
//   console.log(edges);
//   console.log(graph);
//   graph.batchAddNodes(nodes.map(n => new Node(n)));
//   graph.batchAddEdges(
//     edges.map(
//       e => new Edge({ sourceId: e._sourceId, targetId: e._targetId, id: e.id })
//     )
//   );
//   console.log('run engine');
//   engine.run(graph, layout);
//   return engine;
// }

export default {
  classes: {
    ScatterplotLayer,
    OrthographicView,
    GraphLayer,
    GraphGlLayer,
    AxesLayer,
    LineLayer,
    TreeLayer,
  },
  functions: {
    getLinearScale,
    getGridMatrix,
    getTranslateMatrix,
    //initEngine,
  },
  enumerations: {
    COORDINATE_SYSTEM,
  },
};
