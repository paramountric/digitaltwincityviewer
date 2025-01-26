import {
  CompositeLayer,
  UpdateParameters,
  COORDINATE_SYSTEM,
  Context,
} from '@deck.gl/core';
import { TextLayer, LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import { stratify, tree } from 'd3-hierarchy';

type Node = {
  id: string;
  name: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  radius?: number;
  color?: [number, number, number];
};

type Edge = {
  source: string;
  target: string;
  id: string;
  name: string;
};

const defaultProps = {};

class TreeLayer extends CompositeLayer {
  static layerName = 'TreeLayer';
  static defaultProps = defaultProps;
  context: Context;
  state: {
    nodes: Node[];
    edges: Edge[];
    nodeAltitude: number;
  };

  constructor(props) {
    super(props);
  }

  initializeState(): void {
    this.state = {
      nodes: [],
      edges: [],
      nodeAltitude: 0,
    };
  }

  updateState({ props, oldProps, changeFlags }: UpdateParameters<this>): void {
    super.updateState({ props, oldProps, changeFlags });
    if (props.nodes.length === 0) {
      return;
    }
    const nodesChanged = props.nodes.length !== oldProps.nodes?.length;
    const edgesChanged = props.edges.length !== oldProps.edges?.length;
    if (!nodesChanged && !edgesChanged && !changeFlags.dataChanged) {
      return;
    }
    const nodeMap = props.nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
    console.log(props);
    const parentId = props.parentId || props.nodes[0].id;
    const parentNode = nodeMap[parentId];
    // add all the targets
    const nodes = props.edges.map(edge => {
      const source = nodeMap[edge.source];
      const target = nodeMap[edge.target];
      return {
        id: target.id,
        name: target.name,
        parentId: source.id,
      };
    });
    // add one root
    nodes.push({
      id: parentId,
      name: parentNode.name,
      parentId: null,
    });
    // set edges with references

    console.log(nodes);

    // calculate the layout
    const root = stratify()(nodes);
    console.log(root);
    console.log(root.links());
    console.log(root.descendants());

    const { nodeSize = [10, 10] } = props;
    const dx = 500 / (root.height + 1);
    const dy = -500 / (root.height + 1);
    tree().nodeSize([dx, dy])(root);

    this.state.edges = root.links();
    this.state.nodes = root.descendants();

    console.log(this.state.nodes);
    console.log(this.state.edges);
  }

  onTick(e) {
    // @ts-ignore somehow the parent methods are not visible to TS
    this.setNeedsUpdate(true);
  }

  onEnd(e) {
    // @ts-ignore somehow the parent methods are not visible to TS
    this.setNeedsUpdate(true);
  }

  onHover(info) {
    //console.log(info);
  }

  onClick(info) {
    //console.log(info);
  }

  onDragStart(info, e) {
    //console.log(this);
    //console.log(info, e);
  }

  onDrag(info, e) {
    console.log(info, e);
    e.preventDefault();
    info.object.x = info.coordinate[0];
    info.object.fx = info.coordinate[0];
    info.object.y = info.coordinate[1];
    info.object.fy = info.coordinate[1];
    this.renderLayers();
  }

  onDragEnd(info, e) {
    console.log(info, e);
    info.object.fx = null;
    info.object.fy = null;
  }

  renderLayers() {
    return [
      new LineLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'tree-edge-layer',
          data: this.state.edges,
          autoHighlight: false,
          pickable: false,
          getWidth: 1,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          getSourcePosition: d => [
            d.source.x,
            d.source.y,
            this.state.nodeAltitude - 2,
          ],
          getTargetPosition: d => [
            d.target.x,
            d.target.y,
            this.state.nodeAltitude - 2,
          ],
          getColor: [100, 100, 100],
          updateTriggers: {
            getSourcePosition: d => [
              d.source.x,
              d.source.y,
              this.state.nodeAltitude - 2,
            ],
            getTargetPosition: d => [
              d.target.x,
              d.target.y,
              this.state.nodeAltitude - 2,
            ],
          },
          parameters: {
            depthTest: false,
          },
        })
      ),
      // new TextLayer(
      //   // @ts-ignore somehow the parent methods are not visible to TS
      //   this.getSubLayerProps({
      //     id: 'tree-edge-text-layer',
      //     data: this.state.edges,
      //     autoHighlight: false,
      //     coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      //     //sizeScale: Math.max(0, this.context.viewport.zoom),
      //     getPosition: e => {
      //       const edgePoints = [
      //         [e.source.x, e.source.y],
      //         [e.target.x, e.target.y],
      //       ];
      //       const totalX = edgePoints.reduce((acc, p) => acc + p[0], 0);
      //       const totalY = edgePoints.reduce((acc, p) => acc + p[1], 0);
      //       return [
      //         totalX / edgePoints.length,
      //         totalY / edgePoints.length,
      //         //this.state.nodeAltitude - 1,
      //       ];
      //     },
      //     getAngle: e => {
      //       const edgePoints =
      //         e.source.x < e.target.x
      //           ? [
      //               [e.source.x, e.source.y],
      //               [e.target.x, e.target.y],
      //             ]
      //           : [
      //               [e.target.x, e.target.y],
      //               [e.source.x, e.source.y],
      //             ];
      //       const deltaX = edgePoints[1][0] - edgePoints[0][0];
      //       const deltaY = edgePoints[1][1] - edgePoints[0][1];
      //       // note the y direction
      //       const angle = (Math.atan2(-deltaY, deltaX) * -180) / Math.PI;
      //       return angle;
      //     },
      //     getColor: [100, 100, 100],
      //     getSize: 10,
      //     billboard: false,
      //     background: true,
      //     getBorderWidth: 1,
      //     backgroundPadding: [2, 1],
      //     getBorderColor: [100, 100, 100],
      //     getText: d => d.name,
      //     updateTriggers: {
      //       getPosition: d => [d.x, d.y],
      //       //getSize: [1, this.context.viewport.zoom],
      //       getAngle: d => d,
      //     },
      //     parameters: {
      //       depthTest: false,
      //     },
      //   })
      // ),
      new ScatterplotLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'tree-circle-layer',
          opacity: 1,
          autoHighlight: true,
          highlightColor: [100, 150, 250, 128],
          billboard: false,
          pickable: false,
          stroked: true,
          lineWidthMinPixels: 1,
          data: this.state.nodes,
          // @ts-ignore somehow the parent methods are not visible to TS
          //radiusScale: this.context.viewport.zoom,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          getPosition: d => {
            return [d.x, d.y, this.state.nodeAltitude];
          },
          getRadius: d => d.radius || 2,
          getFillColor: d => d.color || [100, 100, 100],
          getLineColor: d => [100, 100, 100],
          updateTriggers: {
            getPosition: d => [d.x, d.y],
          },
          parameters: {
            depthTest: false,
          },
        })
      ),
      new TextLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'tree-text-layer',
          data: this.state.nodes,
          autoHighlight: false,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          // @ts-ignore somehow the parent methods are not visible to TS
          //sizeScale: this.context.viewport.zoom,
          getPosition: d => {
            return [d.x, d.y + 15, this.state.nodeAltitude];
          },
          getColor: [100, 100, 100],
          getSize: 15,
          billboard: false,
          background: true,
          backgroundColor: [239, 239, 239],
          getText: d => d.data.name,
          updateTriggers: {
            getPosition: d => [d.x, d.y],
            //getSize: [1, this.context.viewport.zoom],
          },
          parameters: {
            depthTest: false,
          },
        })
      ),
    ];
  }
}

TreeLayer.layerName = 'TreeLayer';
TreeLayer.defaultProps = {
  nodes: [],
  edges: [],
  nodeSize: [10, 10],
};

export { TreeLayer };
