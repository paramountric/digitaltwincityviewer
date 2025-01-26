import KDBush from 'kdbush';
import { LayoutNode } from './layouts/LayoutNode.js';
import { Node } from './Node.js';

// Cluster takes nodes with existing x,y to determine which ones are visible at what zoom level
export class Cluster {
  clusters?: KDBush[] = []; // cluster by index from maxZoom + 1
  public minZoom = 0;
  public maxZoom = 16;
  public clusterRadius = 25;
  private minPoints = 2;
  constructor() {
    this.create([], this.clusterRadius);
  }
  // todo: a layoutnode must know its connected nodes -> edges must be aggregated
  // for each cluster node, collect all connected nodes
  // create an edgeMap with ids for which clusters are connected - clusterNodeId <-> clusterNodeId (both ways are needed)
  create(nodes: LayoutNode[], clusterRadius) {
    this.clusterRadius = clusterRadius;
    // for each zoom create a cluster
    let clusterNodes: Node[] = [];
    for (const node of nodes) {
      clusterNodes.push(
        new Node({
          id: node.id,
          x: Math.fround(node.x),
          y: Math.fround(node.y),
          zoom: Infinity,
          parentId: null,
        })
      );
    }
    // no cluster level
    const clusters = new Array(this.maxZoom + 1);
    clusters[this.maxZoom + 1] = new KDBush(
      clusterNodes,
      p => p.x,
      p => p.y
    );
    for (let z = this.maxZoom; z >= this.minZoom; z--) {
      clusterNodes = this.createClusterForZoomLevel(
        clusterNodes,
        z,
        clusters,
        clusterNodes.length
      );
      clusters[z] = new KDBush(
        clusterNodes,
        p => p.x,
        p => p.y
      );
    }
    this.clusters = clusters;
    return clusters;
  }

  createClusterForZoomLevel(
    clusterNodes,
    zoom,
    clusterWrapper,
    numAtomicsTotal: number
  ) {
    // note: instances are used for iterating each zoom level
    const clusteredClusterNodes = [];
    const radius = this.clusterRadius / 2 ** zoom; // this.extent * scale
    for (let i = 0; i < clusterNodes.length; i++) {
      const clusterNode = clusterNodes[i];
      if (clusterNode.zoom <= zoom) {
        continue;
      }
      clusterNode.zoom = zoom;
      const tree = clusterWrapper[zoom + 1];
      // get all point ids within radius
      const neighborIds = tree.within(clusterNode.x, clusterNode.y, radius);

      const numPointsInitially = clusterNode.numPoints || 1;
      let pointCount = numPointsInitially;

      for (const neighborId of neighborIds) {
        const point = tree.points[neighborId];
        if (point.zoom > zoom) {
          pointCount += point.numPoints || 1;
        }
      }

      // use to calculate statistics on cluster
      const clusterPoints = [clusterNode];

      // note that neighbors can be part of another cluster, so they should be skipped if the zoom is same (or smaller)

      // do we have a cluster?
      if (pointCount >= this.minPoints) {
        // let wx = clusterNode.x;
        // let wy = clusterNode.y;
        let wx = clusterNode.x * numPointsInitially;
        let wy = clusterNode.y * numPointsInitially;

        // encode both zoom and point index on which the cluster originated -- offset by total length of features
        const id = (i << 5) + (zoom + 1) + numAtomicsTotal;

        // let nameParts = cluster.name.split('--');
        // const nameStart = nameParts.length > 1 ? nameParts[0] : cluster.name;
        // let nameEnd = 'end';

        for (const neighborId of neighborIds) {
          const point = tree.points[neighborId];
          if (point.zoom <= zoom) {
            continue;
          }
          // nameParts = point.name.split('--');
          // if (!nameStart) {
          //   nameStart = nameParts.length > 1 ? nameParts[0] : name;
          // }
          // nameEnd = nameParts.length > 1 ? nameParts[1] : point.name;

          point.zoom = zoom; // save the zoom (so it doesn't get processed twice)

          const numPoints = point.numPoints || 1;
          // wx += point.x;
          // wy += point.y;
          wx += point.x * numPoints; // accumulate coordinates for calculating weighted center
          wy += point.y * numPoints;

          point.parentId = id;

          clusterPoints.push(point);
        }

        // a hack if nameEnd was not part of neighbor aggregation, the nameEnd is on the parent
        // if (nameEnd === 'end') {
        //   nameParts = cluster.name.split('--');
        //   nameEnd = nameParts.length > 1 ? nameParts[1] : 'end';
        // }

        clusterNode.parentId = id;
        clusteredClusterNodes.push({
          x: Math.fround(wx / pointCount),
          y: Math.fround(wy / pointCount),
          id,
          zoom: Infinity,
          //name: `${nameStart}--${nameEnd}`, //nameStart === nameEnd ? `Num: ${pointCount}` : `${nameStart}--${nameEnd}`,
          numPoints: pointCount,
        });
      } else {
        // leave points as unclustered
        clusteredClusterNodes.push(clusterNode);
        // include any neighbors not already added
        if (pointCount > 1) {
          for (const neighborId of neighborIds) {
            const point = tree.points[neighborId];
            if (point.zoom <= zoom) {
              continue;
            }
            point.zoom = zoom;
            clusteredClusterNodes.push(point);
          }
        }
      }
    }

    return clusteredClusterNodes;
  }

  // minX, minY, maxX, maxY
  getNodes(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    zoom = 0
  ): LayoutNode[] {
    const nodes: LayoutNode[] = [];
    const limitedZoom = Math.max(
      this.minZoom,
      Math.min(Math.ceil(zoom), this.maxZoom + 1)
    );
    const cluster = this.clusters[limitedZoom];
    if (!cluster) {
      return nodes;
    }
    const ids = cluster.range(minX, minY, maxX, maxY);
    for (const id of ids) {
      const c = cluster.points[id];
      c.zoom = zoom;
      nodes.push({
        id: c.id,
        x: c.x,
        y: c.y,
        fx: c.x,
        fy: c.y,
      });
    }
    return nodes;
  }

  getNode(nodeId: string, zoom?: number): LayoutNode | undefined {
    if (zoom || zoom === 0) {
      const limitedZoom = Math.max(
        this.minZoom,
        Math.min(Math.ceil(zoom), this.maxZoom + 1)
      );
      const cluster = this.clusters[limitedZoom];
      return cluster.points.find(p => p.id === nodeId);
    }
    for (const cluster of this.clusters) {
      const found = cluster.points.find(p => p.id === nodeId);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  getNodePosition(nodeId: string, zoom?: number) {
    const node = this.getNode(nodeId, zoom);
    return [node.x || 0, node.y || 0];
  }
}
