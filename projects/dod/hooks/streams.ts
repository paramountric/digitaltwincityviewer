import { useQuery, useMutation, gql } from '@apollo/client';
import { Node, Edge, Graph } from '@paramountric/entity';
import { useMemo } from 'react';

const QUERY_STREAMS = gql`
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
          avatar
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

const CREATE_BRANCH = gql`
  mutation CreateBranch(
    $streamId: String!
    $name: String!
    $description: String
  ) {
    branchCreate(
      branch: { streamId: $streamId, name: $name, description: $description }
    )
  }
`;

const CREATE_COMMIT = gql`
  mutation CreateCommit(
    $streamId: String!
    $branchName: String!
    $objectId: String!
    $message: String
    $sourceApplication: String
    $totalChildrenCount: Int
    $parents: [String]
  ) {
    commitCreate(
      commit: {
        streamId: $streamId
        branchName: $branchName
        objectId: $objectId
        message: $message
        sourceApplication: $sourceApplication
        totalChildrenCount: $totalChildrenCount
        parents: $parents
      }
    )
  }
`;

const CREATE_OBJECT = gql`
  mutation CreateObject($streamId: String!, $objects: [JSONObject]!) {
    objectCreate(objectInput: { streamId: $streamId, objects: $objects })
  }
`;

export type Branch = {
  id: string;
  streamId: string;
  name: string;
  description: string;
  createdAt: string;
};

export type Commit = {
  id: string;
  streamId: string;
  createdAt: string;
  message: string;
  authorId: string;
  branchName: string;
  authorName: string;
  referencedObject: string;
  parents: string[];
};

export const useStreams = (): {
  nodes: Node[] | undefined;
  edges: Edge[] | undefined;
  isLoading: boolean;
  branches: Branch[];
  typeCommits: Commit[];
  createBranch: (
    streamId: string,
    branchName: string,
    description?: string
  ) => void;
  createObject: (streamId: string, objects: [any]) => Promise<string | null>;
  createCommit: (
    streamId: string,
    branchName: string,
    objectId: string,
    message: string,
    sourceApplication: string,
    totalChildrenCount: number,
    parents: string[] | null
  ) => void;
} => {
  const { data: streamsData, loading } = useQuery(QUERY_STREAMS, {
    variables: {
      cursor: null,
    },
  });
  const [executeCreateBranch, { data: createBranchData }] =
    useMutation(CREATE_BRANCH);
  const [executeCreateCommit, { data: createCommitData }] = useMutation(
    CREATE_COMMIT,
    {
      refetchQueries: [QUERY_STREAMS],
    }
  );
  const [executeCreateObject, { data: createObjectData }] =
    useMutation(CREATE_OBJECT);

  console.log(streamsData);

  // stream start is the base representation, then each branch and commit is used to create a DAG
  const graphContent = useMemo(
    () =>
      streamsData?.streams.items.reduce(
        (acc: any, stream: any) => {
          // add base
          acc.nodes.push(
            new Node({
              id: `${stream.id}`,
              createdAt: stream.createdAt,
              type: 'Base',
              types: [stream.__typename],
              data: {
                isBaseBucket: true,
                name: `${stream.name}`,
                streamId: stream.id,
                createdAt: stream.createdAt,
                updatedAt: stream.updatedAt,
                speckleType: 'Stream',
              },
            })
          );
          // add branches and commits
          for (const branch of stream.branches.items) {
            acc.branches.push({
              id: branch.id,
              streamId: stream.id,
              name: branch.name,
              description: branch.description,
              createdAt: branch.createdAt,
            });
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
                  type: branch.branchName === 'main' ? 'Base' : 'Bucket',
                  //types: [branch.branchName === 'main' ? 'Base' : 'Bucket'],
                  types: [commit.__typename],
                  data: {
                    isBaseBucket: true,
                    name: commit.message,
                    streamId: stream.id,
                    commitId: commit.id,
                    authorId: commit.authorId,
                    authorName: commit.authorName,
                    createdAt: commit.createdAt,
                    updatedAt: stream.updatedAt,
                    referencedObject: commit.referencedObject,
                    speckleType: commit.__typename,
                  },
                })
              );
              if (commit.branchName === 'types') {
                acc.typeCommits.push({
                  id: commit.id,
                  streamId: stream.id,
                  createdAt: commit.createdAt,
                  message: commit.message,
                  authorId: commit.authorId,
                  branchName: commit.branchName,
                  authorName: commit.authorName,
                  referencedObject: commit.referencedObject,
                  parents: commit.parents,
                });
              }
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
          typeCommits: [],
          branches: [],
        } as {
          nodes: Node[];
          edges: Edge[];
          typeCommits: Commit[];
          branches: Branch[];
        }
      ),
    [streamsData]
  );

  // function downloadObjectAsJson(exportObj: any, exportName: string) {
  //   var dataStr =
  //     'data:text/json;charset=utf-8,' +
  //     encodeURIComponent(JSON.stringify(exportObj));
  //   var downloadAnchorNode = document.createElement('a');
  //   downloadAnchorNode.setAttribute('href', dataStr);
  //   downloadAnchorNode.setAttribute('download', exportName + '.json');
  //   document.body.appendChild(downloadAnchorNode); // required for firefox
  //   downloadAnchorNode.click();
  //   downloadAnchorNode.remove();
  // }

  // if (graphContent?.nodes) {
  //   downloadObjectAsJson(graphContent, 'streams.json');
  // }

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
    isLoading: false, //loading,
    branches: graphContent?.branches || undefined,
    typeCommits: graphContent?.typeCommits || undefined,
    createBranch: async (
      streamId: string,
      name: string,
      description?: string
    ) => {
      const res = await executeCreateBranch({
        variables: {
          name,
          description,
          streamId,
        },
      });
      console.log('create branch: ', res);
    },
    createObject: async (
      streamId: string,
      objects: [any]
    ): Promise<string | null> => {
      const res = await executeCreateObject({
        variables: {
          streamId,
          objects,
        },
      });
      console.log('create object: ', res);
      return res.data?.objectCreate && res.data?.objectCreate.length > 0
        ? res.data.objectCreate[0]
        : null;
    },
    createCommit: async (
      streamId: string,
      branchName: string,
      objectId: string,
      message: string,
      sourceApplication: string,
      totalChildrenCount: number,
      parents: string[] | null
    ) => {
      const res = await executeCreateCommit({
        variables: {
          streamId,
          branchName,
          objectId,
          message,
          sourceApplication,
          totalChildrenCount,
          parents,
        },
      });
      console.log('create commit: ', res);
    },
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
