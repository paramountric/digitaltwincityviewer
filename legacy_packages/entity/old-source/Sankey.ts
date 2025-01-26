/* eslint-disable no-unused-expressions */
import { map, nest } from 'd3-collection';
import findCircuits from 'elementary-circuits-directed-graph';

export type SankeyNode = {
  id: string; // this is the group id that actually create the sankey node
  name?: string; // optional to use instead of id
  explorationNodeId?: string; // this is the node that is split into the sankey nodes depending on node settings
  count?: number; // how many entities is used for this node -> needed for the node name in viewer
  isViewer?: boolean; // render viewer for this node
  value?: number; // this value is the summed indicator value for the linkGroups as shown in the sankey chart
  numericPropertyIndex?: number; // for each node, which numeric property value on the atomic should be used (the atomic has a list of values for fast selection). This will default to -1 if undefined meaning value 1 for count of the node instead of using an indicator value
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
};

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

type Graph = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

// todo: refactor out the D3 functional style and sankey api from sankey, these functions can be simplified
function ascending(a, b) {
  return a == null || b == null
    ? NaN
    : a < b
    ? -1
    : a > b
    ? 1
    : a >= b
    ? 0
    : NaN;
}

function sum(values, valueof) {
  let sum = 0;
  if (valueof === undefined) {
    for (const value of values) {
      sum += Math.abs(value);
    }
  } else {
    let index = -1;
    for (const value of values) {
      sum += Math.abs(valueof(value, ++index, values));
    }
  }
  return sum;
}

function mean(values, valueof) {
  let count = 0;
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count, (sum += value);
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (
        (value = valueof(value, ++index, values)) != null &&
        (value = +value) >= value
      ) {
        ++count, (sum += value);
      }
    }
  }
  if (count) return sum / count;
}

function max(values, valueof) {
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (
        value != null &&
        (max < value || (max === undefined && value >= value))
      ) {
        max = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (
        (value = valueof(value, ++index, values)) != null &&
        (max < value || (max === undefined && value >= value))
      ) {
        max = value;
      }
    }
  }
  return max;
}

function min(values, valueof) {
  let min;
  if (valueof === undefined) {
    for (const value of values) {
      if (
        value != null &&
        (min > value || (min === undefined && value >= value))
      ) {
        min = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (
        (value = valueof(value, ++index, values)) != null &&
        (min > value || (min === undefined && value >= value))
      ) {
        min = value;
      }
    }
  }
  return min;
}

export const sankeySettings = {
  nodeWidth: 20, // todo: do the other way around -> set all nodes to squares, and then make the ones without viewers thin
  horizontalDistanceBetweenNodes: 285,
  height: 256,
};

export function getSankeyWidth(nodes) {
  const depth = Math.max(...nodes.map(n => n.column)) || 1;
  return depth * sankeySettings.horizontalDistanceBetweenNodes;
}

export function getSankeyHeight() {
  return sankeySettings.height;
}

// export type SankeySettings = {
//   horizontalDistanceBetweenNodes: number;
//   height: number;
//   nodeWidth: number;
// };

// For a given link, return the target node's depth
function targetDepth(d) {
  return d.target.depth;
}

// The depth of a node when the nodeAlign (align) is set to 'left'
function left(node) {
  return node.depth;
}

// The depth of a node when the nodeAlign (align) is set to 'right'
function right(node, n) {
  return n - 1 - node.height;
}

// The depth of a node when the nodeAlign (align) is set to 'justify'
function justify(node, n) {
  return node.sourceLinks.length ? node.depth : n - 1;
}

// The depth of a node when the nodeAlign (align) is set to 'center'
function center(node) {
  return node.targetLinks.length
    ? node.depth
    : node.sourceLinks.length
    ? min(node.sourceLinks, targetDepth) - 1
    : 0;
}

// returns a function, using the parameter given to the sankey setting
function constant(x) {
  return function () {
    return x;
  };
}

const _typeof =
  typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
    ? function (obj) {
        return typeof obj;
      }
    : function (obj) {
        return obj &&
          typeof Symbol === 'function' &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? 'symbol'
          : typeof obj;
      };

/// https://github.com/tomshanley/d3-sankeyCircular-circular

// sort links' breadth (ie top to bottom in a column), based on their source nodes' breadths
function ascendingSourceBreadth(a, b) {
  return ascendingBreadth(a.source, b.source) || a.index - b.index;
}

// sort links' breadth (ie top to bottom in a column), based on their target nodes' breadths
function ascendingTargetBreadth(a, b) {
  return ascendingBreadth(a.target, b.target) || a.index - b.index;
}

// sort nodes' breadth (ie top to bottom in a column)
// if both nodes have circular links, or both don't have circular links, then sort by the top (y0) of the node
// else push nodes that have top circular links to the top, and nodes that have bottom circular links to the bottom
function ascendingBreadth(a, b) {
  if (a.partOfCycle === b.partOfCycle) {
    return a.y0 - b.y0;
  } else {
    if (a.circularLinkType === 'top' || b.circularLinkType === 'bottom') {
      return -1;
    } else {
      return 1;
    }
  }
}

// return the value of a node or link
function value(d) {
  return d.value;
}

// return the vertical center of a node
function nodeCenter(node) {
  return (node.y0 + node.y1) / 2;
}

// return the vertical center of a link's source node
function linkSourceCenter(link) {
  return nodeCenter(link.source);
}

// return the vertical center of a link's target node
function linkTargetCenter(link) {
  return nodeCenter(link.target);
}

// Return the default value for ID for node, d.index
function defaultId(d) {
  return d.id; // ! changed
}

// Return the default object the graph's nodes, graph.nodes
function defaultNodes(graph) {
  return graph.nodes;
}

// Return the default object the graph's nodes, graph.links
function defaultLinks(graph) {
  return graph.links;
}

// Return the node from the collection that matches the provided ID, or throw an error if no match
function find(nodeById, id) {
  const node = nodeById.get(id);
  if (!node) throw new Error('missing: ' + id);
  return node;
}

function getNodeID(node, id) {
  return id(node);
}

// The main sankeyCircular functions

// Some constants for circular link calculations
const verticalMargin = 55;
const baseRadius = 20;
const scale = 0.2; //Possibly let user control this, although anything over 0.5 starts to get too cramped

// ! the width is calculated depending on number of actors!! (max of node.column after computeNodeDepths)
function sankeyCircular() {
  const { horizontalDistanceBetweenNodes, height, nodeWidth } = sankeySettings;
  let width = 0; // this is set below after computeNodeDepths
  // Set the default values
  let x0 = 0;
  let y0 = 0;
  let x1 = width;
  let y1 = height;
  const dx = nodeWidth; // node width
  let py = 10; // nodePadding, for vertical separation
  const id = defaultId;
  const align = right;
  const iterations = 32;
  const circularLinkGap = 10;
  const paddingRatio = 0;
  const sortNodes = null;

  function sankeyCircular(nodes: SankeyNode[], links: SankeyLink[]) {
    const graph: Graph = {
      nodes,
      links,

      // Process the graph's nodes and links, setting their positions

      // 1.  Associate the nodes with their respective links, and vice versa
    };

    computeNodeLinks(graph);

    // 2.  Determine which links result in a circular path in the graph
    identifyCircles(graph, id, sortNodes);

    // 4. Calculate the nodes' values, based on the values of the incoming and outgoing links
    computeNodeValues(graph);

    // 5.  Calculate the nodes' depth based on the incoming and outgoing links
    //     Sets the nodes':
    //     - depth:  the depth in the graph
    //     - column: the depth (0, 1, 2, etc), as is relates to visual position from left to right
    //     - x0, x1: the x coordinates, as is relates to visual position from left to right
    computeNodeDepths(graph);

    width = getSankeyWidth(nodes);
    x1 = width;

    // 3.  Determine how the circular links will be drawn,
    //     either travelling back above the main chart ("top")
    //     or below the main chart ("bottom")
    selectCircularLinkTypes(graph, id);

    // ! 3.1 reverse type
    // graph.links.forEach(function (link) {
    //   if (link.circularLinkType === 'bottom') {
    //     link.circularLinkType = 'top';
    //   } else if (link.circularLinkType === 'top') {
    //     link.circularLinkType = 'bottom';
    //   }
    // });
    // graph.nodes.forEach(function (node) {
    //   if (node.circularLinkType === 'bottom') {
    //     node.circularLinkType = 'top';
    //   } else if (node.circularLinkType === 'top') {
    //     node.circularLinkType = 'bottom';
    //   }
    // });

    // 6.  Calculate the nodes' and links' vertical position within their respective column
    //     Also readjusts sankeyCircular size if circular links are needed, and node x's
    computeNodeBreadths(graph, iterations, id);
    computeLinkBreadths(graph);

    // 7.  Sort links per node, based on the links' source/target nodes' breadths
    // 8.  Adjust nodes that overlap links that span 2+ columns
    const linkSortingIterations = 4; //Possibly let user control this number, like the iterations over node placement
    for (let iteration = 0; iteration < linkSortingIterations; iteration++) {
      sortSourceLinks(graph, y1, id);
      sortTargetLinks(graph, y1, id);
      resolveNodeLinkOverlaps(graph, y0, y1, id);
      sortSourceLinks(graph, y1, id);
      sortTargetLinks(graph, y1, id);
    }

    // 8.1  Adjust node and link positions back to fill height of chart area if compressed
    fillHeight(graph, y0, y1);

    // ! 8.2 change to y up direction
    // graph.links.forEach(function (link) {
    //   link.y0 = y1 - link.y0;
    //   link.y1 = y1 - link.y1;
    // });
    // graph.nodes.forEach(function (node) {
    //   node.y0 = y1 - node.y0;
    //   node.y1 = y1 - node.y1;
    // });

    // 9. Calculate visually appealling path for the circular paths, and create the "d" string
    addCircularPathData(graph, circularLinkGap, y1, id);

    // ! custom functions to generate attribute data
    addAttributeData(graph, width, height);

    // ! custom function to add headers
    addHeaders(graph, width, height);

    return graph;
  } // end of sankeyCircular function

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks(graph) {
    graph.nodes.forEach(function (node, i) {
      node.index = i;
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    const nodeById = map(graph.nodes, id);
    graph.links.forEach(function (link, i) {
      link.index = i;
      let source = link.source;
      let target = link.target;
      if (
        (typeof source === 'undefined' ? 'undefined' : _typeof(source)) !==
        'object'
      ) {
        source = link.source = find(nodeById, source);
      }
      if (
        (typeof target === 'undefined' ? 'undefined' : _typeof(target)) !==
        'object'
      ) {
        target = link.target = find(nodeById, target);
      }
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
    return graph;
  }

  // Compute the value (size) and cycleness of each node by summing the associated links.
  function computeNodeValues(graph) {
    graph.nodes.forEach(function (node) {
      node.partOfCycle = false;
      node.entityValue = node.value;
      node.value = Math.max(
        sum(node.sourceLinks, value),
        sum(node.targetLinks, value)
      );
      // ! Fix to show placeholder links (value = 0)
      // ! note that isPlaceholder can be explicity false
      if (!node.value && node.isPlaceholder !== false) {
        node.isPlaceholder = true;
      }
      node.sourceLinks.forEach(function (link) {
        if (link.circular) {
          node.partOfCycle = true;
          node.circularLinkType = link.circularLinkType;
        }
      });
      node.targetLinks.forEach(function (link) {
        if (link.circular) {
          node.partOfCycle = true;
          node.circularLinkType = link.circularLinkType;
        }
      });
    });
    graph.nodes.forEach(node => {
      if (node.isPlaceholder) {
        node.sourceLinks.forEach(link => {
          if (link.isPlaceholder) {
            link.value = 1;
          }
        });
        node.targetLinks.forEach(link => {
          if (link.isPlaceholder) {
            link.value = 1;
          }
        });
        // then add node value from paths
        node.value = Math.max(
          sum(node.sourceLinks, value),
          sum(node.targetLinks, value)
        );
      } else if (!node.value && node.entityValue) {
        node.value = node.entityValue;
      }
    });
  }

  function getCircleMargins(graph) {
    let totalTopLinksWidth = 0;
    let totalBottomLinksWidth = 0;
    let totalRightLinksWidth = 0;
    let totalLeftLinksWidth = 0;

    const maxColumn = max(graph.nodes, function (node) {
      return node.column;
    });

    graph.links.forEach(function (link) {
      if (link.circular) {
        if (link.circularLinkType === 'top') {
          totalTopLinksWidth = totalTopLinksWidth + link.width;
        } else {
          totalBottomLinksWidth = totalBottomLinksWidth + link.width;
        }

        if (link.target.column === 0) {
          totalLeftLinksWidth = totalLeftLinksWidth + link.width;
        }

        if (link.source.column === maxColumn) {
          totalRightLinksWidth = totalRightLinksWidth + link.width;
        }
      }
    });

    //account for radius of curves and padding between links
    totalTopLinksWidth =
      totalTopLinksWidth > 0
        ? totalTopLinksWidth + verticalMargin + baseRadius
        : totalTopLinksWidth;
    totalBottomLinksWidth =
      totalBottomLinksWidth > 0
        ? totalBottomLinksWidth + verticalMargin + baseRadius
        : totalBottomLinksWidth;
    totalRightLinksWidth =
      totalRightLinksWidth > 0
        ? totalRightLinksWidth + verticalMargin + baseRadius
        : totalRightLinksWidth;
    totalLeftLinksWidth =
      totalLeftLinksWidth > 0
        ? totalLeftLinksWidth + verticalMargin + baseRadius
        : totalLeftLinksWidth;

    return {
      top: totalTopLinksWidth,
      bottom: totalBottomLinksWidth,
      left: totalLeftLinksWidth,
      right: totalRightLinksWidth,
    };
  }

  // Update the x0, y0, x1 and y1 for the sankeyCircular, to allow space for any circular links
  function scaleSankeySize(graph, margin) {
    const maxColumn = max(graph.nodes, function (node) {
      return node.column;
    });

    const currentWidth = x1 - x0;
    const currentHeight = y1 - y0;

    const newWidth = currentWidth + margin.right + margin.left;
    const newHeight = currentHeight + margin.top + margin.bottom;

    const scaleX = currentWidth / newWidth;
    const scaleY = currentHeight / newHeight;

    x0 = x0 * scaleX + margin.left;
    x1 = margin.right === 0 ? x1 : x1 * scaleX;
    y0 = y0 * scaleY + margin.top;
    y1 = y1 * scaleY;

    graph.nodes.forEach(function (node) {
      node.x0 = x0 + node.column * ((x1 - x0 - dx) / maxColumn);
      node.x1 = node.x0 + dx;
    });

    return scaleY;
  }

  // Iteratively assign the depth for each node.
  // Nodes are assigned the maximum depth of incoming neighbors plus one;
  // nodes with no incoming links are assigned depth zero, while
  // nodes with no outgoing links are assigned the maximum depth.
  function computeNodeDepths(graph) {
    let nodes;
    let next;
    let x;

    for (
      nodes = graph.nodes, next = [], x = 0;
      nodes.length;
      ++x, nodes = next, next = []
    ) {
      nodes.forEach(function (node) {
        node.depth = x;
        node.sourceLinks.forEach(function (link) {
          if (next.indexOf(link.target) < 0 && !link.circular) {
            next.push(link.target);
          }
        });
      });
    }

    for (
      nodes = graph.nodes, next = [], x = 0;
      nodes.length;
      ++x, nodes = next, next = []
    ) {
      nodes.forEach(function (node) {
        node.height = x;
        node.targetLinks.forEach(function (link) {
          if (next.indexOf(link.source) < 0 && !link.circular) {
            next.push(link.source);
          }
        });
      });
    }

    // assign column numbers, and get max value
    graph.nodes.forEach(function (node) {
      node.column = Math.floor(align.call(null, node, x));
    });
  }

  // Assign nodes' breadths, and then shift nodes that overlap (resolveCollisions)
  function computeNodeBreadths(graph, iterations, id) {
    const columns = nest()
      .key(function (d) {
        return d.column;
      })
      .sortKeys(ascending)
      .entries(graph.nodes)
      .map(function (d) {
        return d.values;
      });

    initializeNodeBreadth(id);
    resolveCollisions();

    for (let alpha = 1, n = iterations; n > 0; --n) {
      relaxLeftAndRight((alpha *= 0.99), id);
      resolveCollisions();
    }

    function initializeNodeBreadth(id) {
      //override py if nodePadding has been set
      if (paddingRatio) {
        let padding = Infinity;
        columns.forEach(function (nodes) {
          const thisPadding = (y1 * paddingRatio) / (nodes.length + 1);
          padding = thisPadding < padding ? thisPadding : padding;
        });
        py = padding;
      }

      let ky = min(columns, function (nodes) {
        return (y1 - y0 - (nodes.length - 1) * py) / sum(nodes, value);
      });

      //calculate the widths of the links
      ky = ky * scale;

      graph.links.forEach(function (link) {
        link.width = link.value * ky;
      });

      //determine how much to scale down the chart, based on circular links
      const margin = getCircleMargins(graph);
      const ratio = scaleSankeySize(graph, margin);

      //re-calculate widths
      ky = ky * ratio;

      graph.links.forEach(function (link) {
        link.width = link.value * ky;
      });

      columns.forEach(function (nodes) {
        const nodesLength = nodes.length;
        nodes.forEach(function (node, i) {
          if (node.depth === columns.length - 1 && nodesLength === 1) {
            node.y0 = y1 / 2 - node.value * ky;
            node.y1 = node.y0 + node.value * ky;
          } else if (node.depth === 0 && nodesLength === 1) {
            node.y0 = y1 / 2 - node.value * ky;
            node.y1 = node.y0 + node.value * ky;
          } else if (node.partOfCycle) {
            if (numberOfNonSelfLinkingCycles(node, id) === 0) {
              node.y0 = y1 / 2 + i;
              node.y1 = node.y0 + node.value * ky;
            } else if (node.circularLinkType === 'top') {
              node.y0 = y0 + i;
              node.y1 = node.y0 + node.value * ky;
            } else {
              node.y0 = y1 - node.value * ky - i;
              node.y1 = node.y0 + node.value * ky;
            }
          } else {
            if (margin.top === 0 || margin.bottom === 0) {
              node.y0 = ((y1 - y0) / nodesLength) * i;
              node.y1 = node.y0 + node.value * ky;
            } else {
              node.y0 = (y1 - y0) / 2 - nodesLength / 2 + i;
              node.y1 = node.y0 + node.value * ky;
            }
          }
        });
      });
    }

    // For each node in each column, check the node's vertical position in relation to its targets and sources vertical position
    // and shift up/down to be closer to the vertical middle of those targets and sources
    function relaxLeftAndRight(alpha, id) {
      const columnsLength = columns.length;

      columns.forEach(function (nodes) {
        const n = nodes.length;
        const depth = nodes[0].depth;

        nodes.forEach(function (node) {
          // check the node is not an orphan
          let nodeHeight;
          if (node.sourceLinks.length || node.targetLinks.length) {
            // todo: check this code in the original code, it was a bit strange
            if (
              node.partOfCycle &&
              numberOfNonSelfLinkingCycles(node, id) > 0
            ) {
              return;
            } else if (depth === 0 && n === 1) {
              nodeHeight = node.y1 - node.y0;

              node.y0 = y1 / 2 - nodeHeight / 2;
              node.y1 = y1 / 2 + nodeHeight / 2;
            } else if (depth === columnsLength - 1 && n === 1) {
              nodeHeight = node.y1 - node.y0;

              node.y0 = y1 / 2 - nodeHeight / 2;
              node.y1 = y1 / 2 + nodeHeight / 2;
            } else {
              let avg = 0;

              const avgTargetY = mean(node.sourceLinks, linkTargetCenter);
              const avgSourceY = mean(node.targetLinks, linkSourceCenter);

              if (avgTargetY && avgSourceY) {
                avg = (avgTargetY + avgSourceY) / 2;
              } else {
                avg = avgTargetY || avgSourceY;
              }

              const dy = (avg - nodeCenter(node)) * alpha;
              // positive if it node needs to move down
              node.y0 += dy;
              node.y1 += dy;
            }
          }
        });
      });
    }

    // For each column, check if nodes are overlapping, and if so, shift up/down
    function resolveCollisions() {
      columns.forEach(function (nodes) {
        let node;
        let dy;
        let y = y0;
        const n = nodes.length;
        let i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingBreadth);

        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y - node.y0;

          if (dy > 0) {
            node.y0 += dy;
            node.y1 += dy;
          }
          y = node.y1 + py;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y - py - y1;
        if (dy > 0) {
          (y = node.y0 -= dy), (node.y1 -= dy);

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y1 + py - y;
            if (dy > 0) (node.y0 -= dy), (node.y1 -= dy);
            y = node.y0;
          }
        }
      });
    }
  }

  // Assign the links y0 and y1 based on source/target nodes position,
  // plus the link's relative position to other links to the same node
  function computeLinkBreadths(graph) {
    graph.nodes.forEach(function (node) {
      node.sourceLinks.sort(ascendingTargetBreadth);
      node.targetLinks.sort(ascendingSourceBreadth);
    });
    graph.nodes.forEach(function (node) {
      let y0 = node.y0;
      let y1 = y0;

      // start from the bottom of the node for cycle links
      let y0cycle = node.y1;
      let y1cycle = y0cycle;

      node.sourceLinks.forEach(function (link) {
        if (link.circular) {
          link.y0 = y0cycle - link.width / 2;
          y0cycle = y0cycle - link.width;
        } else {
          link.y0 = y0 + link.width / 2;
          y0 += link.width;
        }
      });
      node.targetLinks.forEach(function (link) {
        if (link.circular) {
          link.y1 = y1cycle - link.width / 2;
          y1cycle = y1cycle - link.width;
        } else {
          link.y1 = y1 + link.width / 2;
          y1 += link.width;
        }
      });
    });
  }

  return sankeyCircular;
}

/// /////////////////////////////////////////////////////////////////////////////////
// Cycle functions
// portion of code to detect circular links based on Colin Fergus' bl.ock https://gist.github.com/cfergus/3956043

// Identify circles in the link objects
function identifyCircles(graph, id, sortNodes) {
  let circularLinkID = 0;
  if (sortNodes === null) {
    // Building adjacency graph
    const adjList = [];
    for (let i = 0; i < graph.links.length; i++) {
      const link = graph.links[i];
      const source = link.source.index;
      const target = link.target.index;
      if (!adjList[source]) adjList[source] = [];
      if (!adjList[target]) adjList[target] = [];

      // Add links if not already in set
      if (adjList[source].indexOf(target) === -1) adjList[source].push(target);
    }

    // Find all elementary circuits
    const cycles = findCircuits(adjList);

    // Sort by circuits length
    cycles.sort(function (a, b) {
      return a.length - b.length;
    });

    const circularLinks = {};
    for (let i = 0; i < cycles.length; i++) {
      const cycle = cycles[i];
      const last = cycle.slice(-2);
      if (!circularLinks[last[0]]) circularLinks[last[0]] = {};
      circularLinks[last[0]][last[1]] = true;
    }

    graph.links.forEach(function (link) {
      const target = link.target.index;
      const source = link.source.index;
      // If self-linking or a back-edge
      if (
        target === source ||
        (circularLinks[source] && circularLinks[source][target])
      ) {
        link.circular = true;
        link.circularLinkID = circularLinkID;
        circularLinkID = circularLinkID + 1;
      } else {
        link.circular = false;
      }
    });
  } else {
    graph.links.forEach(function (link) {
      if (link.source[sortNodes] < link.target[sortNodes]) {
        link.circular = false;
      } else {
        link.circular = true;
        link.circularLinkID = circularLinkID;
        circularLinkID = circularLinkID + 1;
      }
    });
  }
}

// Assign a circular link type (top or bottom), based on:
// - if the source/target node already has circular links, then use the same type
// - if not, choose the type with fewer links
function selectCircularLinkTypes(graph, id) {
  let numberOfTops = 0;
  let numberOfBottoms = 0;
  graph.links.forEach(function (link) {
    if (link.circular) {
      // if either souce or target has type already use that
      if (link.source.circularLinkType || link.target.circularLinkType) {
        // default to source type if available
        link.circularLinkType = link.source.circularLinkType
          ? link.source.circularLinkType
          : link.target.circularLinkType;
      } else {
        link.circularLinkType =
          numberOfTops < numberOfBottoms ? 'top' : 'bottom';
      }

      if (link.circularLinkType === 'top') {
        numberOfTops = numberOfTops + 1;
      } else {
        numberOfBottoms = numberOfBottoms + 1;
      }

      graph.nodes.forEach(function (node) {
        if (
          getNodeID(node, id) === getNodeID(link.source, id) ||
          getNodeID(node, id) === getNodeID(link.target, id)
        ) {
          node.circularLinkType = link.circularLinkType;
        }
      });
    }
  });

  //correct self-linking links to be same direction as node
  graph.links.forEach(function (link) {
    if (link.circular) {
      //if both source and target node are same type, then link should have same type
      if (link.source.circularLinkType === link.target.circularLinkType) {
        link.circularLinkType = link.source.circularLinkType;
      }
      //if link is selflinking, then link should have same type as node
      if (selfLinking(link, id)) {
        link.circularLinkType = link.source.circularLinkType;
      }
    }
  });
}

// Return the angle between a straight line between the source and target of the link, and the vertical plane of the node
function linkAngle(link) {
  const adjacent = Math.abs(link.y1 - link.y0);
  const opposite = Math.abs(link.target.x0 - link.source.x1);

  return Math.atan(opposite / adjacent);
}

// Check if two circular links potentially overlap
function circularLinksCross(link1, link2) {
  if (link1.source.column < link2.target.column) {
    return false;
  } else if (link1.target.column > link2.source.column) {
    return false;
  } else {
    return true;
  }
}

// Return the number of circular links for node, not including self linking links
function numberOfNonSelfLinkingCycles(node, id) {
  let sourceCount = 0;
  node.sourceLinks.forEach(function (l) {
    sourceCount =
      l.circular && !selfLinking(l, id) ? sourceCount + 1 : sourceCount;
  });

  let targetCount = 0;
  node.targetLinks.forEach(function (l) {
    targetCount =
      l.circular && !selfLinking(l, id) ? targetCount + 1 : targetCount;
  });

  return sourceCount + targetCount;
}

// Check if a circular link is the only circular link for both its source and target node
function onlyCircularLink(link) {
  const nodeSourceLinks = link.source.sourceLinks;
  let sourceCount = 0;
  nodeSourceLinks.forEach(function (l) {
    sourceCount = l.circular ? sourceCount + 1 : sourceCount;
  });

  const nodeTargetLinks = link.target.targetLinks;
  let targetCount = 0;
  nodeTargetLinks.forEach(function (l) {
    targetCount = l.circular ? targetCount + 1 : targetCount;
  });

  if (sourceCount > 1 || targetCount > 1) {
    return false;
  } else {
    return true;
  }
}

// creates vertical buffer values per set of top/bottom links
function calcVerticalBuffer(links, circularLinkGap, id) {
  links.sort(sortLinkColumnAscending);
  links.forEach(function (link, i) {
    let buffer = 0;

    if (selfLinking(link, id) && onlyCircularLink(link)) {
      link.circularPathData.verticalBuffer = buffer + link.width / 2;
    } else {
      let j = 0;
      for (j; j < i; j++) {
        if (circularLinksCross(links[i], links[j])) {
          const bufferOverThisLink =
            links[j].circularPathData.verticalBuffer +
            links[j].width / 2 +
            circularLinkGap;
          buffer = bufferOverThisLink > buffer ? bufferOverThisLink : buffer;
        }
      }

      link.circularPathData.verticalBuffer = buffer + link.width / 2;
    }
  });

  return links;
}

// calculate the optimum path for a link to reduce overlaps
function addCircularPathData(graph, circularLinkGap, y1, id) {
  // let baseRadius = 15; // this is given by constants in the global scope
  const buffer = 5; // default is 5
  // let verticalMargin = 35;// this is given by constants in the global scope

  const minY = min(graph.links, function (link) {
    return link.source.y0;
  });

  // create object for circular Path Data
  graph.links.forEach(function (link) {
    if (link.circular) {
      link.circularPathData = {};
    }
  });

  // calc vertical offsets per top/bottom links
  const topLinks = graph.links.filter(function (l) {
    return l.circularLinkType === 'top';
  });
  /* topLinks = */ calcVerticalBuffer(topLinks, circularLinkGap, id);

  const bottomLinks = graph.links.filter(function (l) {
    return l.circularLinkType === 'bottom';
  });
  /* bottomLinks = */ calcVerticalBuffer(bottomLinks, circularLinkGap, id);

  // add the base data for each link
  graph.links.forEach(function (link) {
    if (link.circular) {
      link.circularPathData.arcRadius = link.width + baseRadius;
      link.circularPathData.leftNodeBuffer = buffer;
      link.circularPathData.rightNodeBuffer = buffer;
      link.circularPathData.sourceWidth = link.source.x1 - link.source.x0;
      link.circularPathData.sourceX =
        link.source.x0 + link.circularPathData.sourceWidth;
      link.circularPathData.targetX = link.target.x0;
      link.circularPathData.sourceY = link.y0;
      link.circularPathData.targetY = link.y1;

      // for self linking paths, and that the only circular link in/out of that node
      if (selfLinking(link, id) && onlyCircularLink(link)) {
        link.circularPathData.leftSmallArcRadius = baseRadius + link.width / 2;
        link.circularPathData.leftLargeArcRadius = baseRadius + link.width / 2;
        link.circularPathData.rightSmallArcRadius = baseRadius + link.width / 2;
        link.circularPathData.rightLargeArcRadius = baseRadius + link.width / 2;

        if (link.circularLinkType === 'bottom') {
          link.circularPathData.verticalFullExtent =
            link.source.y1 +
            verticalMargin +
            link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent -
            link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent -
            link.circularPathData.rightLargeArcRadius;
        } else {
          // top links
          link.circularPathData.verticalFullExtent =
            link.source.y0 -
            verticalMargin -
            link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent +
            link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent +
            link.circularPathData.rightLargeArcRadius;
        }
      } else {
        // else calculate normally
        // add left extent coordinates, based on links with same source column and circularLink type
        let thisColumn = link.source.column;
        const thisCircularLinkType = link.circularLinkType;
        let sameColumnLinks = graph.links.filter(function (l) {
          return (
            l.source.column === thisColumn &&
            l.circularLinkType === thisCircularLinkType
          );
        });

        if (link.circularLinkType === 'bottom') {
          sameColumnLinks.sort(sortLinkSourceYDescending);
        } else {
          sameColumnLinks.sort(sortLinkSourceYAscending);
        }

        let radiusOffset = 0;
        sameColumnLinks.forEach(function (l, i) {
          if (l.circularLinkID === link.circularLinkID) {
            link.circularPathData.leftSmallArcRadius =
              baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.leftLargeArcRadius =
              baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        // add right extent coordinates, based on links with same target column and circularLink type
        thisColumn = link.target.column;
        sameColumnLinks = graph.links.filter(function (l) {
          return (
            l.target.column === thisColumn &&
            l.circularLinkType === thisCircularLinkType
          );
        });
        if (link.circularLinkType === 'bottom') {
          sameColumnLinks.sort(sortLinkTargetYDescending);
        } else {
          sameColumnLinks.sort(sortLinkTargetYAscending);
        }

        radiusOffset = 0;
        sameColumnLinks.forEach(function (l, i) {
          if (l.circularLinkID === link.circularLinkID) {
            link.circularPathData.rightSmallArcRadius =
              baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.rightLargeArcRadius =
              baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        // bottom links
        if (link.circularLinkType === 'bottom') {
          link.circularPathData.verticalFullExtent =
            Math.max(y1, link.source.y1, link.target.y1) +
            verticalMargin +
            link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent -
            link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent -
            link.circularPathData.rightLargeArcRadius;
        } else {
          // top links
          link.circularPathData.verticalFullExtent =
            minY - verticalMargin - link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent +
            link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent +
            link.circularPathData.rightLargeArcRadius;
        }
      }

      // all links
      link.circularPathData.leftInnerExtent =
        link.circularPathData.sourceX + link.circularPathData.leftNodeBuffer;
      link.circularPathData.rightInnerExtent =
        link.circularPathData.targetX - link.circularPathData.rightNodeBuffer;
      link.circularPathData.leftFullExtent =
        link.circularPathData.sourceX +
        link.circularPathData.leftLargeArcRadius +
        link.circularPathData.leftNodeBuffer;
      link.circularPathData.rightFullExtent =
        link.circularPathData.targetX -
        link.circularPathData.rightLargeArcRadius -
        link.circularPathData.rightNodeBuffer;
    }
  });
}

// sort links based on the distance between the source and tartget node columns
// if the same, then use Y position of the source node
function sortLinkColumnAscending(link1, link2) {
  if (linkColumnDistance(link1) === linkColumnDistance(link2)) {
    return link1.circularLinkType === 'bottom'
      ? sortLinkSourceYDescending(link1, link2)
      : sortLinkSourceYAscending(link1, link2);
  } else {
    return linkColumnDistance(link2) - linkColumnDistance(link1);
  }
}

// sort ascending links by their source vertical position, y0
function sortLinkSourceYAscending(link1, link2) {
  return link1.y0 - link2.y0;
}

// sort descending links by their source vertical position, y0
function sortLinkSourceYDescending(link1, link2) {
  return link2.y0 - link1.y0;
}

// sort ascending links by their target vertical position, y1
function sortLinkTargetYAscending(link1, link2) {
  return link1.y1 - link2.y1;
}

// sort descending links by their target vertical position, y1
function sortLinkTargetYDescending(link1, link2) {
  return link2.y1 - link1.y1;
}

// return the distance between the link's target and source node, in terms of the nodes' column
function linkColumnDistance(link) {
  return link.target.column - link.source.column;
}

// return the distance between the link's target and source node, in terms of the nodes' X coordinate
function linkXLength(link) {
  return link.target.x0 - link.source.x1;
}

// Return the Y coordinate on the longerLink path * which is perpendicular shorterLink's source.
// * approx, based on a straight line from target to source, when in fact the path is a bezier
function linkPerpendicularYToLinkSource(longerLink, shorterLink) {
  // get the angle for the longer link
  const angle = linkAngle(longerLink);

  // get the adjacent length to the other link's x position
  const heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

  // add or subtract from longer link1's original y1, depending on the slope
  const yPerpendicular =
    incline(longerLink) === 'up'
      ? longerLink.y1 + heightFromY1ToPependicular
      : longerLink.y1 - heightFromY1ToPependicular;

  return yPerpendicular;
}

// Return the Y coordinate on the longerLink path * which is perpendicular shorterLink's source.
// * approx, based on a straight line from target to source, when in fact the path is a bezier
function linkPerpendicularYToLinkTarget(longerLink, shorterLink) {
  // get the angle for the longer link
  const angle = linkAngle(longerLink);

  // get the adjacent length to the other link's x position
  const heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

  // add or subtract from longer link's original y1, depending on the slope
  const yPerpendicular =
    incline(longerLink) === 'up'
      ? longerLink.y1 - heightFromY1ToPependicular
      : longerLink.y1 + heightFromY1ToPependicular;

  return yPerpendicular;
}

// Move any nodes that overlap links which span 2+ columns
function resolveNodeLinkOverlaps(graph, y0, y1, id) {
  graph.links.forEach(function (link) {
    if (link.circular) {
      return;
    }

    if (link.target.column - link.source.column > 1) {
      let columnToTest = link.source.column + 1;
      const maxColumnToTest = link.target.column - 1;

      let i = 1;
      const numberOfColumnsToTest = maxColumnToTest - columnToTest + 1;

      for (i = 1; columnToTest <= maxColumnToTest; columnToTest++, i++) {
        graph.nodes.forEach(function (node) {
          if (node.column === columnToTest) {
            const t = i / (numberOfColumnsToTest + 1);

            // Find all the points of a cubic bezier curve in javascript
            // https://stackoverflow.com/questions/15397596/find-all-the-points-of-a-cubic-bezier-curve-in-javascript

            const B0_t = Math.pow(1 - t, 3);
            const B1_t = 3 * t * Math.pow(1 - t, 2);
            const B2_t = 3 * Math.pow(t, 2) * (1 - t);
            const B3_t = Math.pow(t, 3);

            const py_t =
              B0_t * link.y0 + B1_t * link.y0 + B2_t * link.y1 + B3_t * link.y1;

            const linkY0AtColumn = py_t - link.width / 2;
            const linkY1AtColumn = py_t + link.width / 2;
            let dy;

            // If top of link overlaps node, push node up
            if (linkY0AtColumn > node.y0 && linkY0AtColumn < node.y1) {
              dy = node.y1 - linkY0AtColumn + 10;
              dy = node.circularLinkType === 'bottom' ? dy : -dy;

              node = adjustNodeHeight(node, dy, y0, y1);

              // check if other nodes need to move up too
              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (
                  getNodeID(otherNode, id) === getNodeID(node, id) ||
                  otherNode.column != node.column
                ) {
                  return;
                }
                if (nodesOverlap(node, otherNode)) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            } else if (linkY1AtColumn > node.y0 && linkY1AtColumn < node.y1) {
              // If bottom of link overlaps node, push node down
              dy = linkY1AtColumn - node.y0 + 10;

              node = adjustNodeHeight(node, dy, y0, y1);

              // check if other nodes need to move down too
              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (
                  getNodeID(otherNode, id) === getNodeID(node, id) ||
                  otherNode.column != node.column
                ) {
                  return;
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            } else if (linkY0AtColumn < node.y0 && linkY1AtColumn > node.y1) {
              // if link completely overlaps node
              dy = linkY1AtColumn - node.y0 + 10;

              node = adjustNodeHeight(node, dy, y0, y1);

              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (
                  getNodeID(otherNode, id) === getNodeID(node, id) ||
                  otherNode.column != node.column
                ) {
                  return;
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            }
          }
        });
      }
    }
  });
}

// check if two nodes overlap
function nodesOverlap(nodeA, nodeB) {
  // test if nodeA top partially overlaps nodeB
  if (nodeA.y0 > nodeB.y0 && nodeA.y0 < nodeB.y1) {
    return true;
  } else if (nodeA.y1 > nodeB.y0 && nodeA.y1 < nodeB.y1) {
    // test if nodeA bottom partially overlaps nodeB
    return true;
  } else if (nodeA.y0 < nodeB.y0 && nodeA.y1 > nodeB.y1) {
    // test if nodeA covers nodeB
    return true;
  } else {
    return false;
  }
}

// update a node, and its associated links, vertical positions (y0, y1)
function adjustNodeHeight(node, dy, sankeyY0, sankeyY1) {
  if (node.y0 + dy >= sankeyY0 && node.y1 + dy <= sankeyY1) {
    node.y0 = node.y0 + dy;
    node.y1 = node.y1 + dy;

    node.targetLinks.forEach(function (l) {
      l.y1 = l.y1 + dy;
    });

    node.sourceLinks.forEach(function (l) {
      l.y0 = l.y0 + dy;
    });
  }
  return node;
}

// sort and set the links' y0 for each node
function sortSourceLinks(graph, y1, id, moveNodes?) {
  graph.nodes.forEach(function (node) {
    // move any nodes up which are off the bottom
    if (moveNodes && node.y + (node.y1 - node.y0) > y1) {
      node.y = node.y - (node.y + (node.y1 - node.y0) - y1);
    }

    const nodesSourceLinks = graph.links.filter(function (l) {
      return getNodeID(l.source, id) === getNodeID(node, id);
    });

    const nodeSourceLinksLength = nodesSourceLinks.length;

    // if more than 1 link then sort
    if (nodeSourceLinksLength > 1) {
      nodesSourceLinks.sort(function (link1, link2) {
        // if both are not circular...
        if (!link1.circular && !link2.circular) {
          // if the target nodes are the same column, then sort by the link's target y
          if (link1.target.column === link2.target.column) {
            return link1.y1 - link2.y1;
          } else if (!sameInclines(link1, link2)) {
            // if the links slope in different directions, then sort by the link's target y
            return link1.y1 - link2.y1;

            // if the links slope in same directions, then sort by any overlap
          } else {
            if (link1.target.column > link2.target.column) {
              const link2Adj = linkPerpendicularYToLinkTarget(link2, link1);
              return link1.y1 - link2Adj;
            }
            if (link2.target.column > link1.target.column) {
              const link1Adj = linkPerpendicularYToLinkTarget(link1, link2);
              return link1Adj - link2.y1;
            }
          }
        }

        // if only one is circular, the move top links up, or bottom links down
        if (link1.circular && !link2.circular) {
          return link1.circularLinkType === 'top' ? -1 : 1;
        } else if (link2.circular && !link1.circular) {
          return link2.circularLinkType === 'top' ? 1 : -1;
        }

        // if both links are circular...
        if (link1.circular && link2.circular) {
          // ...and they both loop the same way (both top)
          if (
            link1.circularLinkType === link2.circularLinkType &&
            link1.circularLinkType === 'top'
          ) {
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link1.target.y1 - link2.target.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.target.column - link1.target.column;
            }
          } else if (
            link1.circularLinkType === link2.circularLinkType &&
            link1.circularLinkType === 'bottom'
          ) {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link2.target.y1 - link1.target.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.target.column - link2.target.column;
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType === 'top' ? -1 : 1;
          }
        }
      });
    }

    // update y0 for links
    let ySourceOffset = node.y0;

    nodesSourceLinks.forEach(function (link) {
      link.y0 = ySourceOffset + link.width / 2;
      ySourceOffset = ySourceOffset + link.width;
    });

    // correct any circular bottom links so they are at the bottom of the node
    nodesSourceLinks.forEach(function (link, i) {
      if (link.circularLinkType === 'bottom') {
        let j = i + 1;
        let offsetFromBottom = 0;
        // sum the widths of any links that are below this link
        for (j; j < nodeSourceLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesSourceLinks[j].width;
        }
        link.y0 = node.y1 - offsetFromBottom - link.width / 2;
      }
    });
  });
}

// sort and set the links' y1 for each node
function sortTargetLinks(graph, y1, id) {
  graph.nodes.forEach(function (node) {
    const nodesTargetLinks = graph.links.filter(function (l) {
      return getNodeID(l.target, id) === getNodeID(node, id);
    });

    const nodesTargetLinksLength = nodesTargetLinks.length;

    if (nodesTargetLinksLength > 1) {
      nodesTargetLinks.sort(function (link1, link2) {
        // if both are not circular, the base on the source y position
        if (!link1.circular && !link2.circular) {
          if (link1.source.column === link2.source.column) {
            return link1.y0 - link2.y0;
          } else if (!sameInclines(link1, link2)) {
            return link1.y0 - link2.y0;
          } else {
            // get the angle of the link to the further source node (ie the smaller column)
            if (link2.source.column < link1.source.column) {
              const link2Adj = linkPerpendicularYToLinkSource(link2, link1);

              return link1.y0 - link2Adj;
            }
            if (link1.source.column < link2.source.column) {
              const link1Adj = linkPerpendicularYToLinkSource(link1, link2);

              return link1Adj - link2.y0;
            }
          }
        }

        // if only one is circular, the move top links up, or bottom links down
        if (link1.circular && !link2.circular) {
          return link1.circularLinkType === 'top' ? -1 : 1;
        } else if (link2.circular && !link1.circular) {
          return link2.circularLinkType === 'top' ? 1 : -1;
        }

        // if both links are circular...
        if (link1.circular && link2.circular) {
          // ...and they both loop the same way (both top)
          if (
            link1.circularLinkType === link2.circularLinkType &&
            link1.circularLinkType === 'top'
          ) {
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.source.column - link2.source.column;
            }
          } else if (
            link1.circularLinkType === link2.circularLinkType &&
            link1.circularLinkType === 'bottom'
          ) {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.source.column - link1.source.column;
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType === 'top' ? -1 : 1;
          }
        }
      });
    }

    // update y1 for links
    let yTargetOffset = node.y0;

    nodesTargetLinks.forEach(function (link) {
      link.y1 = yTargetOffset + link.width / 2;
      yTargetOffset = yTargetOffset + link.width;
    });

    // correct any circular bottom links so they are at the bottom of the node
    nodesTargetLinks.forEach(function (link, i) {
      if (link.circularLinkType === 'bottom') {
        let j = i + 1;
        let offsetFromBottom = 0;
        // sum the widths of any links that are below this link
        for (j; j < nodesTargetLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesTargetLinks[j].width;
        }
        link.y1 = node.y1 - offsetFromBottom - link.width / 2;
      }
    });
  });
}

// test if links both slope up, or both slope down
function sameInclines(link1, link2) {
  return incline(link1) === incline(link2);
}

// returns the slope of a link, from source to target
// up => slopes up from source to target
// down => slopes down from source to target
function incline(link) {
  return link.y0 - link.y1 > 0 ? 'up' : 'down';
}

// check if link is self linking, ie links a node to the same node
function selfLinking(link, id) {
  return getNodeID(link.source, id) === getNodeID(link.target, id);
}

function fillHeight(graph, y0, y1) {
  const nodes = graph.nodes;
  const links = graph.links;

  let top = false;
  let bottom = false;

  links.forEach(function (link) {
    if (link.circularLinkType === 'top') {
      top = true;
    } else if (link.circularLinkType === 'bottom') {
      bottom = true;
    }
  });

  if (top === false || bottom === false) {
    const minY0 = min(nodes, function (node) {
      return node.y0;
    });
    const maxY1 = max(nodes, function (node) {
      return node.y1;
    });
    const currentHeight = maxY1 - minY0;
    const chartHeight = y1 - y0;
    const ratio = chartHeight / currentHeight;

    nodes.forEach(function (node) {
      const nodeHeight = (node.y1 - node.y0) * ratio;
      node.y0 = (node.y0 - minY0) * ratio;
      node.y1 = node.y0 + nodeHeight;
    });

    links.forEach(function (link) {
      link.y0 = (link.y0 - minY0) * ratio;
      link.y1 = (link.y1 - minY0) * ratio;
      link.width = link.width * ratio;
    });
  }
}

// ! custom function to take the link data and generate a path (createCircularPathString was previously an original function for the svg version)
// hw = half-width, hh = half-height of the viewport
// todo: refactor hw, hh and direction below
function createCircularPath(link, hw, hh) {
  const isTop = link.circularLinkType === 'top';
  const offset = 0;

  const x0 = link.circularPathData.sourceX;
  const y0 = link.circularPathData.sourceY;

  // start at the right of the source node
  const x1 = link.circularPathData.sourceX + offset;
  const y1 = link.circularPathData.sourceY;
  // line right to buffer point
  const x2 = link.circularPathData.leftInnerExtent + offset;
  const y2 = y1;
  // End of arc X //End of arc Y
  const x3 = link.circularPathData.leftFullExtent + offset;
  const y3 = isTop
    ? link.circularPathData.sourceY - link.circularPathData.leftSmallArcRadius
    : link.circularPathData.sourceY + link.circularPathData.leftSmallArcRadius;
  const x4 = x3 + offset;
  const y4 = link.circularPathData.verticalLeftInnerExtent;

  // End of arc X //End of arc Y
  const x5 = link.circularPathData.leftInnerExtent + offset;
  const y5 = link.circularPathData.verticalFullExtent;
  // line left to buffer point
  const x6 = link.circularPathData.rightInnerExtent + offset;
  const y6 = link.circularPathData.verticalFullExtent;
  // Arc around: Centre of arc X and  //Centre of arc Y
  // End of arc X //End of arc Y
  const x7 = link.circularPathData.rightFullExtent + offset;
  const y7 = link.circularPathData.verticalRightInnerExtent;

  const x8 = link.circularPathData.rightFullExtent + offset;
  const y8 = isTop
    ? link.circularPathData.targetY - link.circularPathData.rightSmallArcRadius
    : link.circularPathData.targetY + link.circularPathData.rightSmallArcRadius;
  // Arc around: Centre of arc X and  //Centre of arc Y
  // End of arc X //End of arc Y
  const x9 = link.circularPathData.rightInnerExtent + offset;
  const y9 = link.circularPathData.targetY;
  // line to end
  const x10 = link.circularPathData.targetX + offset;
  const y10 = link.circularPathData.targetY;

  const positions = [
    x1 - hw,
    y1 - hh,
    x2 - hw,
    y2 - hh,
    x3 - hw,
    y3 - hh,
    x4 - hw,
    y4 - hh,
    x5 - hw,
    y5 - hh,
    x6 - hw,
    y6 - hh,
    x7 - hw,
    y7 - hh,
    x8 - hw,
    y8 - hh,
    x9 - hw,
    y9 - hh,
    x10 - hw,
    y10 - hw,
  ];
  const sourcePositions = positions.slice(0, 18);
  const targetPositions = positions.slice(2, 20);
  const directions = [
    1,
    0,
    1,
    0,
    0,
    1,
    0,
    1,
    1,
    0, //
    1,
    0, //
    0,
    1,
    0,
    1,
    1,
    0,
    1,
    0,
  ];
  const sourceDirections = directions.slice(0, 18);
  const targetDirections = directions.slice(2, 20);
  return {
    sourcePositions,
    targetPositions,
    sourceDirections,
    targetDirections,
  };
}

function addAttributeData(graph, width, height) {
  const { nodes, links } = graph;

  // this is a hack how custom positioning can override node positions using offset (it takes the previous generated node and move it on user interaction)
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    // first do the resize
    if (node.resize) {
      node.x0 -= node.resize.x;
      node.x1 += node.resize.x;
      node.y0 -= node.resize.y;
      node.y1 += node.resize.y;
    }
    // then apply offset
    if (node.offset) {
      node.x0 += node.offset.x;
      node.x1 += node.offset.x;
      node.y0 += node.offset.y;
      node.y1 += node.offset.y;
      node.sourceLinks.forEach(l => {
        l.y0 += node.offset.y;
      });
      node.targetLinks.forEach(l => {
        l.y1 += node.offset.y;
      });
    }
    if (node.isViewer) {
      // need to square the node
      const w = node.x1 - node.x0;
      const h = node.y1 - node.y0;
      if (w > h) {
        node.y0 = node.y0 - w / 2;
        node.y1 = node.y0 + w;
        node.pixelW = w;
        node.pixelH = w;
        node.pixelX = node.x0;
        node.pixelY = node.y0;
      } else {
        node.x0 = node.x0 - h / 2;
        node.x1 = node.x0 + h;
        node.pixelW = h;
        node.pixelH = h;
        node.pixelX = node.x0;
        node.pixelY = node.y0;
      }
    }
  }

  const sourcePositions = [];
  const targetPositions = [];
  const sourceDirections = [];
  const targetDirections = [];
  const linkColors = [];
  const linkThickness = [];
  const linkIsPlaceholder = [];
  const nodeTranslate = [];
  const nodeScale = [];
  const nodeColors = [];
  const nodeIsPlaceholder = [];

  //const linkData = [];

  const hw = width * 0.5;
  const hh = height * 0.5;
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const thickness = link.isPlaceholder ? link.width : link.width * 2;
    const x1 = link.source.x1 - hw;
    const x2 = link.target.x0 - hw;
    const y1 = link.y0 - hh;
    const y2 = link.y1 - hh;

    // old code for reversing the link connection:

    // const sourceY0 = link.source.y0 - hh;
    // const sourceY1 = link.source.y1 - hh;
    // const sourceDiff = y1 - sourceY0;
    // y1 = sourceY1 - sourceDiff;

    // const targetY0 = link.target.y0 - hh;
    // const targetY1 = link.target.y1 - hh;
    // const targetDiff = y2 - targetY0;
    // y2 = targetY1 - targetDiff;

    link.textPosition = [x1 + 5, y1];

    //const { r, g, b } = getIndicatorColor(i / links.length);
    const rgb = link.color || [200, 200, 200];

    if (link.circular) {
      const circularPath = createCircularPath(link, hw, hh);
      sourcePositions.push(...circularPath.sourcePositions);
      targetPositions.push(...circularPath.targetPositions);
      sourceDirections.push(...circularPath.sourceDirections);
      targetDirections.push(...circularPath.targetDirections);
      const numPathSegments = circularPath.sourcePositions.length / 2;
      linkColors.push(
        ...Array(numPathSegments)
          .fill(null)
          .reduce(rgbs => [...rgbs, ...rgb], [])
      );
      linkThickness.push(
        ...Array(numPathSegments)
          .fill(null)
          .reduce(thicknesses => [...thicknesses, thickness], [])
      );
      linkIsPlaceholder.push(
        ...Array(numPathSegments)
          .fill(null)
          .map(_ => (link.isPlaceholder ? 1 : 0))
      );
    } else {
      sourcePositions.push(x1, y1);
      targetPositions.push(x2, y2);
      sourceDirections.push(1, 0);
      targetDirections.push(1, 0);
      linkThickness.push(thickness);
      linkColors.push(...rgb);
      linkIsPlaceholder.push(link.isPlaceholder ? 1 : 0);
    }
  }

  // for (let i = 0; i < linkThickness.length; i++) {
  //   linkData.push({
  //     sourcePosition: [sourcePositions[i * 2], sourcePositions[i * 2 + 1]],
  //     targetPosition: [targetPositions[i * 2], targetPositions[i * 2 + 1]],
  //     sourceDirection: [sourceDirections[i * 2], sourceDirections[i * 2 + 1]],
  //     targetDirection: [targetDirections[i * 2], targetDirections[i * 2 + 1]],
  //     width: linkThickness[i],
  //     color: [linkColors[i * 2], linkColors[i * 2 + 1], linkColors[i * 2 + 2]],
  //   });
  // }
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const x1 = node.x0 - hw;
    const x2 = node.x1 - hw;
    const y1 = node.y0 - hh;
    const y2 = node.y1 - hh;
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;
    const yOffset = yDiff / 2;
    const yExtraOffset = yOffset / 2;
    const yCenterOffset = node.isPlaceholder ? yOffset : yOffset; //-yOffset + yExtraOffset;
    const yTextOffset = node.isPlaceholder ? yOffset : yOffset;

    node.center = [x1 + xDiff / 2, y1 + yCenterOffset];
    node.textPosition = [node.center[0], node.center[1] - yTextOffset - 8];

    nodeTranslate.push(...node.center);
    nodeScale.push((x2 - x1) * 0.5, (y2 - y1) * 0.5);
    //const { r, g, b } = getIndicatorColor(i / nodes.length);
    const rgb = node.color || [150, 150, 150];
    nodeColors.push(...rgb);
    const placeholderValue = node.isPlaceholder ? 1 : 0;
    nodeIsPlaceholder.push(placeholderValue);
  }
  const attributeData = {
    linkSegmentCount: linkThickness.length,
    instanceSourcePositions: new Float32Array(sourcePositions),
    instanceTargetPositions: new Float32Array(targetPositions),
    instanceSourceDirections: new Float32Array(sourceDirections),
    instanceTargetDirections: new Float32Array(targetDirections),
    instanceLinkWidths: new Float32Array(linkThickness),
    instanceLinkColors: new Float32Array(linkColors),
    instanceLinkIsPlaceholder: new Float32Array(linkIsPlaceholder),
    instanceNodeTranslate: new Float32Array(nodeTranslate),
    instanceNodeScale: new Float32Array(nodeScale),
    instanceNodeColors: new Float32Array(nodeColors),
    instanceNodeIsPlaceholder: new Float32Array(nodeIsPlaceholder),
  };
  return Object.assign(graph, attributeData);
  // return {
  //   sourcePositions,
  //   targetPositions,
  //   directions,
  //   linkThickness,
  //   linkColors,
  //   nodeTranslate,
  //   nodeScale,
  //   nodeColors,
  // };
}

function addHeaders(graph, width, height) {
  const hw = width * 0.5;
  const hh = height * 0.5;
  const headers = graph.nodes.reduce(
    (acc, node, i) => {
      if (!acc.domain || acc.domain !== node.domain) {
        acc.texts.push({
          text: node.domain,
          position: [node.x0 - hw, -100 - hh],
        });
        acc.domain = node.domain;
      }
      if (i === 0) {
        acc.line.path.push([node.x0 - hw - 100, -80 - hh]);
      } else if (i === graph.nodes.length - 1) {
        acc.line.path.push([node.x0 - hw + 100, -80 - hh]);
      }
      return acc;
    },
    {
      domain: '',
      line: {
        path: [],
      },
      texts: [],
    }
  );
  graph.headers = headers.texts;
  graph.headersLine = [headers.line];
}

export {
  sankeyCircular as circularSankey,
  addCircularPathData,
  center as sankeyCenter,
  left as sankeyLeft,
  right as sankeyRight,
  justify as sankeyJustify,
};
