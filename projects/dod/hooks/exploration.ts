import { Edge, Node } from '@paramountric/entity';
import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

// these nodes are from entities objects used for exploration
// the same nodes are also used in the node viewers
// important that uses can efficiently filter and create selection on what is is visible
export type ExplorationStore = {
  nodes: Node[];
  edges: Edge[];
  includeTypes: boolean;
  includeInstances: boolean;
  includeProperties: boolean;
  propertyFilter: string[];
};

const explorationStore = new Observable<ExplorationStore>({
  nodes: [],
  edges: [],
  includeTypes: true,
  includeInstances: false,
  includeProperties: false,
  propertyFilter: [],
});

export const useExploration = () => {
  const [explorationState, setExplorationState] = useState(
    explorationStore.get()
  );

  useEffect(() => {
    return explorationStore.subscribe(setExplorationState);
  }, []);

  const actions = useMemo(() => {
    return {
      setIncludeTypes: (includeTypes: boolean) => {
        explorationStore.set({ ...explorationState, includeTypes });
      },
      setIncludeInstances: (includeInstances: boolean) => {
        explorationStore.set({ ...explorationState, includeInstances });
      },
      setIncludeProperties: (includeProperties: boolean) => {
        explorationStore.set({ ...explorationState, includeProperties });
      },
      addExplorationData: (nodes: Node[], edges: Edge[]) => {
        explorationStore.set({
          ...explorationState,
          nodes,
          edges,
        });
      },
      getExplorationNodes: () => {
        return explorationState.nodes;
      },
      getExplorationEdges: () => {
        return explorationState.edges;
      },
      // todo: generate exploration nodes in here, for now
      // send in a combination of nodes from base/buckets/commits/branches and objects/entities loaded
      setExplorationData: (
        nodes: Node[],
        rootNode: Node,
        addToExploration = false
      ) => {
        const rootNodeId = rootNode.getId();
        const nodeMap: {
          [nodeId: string]: Node;
        } = {
          //[rootNodeId]: rootNode,
        };
        const edges: Edge[] = [];
        const store = explorationStore.get();
        if (store.includeProperties) {
          // for (const node of nodes) {
          //   nodeMap[node.getId()] = node;
          //   edges.push(
          //     new Edge({
          //       id: `${rootNodeId}-${node.getId()}`,
          //       type: 'LINE',
          //       sourceId: rootNodeId,
          //       targetId: node.getId(),
          //     })
          //   );
          // }
        } else if (store.includeTypes) {
          for (const node of nodes) {
            for (const type of node.types || []) {
              const typeId = `${rootNodeId}-${type}`;
              if (!nodeMap[typeId]) {
                nodeMap[typeId] = new Node({
                  id: typeId,
                  type: 'Group',
                  types: [type],
                  data: {
                    name: type,
                    description: `A group of objects of type ${type}`,
                    parentId: node.getPropertyValue('parentId'),
                    commitId: node.getPropertyValue('commitId'),
                  },
                  collisionRadius: 10,
                });
                edges.push(
                  new Edge({
                    id: `${rootNodeId}-${typeId}`,
                    type: 'LINE',
                    sourceId: rootNodeId,
                    targetId: typeId,
                    data: {
                      name: 'has type',
                    },
                  })
                );
              }
              const validState = node.getValidState();
              if (validState === 'not-valid') {
                nodeMap[typeId].setDataProperty('valid', false);
              }
              // if (store.includeInstances) {
              //   nodeMap[node.getId()] = node;
              //   edges.push(
              //     new Edge({
              //       id: `${type}-${node.getId()}`,
              //       type: 'LINE',
              //       sourceId: type,
              //       targetId: node.getId(),
              //       data: {
              //         name: 'has instance',
              //       },
              //     })
              //   );
              // }
            }
          }
        } else if (explorationState.includeInstances) {
          // for (const node of nodes) {
          //   nodeMap[node.getId()] = node;
          //   edges.push(
          //     new Edge({
          //       id: `${rootNode.getId()}-${node.getId()}`,
          //       type: 'LINE',
          //       sourceId: rootNode.getId(),
          //       targetId: node.getId(),
          //       data: {
          //         name: 'has instance',
          //       },
          //     })
          //   );
          // }
        }

        explorationStore.set({
          ...explorationState,
          nodes: addToExploration
            ? [...explorationState.nodes, ...Object.values(nodeMap)]
            : Object.values(nodeMap),
          edges,
        });
      },
    };
  }, [explorationState]);

  return {
    state: explorationState,
    actions,
  };
};

// import { useQuery } from 'react-query';
// import { Node, Edge, Graph } from '@paramountric/entity';

// export const useExploration = (): {
//   graph: Graph | null;
//   refetch: any;
//   isLoading: boolean;
// } => {
//   const dataUrl = '/api/exploration';
//   const query = useQuery(
//     'protected-data',
//     async () => {
//       try {
//         const res = await fetch(dataUrl);
//         return await res.json();
//       } catch (err) {
//         return undefined;
//       }
//     },
//     {
//       enabled: false,
//     }
//   );
//   let graph;
//   if (query.data) {
//     graph = new Graph();
//     graph.batchAddNodes(query.data.nodes.map((n: any) => new Node(n)));
//     graph.batchAddEdges(query.data.edges.map((e: any) => new Edge(e)));
//   }
//   return {
//     graph: graph || null,
//     refetch: query.refetch,
//     isLoading: query.isLoading,
//   };
// };
