import {
  CompositeLayer,
  UpdateParameters,
  COORDINATE_SYSTEM,
} from '@deck.gl/core';
import { TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import {
  forceSimulation as ForceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from 'd3-force';

type Node = {
  id: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

type Edge = {
  source: string;
  target: string;
};

const DEFAULT_COLLISION_RADIUS = 200;
// https://github.com/d3/d3-force#simulation_alpha
const ALPHA = 0.1;

const defaultProps = {};

export default class GraphLayer extends CompositeLayer {
  static layerName = 'GraphLayer';
  static defaultProps = defaultProps;
  simulation: ForceSimulation;
  tick = 1;
  state: {
    nodes: Node[];
    edges: Edge[];
    // nodes: Map<string, Node>;
    // edges: Map<string, Edge>;
  };

  initializeState(): void {
    this.state = {
      nodes: [],
      edges: [],
      // nodes: new Map<string, Node>(),
      // edges: new Map<string, Edge>(),
    };
    console.log('init graph layer');
  }

  updateState({ props, oldProps, changeFlags }: UpdateParameters<this>): void {
    super.updateState({ props, oldProps, changeFlags });
    if (!changeFlags.dataChanged) {
      return;
    }
    for (const node of props.nodes) {
      this.state.nodes.push({
        id: node.id,
        x: node.x || 0,
        y: node.y || 0,
        fx: node.fx || null,
        fy: node.fy || null,
      });
    }
    for (const edge of props.edges) {
      this.state.edges.push({
        source: edge.source,
        target: edge.target,
      });
    }
    this.runSimulation();
  }

  onTick(e) {
    this.tick++;
    // @ts-ignore somehow the parent methods are not visible to TS
    this.setNeedsUpdate(true);
  }

  onEnd(e) {
    // @ts-ignore somehow the parent methods are not visible to TS
    this.setNeedsUpdate(true);
  }

  public runSimulation() {
    if (this.simulation) {
      this.simulation.on('tick', null).on('end', null);
      this.simulation = null;
    }
    // https://github.com/d3/d3-force
    this.simulation = new ForceSimulation(this.state.nodes)
      .force(
        'charge',
        forceManyBody().strength(-900).distanceMin(1000).distanceMax(1000)
      )
      .force(
        'link',
        forceLink(this.state.edges).id(n => n.id)
      )
      .force('center', forceCenter())
      .force(
        'collision',
        forceCollide().radius(
          d => d.collisionRadius || DEFAULT_COLLISION_RADIUS
        )
      )
      .alpha(ALPHA);
    this.simulation
      .on('tick', this.onTick.bind(this))
      .on('end', this.onEnd.bind(this));
  }

  renderLayers() {
    return [
      new ScatterplotLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'graph-circle-layer',
          opacity: 0.9,
          billboard: true,
          pickable: true,
          stroked: true,
          lineWidthMinPixels: 1,
          data: this.state.nodes,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => {
            return [d.x, d.y, 500];
          },
          getRadius: d => 100,
          getFillColor: d => [245, 245, 245],
          getLineColor: d => [100, 100, 100],
          updateTriggers: {
            getPosition: d => d.x,
          },
        })
      ),
      new TextLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: 'graph-text-layer',
          data: this.state.nodes,
          // @ts-ignore somehow the parent methods are not visible to TS
          sizeScale: this.context.viewport.zoom,
          getPosition: d => {
            return [d.x, d.y, 500];
          },
          getColor: [100, 100, 100],
          getSize: 1,
          getText: d => d.id,
          updateTriggers: {
            getPosition: d => d.x,
          },
        })
      ),
    ];
  }
}
