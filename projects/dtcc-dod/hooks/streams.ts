import { useQuery, gql } from '@apollo/client';
import { Node, Edge, Graph } from '@paramountric/entity';
import { useMemo } from 'react';

const STREAMS_QUERY = gql`
  query Streams($cursor: String) {
    streams(cursor: $cursor, limit: 50) {
      totalCount
      cursor
      items {
        id
        name
        description
        role
        isPublic
        createdAt
        updatedAt
        commentCount
        collaborators {
          id
          name
          company
          role
        }
        # commits(limit: 100) {
        #   totalCount
        #   items {
        #     id
        #     createdAt
        #     message
        #     authorId
        #     branchName
        #     authorName
        #     referencedObject
        #     parents
        #   }
        # }
        branches {
          totalCount
          items {
            id
            name
            description
            createdAt
            commits(limit: 15, cursor: null) {
              totalCount
              items {
                id
                createdAt
                message
                authorId
                branchName
                authorName
                referencedObject
                parents
              }
            }
          }
        }
        favoritedDate
        favoritesCount
      }
    }
  }
`;

export const useStreams = (): {
  nodes: Node[] | undefined;
  edges: Edge[] | undefined;
  isLoading: boolean;
} => {
  const { data, loading } = useQuery(STREAMS_QUERY, {
    variables: {
      cursor: null,
    },
  });
  // console.log(data);
  // const graph = useMemo(() => {
  //   if (!data) {
  //     return null;
  //   }
  // stream start is the base representation, then each branch and commit is used to create a DAG
  const graphContent = useMemo(
    () =>
      data?.streams.items.reduce(
        (acc: any, stream: any) => {
          // add base
          acc.nodes.push(
            new Node({
              id: `${stream.id}`,
              createdAt: stream.createdAt,
              data: {
                name: `${stream.name}`,
                streamId: stream.id,
                type: 'Base',
              },
            })
          );
          // add branches and commits
          for (const branch of stream.branches.items) {
            const commits = [...branch.commits.items].sort((a: any, b: any) => {
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            });

            for (const commit of commits) {
              acc.nodes.push(
                new Node({
                  id: commit.id,
                  createdAt: commit.createdAt,
                  types: [branch.branchName === 'main' ? 'Base' : 'Bucket'],
                  data: {
                    name: commit.message,
                    streamId: stream.id,
                    commitId: commit.id,
                    authorId: commit.authorId,
                    authorName: commit.authorName,
                    createdAt: commit.createdAt,
                    referencedObject: commit.referencedObject,
                  },
                })
              );
              // each commit must edge back to previous commit (or stream)
              // if multiple parents, this is a commit that closes one or more branches
              const parentIds = commit.parents || [stream.id];
              for (const parentId of parentIds) {
                acc.edges.push(
                  new Edge({
                    id: `${parentId}-${commit.id}`,
                    sourceId: parentId,
                    targetId: commit.id,
                    data: {
                      name: commit.message,
                    },
                    directed: true,
                    type: 'CURVE',
                  })
                );
              }
            }
          }
          return acc;
        },
        {
          nodes: [],
          edges: [],
        } as {
          nodes: Node[];
          edges: Edge[];
        }
      ),
    [data]
  );

  // if (graphContent) {
  //   const g = new Graph();
  //   console.log(graphContent);
  //   g.batchAddNodes(graphContent.nodes);
  //   g.batchAddEdges(graphContent.edges);
  //   console.log('gr', g);
  //   setGraph(g);
  // }

  //   return g;
  // }, [data]);

  return {
    //graph: graph || null,
    nodes: graphContent?.nodes || undefined,
    edges: graphContent?.edges || undefined,
    isLoading: loading,
  };
};

// const g = new Graph();
//     const graphContent = data?.streams.items.reduce(
//       (acc: any, stream: any, idx: number) => {
//         // const branchMap = stream.branches.items.reduce(
//         //   (mem: any, branch: any) => {
//         //     mem[branch.name] = branch.id;
//         //     return mem;
//         //   },
//         //   {}
//         // );
//         acc.nodes.push(
//           new Node({
//             id: `start-${stream.id}`,
//             createdAt: stream.createdAt,
//             data: {
//               name: `${stream.name}`,
//               streamId: stream.id,
//               type: 'Base',
//             },
//           })
//         );

//         const mainBranch = stream.branches.items.find(
//           (s: any) => s.name === 'main'
//         );
//         const restBranches = stream.branches.items.filter(
//           (s: any) => s.id !== mainBranch.id
//         );
//         // if no other branch exist, end the main branch with a node and edge at current date
//         if (restBranches.length === 0) {
//           // acc.nodes.push(
//           //   new Node({
//           //     id: `end-${stream.id}`,
//           //     createdAt: new Date().toISOString(),
//           //     data: {
//           //       name: 'Add data', //`${stream.name}-end`,
//           //       streamId: stream.id,
//           //     },
//           //     state: 'empty',
//           //     isEmpty: true,
//           //   })
//           // );
//           // acc.edges.push(
//           //   new Edge({
//           //     id: `start-${stream.id}-end-${stream.id}`,
//           //     sourceId: `start-${stream.id}`,
//           //     targetId: `end-${stream.id}`,
//           //     data: {
//           //       name: stream.name,
//           //     },
//           //     directed: true,
//           //     type: 'line',
//           //   })
//           // );
//         } else {
//           // if rest branches exist start and end those as children on main branch
//           for (const branch of restBranches) {
//             // const commits = [...branch.commits.items].sort((a: any, b: any) => {
//             //   return (
//             //     new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//             //   );
//             // });
//             // if (commits.length > 0) {
//             //   lastCommits.push(commits[commits.length - 1]);
//             // }
//             const sourceNodeIds: {
//               [sourceNodeId: string]: boolean;
//             } = {};
//             for (const commit of branch.commits.items) {
//               console.log(commit);
//               // const secondsDiff =
//               //   (new Date(commit.createdAt) - graph.initAt) / 1000;
//               acc.nodes.push(
//                 new Node({
//                   id: commit.id,
//                   createdAt: commit.createdAt,
//                   data: {
//                     name: commit.message,
//                     commitId: commit.id,
//                     type: branch.branchName === 'main' ? 'Base' : 'Bucket',
//                   },
//                 })
//               );
//               // each commit must edge back to previous commit (or stream)
//               // if multiple parents, this is a commit that closes one or more branches
//               const parentIds = commit.parents || [stream.id];
//               for (const parentId of parentIds) {
//                 acc.edges.push(
//                   new Edge({
//                     id: `${parentId}-${commit.id}`,
//                     sourceId: parentId,
//                     targetId: commit.id,
//                     data: {
//                       name: commit.message,
//                     },
//                     directed: true,
//                     type: 'curve',
//                   })
//                 );
//                 sourceNodeIds[parentId] = true;
//               }
//             }

//             acc.nodes.push(
//               new Node({
//                 id: `end-${branch.id}`,
//                 createdAt: new Date().toISOString(),
//                 data: {
//                   name: 'Add data', //`${branch.name}-end`,
//                   streamId: stream.id,
//                 },
//                 state: 'empty',
//               })
//             );

//             // connect all "last" commits of this branch, they are not part of any edge as source
//             for (const commit of branch.commits.items) {
//               if (!sourceNodeIds[commit.id]) {
//                 acc.edges.push(
//                   new Edge({
//                     id: `${commit.id}-end-${branch.id}`,
//                     sourceId: commit.id,
//                     targetId: `end-${branch.id}`,
//                     data: {
//                       name: stream.name,
//                     },
//                     directed: true,
//                     type: 'curve',
//                   })
//                 );
//               }
//             }
//           }

// const lastCommits = [];

// // add one end node at current datetime
// acc.nodes.push(
//   new Node({
//     id: `end-${stream.id}`,
//     y: nodeY,
//     createdAt: new Date().toISOString(),
//     data: {
//       name: `${stream.name}-end`,
//       streamId: stream.id,
//     },
//   })
// );

// // connect to previous commit (or start node)
// const last = lastCommits[lastCommits.length - 1];
// if (last) {
//   acc.edges.push(
//     new Edge({
//       id: `${last.id}-end-${stream.id}`,
//       sourceId: last.id,
//       targetId: `end-${stream.id}`,
//       data: {
//         name: '',
//       },
//       directed: true,
//       type: 'curve',
//     })
//   );
// } else {
//   acc.edges.push(
//     new Edge({
//       id: `${stream.id}-end-${stream.id}`,
//       sourceId: stream.id,
//       targetId: `end-${stream.id}`,
//       data: {
//         name: '',
//       },
//       directed: true,
//       type: 'curve',
//     })
//   );
// }
//     }
//     return acc;
//   },
//   {
//     nodes: [],
//     edges: [],
//   } as {
//     nodes: Node[];
//     edges: Edge[];
//   }
// );
// if (!graphContent) {
//   return;
// }
// g.batchAddNodes(graphContent.nodes.map((n: any) => new Node(n)));
// g.batchAddEdges(graphContent.edges.map((e: any) => new Edge(e)));
// console.log(g);
// return g;
