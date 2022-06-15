import {
  CompositeLayer,
  UpdateParameters,
  COORDINATE_SYSTEM,
} from '@deck.gl/core';
import { TextLayer, ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import {
  forceSimulation as ForceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from 'd3-force';

type Node = {
  id: string;
  name: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

type Edge = {
  source: string;
  target: string;
  id: string;
  name: string;
};

const DEFAULT_COLLISION_RADIUS = 600;
// https://github.com/d3/d3-force#simulation_alpha
const ALPHA = 1;

const defaultProps = {};

export default class GraphLayer extends CompositeLayer {
  static layerName = 'GraphLayer';
  static defaultProps = defaultProps;
  state: {
    nodes: Node[];
    edges: Edge[];
    simulation?: ForceSimulation;
    graphLayerAltitude: number;
  };

  initializeState(): void {
    this.state = {
      nodes: [],
      edges: [],
      graphLayerAltitude: 400,
    };
    console.log('init graph layer');
  }

  updateState({ props, oldProps, changeFlags }: UpdateParameters<this>): void {
    super.updateState({ props, oldProps, changeFlags });
    const nodesChanged = props.nodes.length !== oldProps.nodes?.length;
    const edgesChanged = props.edges.length !== oldProps.edges?.length;
    if (!nodesChanged && !edgesChanged && !changeFlags.dataChanged) {
      return;
    }
    // todo: better keep the map in state instead of array
    // also: only send in add data and remove data

    // ! refactor this -> keep the state of nodes in a map, remove old according to new props, and add new if not exist
    const newNodes = props.nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});

    const keepNodes = this.state.nodes.reduce((acc, node) => {
      if (newNodes[node.id]) {
        acc[node.id] = node;
      }
      return acc;
    }, {});

    this.state.edges = [];
    this.state.nodes = [];

    for (const node of props.nodes) {
      if (keepNodes[node.id]) {
        this.state.nodes.push(keepNodes[node.id]);
      } else {
        this.state.nodes.push({
          id: node.id,
          name: node.name || node.id,
          x: node.x || 0,
          y: node.y || 0,
          fx: node.fx || null,
          fy: node.fy || null,
        });
      }
    }
    for (const edge of props.edges) {
      this.state.edges.push({
        source: edge.source,
        target: edge.target,
        name: edge.name,
        id: edge.id,
      });
    }
    if (props.nodes.length > 0) {
      this.runSimulation();
    }
  }

  onTick(e) {
    // @ts-ignore somehow the parent methods are not visible to TS
    this.setNeedsUpdate(true);
  }

  onEnd(e) {
    // @ts-ignore somehow the parent methods are not visible to TS
    this.setNeedsUpdate(true);
  }

  public runSimulation() {
    if (this.state.simulation) {
      this.state.simulation.on('tick', null).on('end', null);
      this.state.simulation = null;
    }
    // https://github.com/d3/d3-force
    this.state.simulation = new ForceSimulation(this.state.nodes)
      .force(
        'charge',
        forceManyBody().strength(-900).distanceMin(1000).distanceMax(1000)
      )
      .force(
        'link',
        forceLink(this.state.edges)
          .id(n => n.id)
          .distance(0)
          .strength(0.2)
      )
      .force('center', forceCenter())
      .force(
        'collision',
        forceCollide().radius(
          d => d.collisionRadius || DEFAULT_COLLISION_RADIUS
        )
      )
      .alpha(ALPHA);
    this.state.simulation
      .on('tick', this.onTick.bind(this))
      .on('end', this.onEnd.bind(this));
  }

  renderLayers() {
    return [
      new LineLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'graph-edge-layer',
          data: this.state.edges,
          autoHighlight: false,
          pickable: false,
          getWidth: 1,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getSourcePosition: d => [
            d.source.x,
            d.source.y,
            this.state.graphLayerAltitude - 2,
          ],
          getTargetPosition: d => [
            d.target.x,
            d.target.y,
            this.state.graphLayerAltitude - 2,
          ],
          getColor: [100, 100, 100],
          updateTriggers: {
            getSourcePosition: d => [
              d.source.x,
              d.source.y,
              this.state.graphLayerAltitude - 2,
            ],
            getTargetPosition: d => [
              d.target.x,
              d.target.y,
              this.state.graphLayerAltitude - 2,
            ],
          },
          parameters: {
            depthTest: false,
          },
        })
      ),
      new TextLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'graph-edge-text-layer',
          data: this.state.edges,
          autoHighlight: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          // @ts-ignore somehow the parent methods are not visible to TS
          sizeScale: this.context.viewport.zoom / 1.5, // todo: this must be connected to the graph view viewport
          getPosition: e => {
            const edgePoints = [
              [e.source.x, e.source.y],
              [e.target.x, e.target.y],
            ];
            const totalX = edgePoints.reduce((acc, p) => acc + p[0], 0);
            const totalY = edgePoints.reduce((acc, p) => acc + p[1], 0);
            return [
              totalX / edgePoints.length,
              totalY / edgePoints.length,
              this.state.graphLayerAltitude - 1,
            ];
          },
          getAngle: e => {
            const edgePoints =
              e.source.x < e.target.x
                ? [
                    [e.source.x, e.source.y],
                    [e.target.x, e.target.y],
                  ]
                : [
                    [e.target.x, e.target.y],
                    [e.source.x, e.source.y],
                  ];
            const deltaX = edgePoints[1][0] - edgePoints[0][0];
            const deltaY = edgePoints[1][1] - edgePoints[0][1];
            // note the y direction
            const angle = (Math.atan2(-deltaY, deltaX) * -180) / Math.PI;
            return angle;
          },
          getColor: [100, 100, 100],
          getSize: 1,
          billboard: false,
          background: true,
          getBorderWidth: 1,
          backgroundPadding: [2, 1],
          getBorderColor: [100, 100, 100],
          getText: d => d.name,
          updateTriggers: {
            getPosition: d => [d.x, d.y],
            getAngle: d => d,
          },
          parameters: {
            depthTest: false,
          },
        })
      ),
      new ScatterplotLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'graph-circle-layer',
          opacity: 1,
          autoHighlight: true,
          highlightColor: [100, 150, 250, 128],
          billboard: false,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 1,
          data: this.state.nodes,
          // @ts-ignore somehow the parent methods are not visible to TS
          radiusScale: this.context.viewport.zoom,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => {
            return [d.x, d.y, this.state.graphLayerAltitude];
          },
          getRadius: d => 10,
          getFillColor: d => [255, 255, 255],
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
          id: 'graph-text-layer',
          data: this.state.nodes,
          autoHighlight: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          // @ts-ignore somehow the parent methods are not visible to TS
          sizeScale: this.context.viewport.zoom, // todo: this must be connected to the graph view viewport
          getPosition: d => {
            return [d.x, d.y, this.state.graphLayerAltitude];
          },
          getColor: [100, 100, 100],
          getSize: 1,
          billboard: false,
          getText: d => d.name,
          updateTriggers: {
            getPosition: d => [d.x, d.y],
          },
          parameters: {
            depthTest: false,
          },
        })
      ),
    ];
  }
}
