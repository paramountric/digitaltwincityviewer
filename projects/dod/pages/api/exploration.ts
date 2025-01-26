import type { NextApiRequest, NextApiResponse } from 'next';
import { Graph, Node, Edge, EntityGenerator } from '@paramountric/entity';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const { SPECKLE_SERVER_URL, JWT_SECRET = '' } = process.env;

// todo: generate test data. Egdes from node relations in nodes
// the structure comes from streams, commits, branches
console.log('hello');
const entityGenerator = new EntityGenerator('gfdgf');
console.log(entityGenerator);
const randomNodes = entityGenerator.generateEntities({
  idPrefix: 'obj',
  type: 'Stream',
  numEntities: 100,
  propertiesConfig: [
    {
      valuePrefix: 'stream', // prefix for string based property values, added before the numeric counter
      key: 'title', // propertyKey
      // minValue: numberstring,
      // maxValue: numberstring,
      // categorical?: booleanstring, // convert the number to string
      // unitCode?: string,
    },
  ],
  randomDate: true, // this will set observedAt to a random date between startDate and endDate
});
console.log(randomNodes);

const exploration: Graph = new Graph();
// exploration.batchAddNodes(
//   [
//     {
//       id: '1',
//       x: 0,
//       y: 0,
//       locked: false,
//       data: {
//         name: 'Structural model',
//       },
//     },
//     {
//       id: '1b',
//       x: 20,
//       y: 0,
//       locked: false,
//       data: {
//         name: 'Facade model',
//       },
//     },
//     {
//       id: '2',
//       x: 50,
//       y: 0,
//       locked: false,
//       data: {
//         name: 'Northern Building',
//       },
//     },
//     {
//       id: '3',
//       x: 50,
//       y: 10,
//       data: {
//         name: 'Southern Building',
//       },
//     },
//     {
//       id: '4',
//       x: 290,
//       y: 100,
//       data: {
//         name: 'Beams',
//       },
//       types: ['Beam'],
//     },
//   ].map(n => new Node(n))
// );
// exploration.batchAddEdges(
//   [
//     {
//       id: '1',
//       sourceId: '1',
//       targetId: '2',
//       type: 'CURVE',
//       data: {
//         label: 'edge 1',
//       },
//     },
//     {
//       id: '2',
//       sourceId: '1',
//       targetId: '3',
//       type: 'CURVE',
//     },
//     {
//       id: '3',
//       sourceId: '3',
//       targetId: '4',
//       type: 'CURVE',
//     },
//     {
//       id: '4',
//       sourceId: '3',
//       targetId: '1b',
//       type: 'CURVE',
//     },
//   ].map(e => new Edge(e))
// );

export default async function handleGetData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const { bb } = req.cookies;
  if (!bb) {
    console.log('wrong key');
    res.status(401).end();
    return;
  }
  try {
    const { token } = jwt.verify(bb, JWT_SECRET) as any;
    if (!token) {
      throw new Error('no token');
    }
    const data = JSON.stringify({
      query: `query Streams($cursor: String) {
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
            commits(limit: 100) {
              totalCount
              items {
                id
                createdAt
                message
                authorId
                branchName
                authorName
                referencedObject
              }
            }
            branches {
              totalCount
              items {
                id
                name
                description
              }
            }
            favoritedDate
            favoritesCount
          }
        }
      }`,
      variables: `{
        "cursor": null
      }`,
    });
    console.log('token', token);
    const queryResponse = await fetch(`${SPECKLE_SERVER_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: data,
    });
    const queryPayload = await queryResponse.json();
    console.log(JSON.stringify(queryPayload));
    res.status(200).json({
      nodes: exploration.getNodes(),
      edges: exploration.getEdges(),
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}
