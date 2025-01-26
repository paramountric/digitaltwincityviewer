import {
  Exploration,
  ExplorationNode,
  NodeClusterSetting,
} from './Exploration.js';
import { Entity } from './Entity.js';
import { EntityGenerator } from './EntityGenerator.js';

test('create cluster', () => {
  const exploration = new Exploration();
  exploration.setSelectedProperty('volume');
  const node1 = new ExplorationNode({
    // generates query
    types: ['Type1'],
    numericPropertyKeys: ['volume'],
  });
  node1.selectedPropertyKey = 'volume';

  // result from query, the node can load entities BUT since we need to add entities from file OR from backend, we separate the node.addEntities with the fetching
  const entityGenerator = new EntityGenerator('seed');
  const entities = entityGenerator.generateEntities({
    numEntities: 100,
    idPrefix: 'sample',
    type: 'Type1',
    propertiesConfig: [
      {
        minValue: 1,
        maxValue: 10,
        key: 'volume',
        unitCode: 'm3',
      },
      {
        minValue: 1,
        maxValue: 10,
        categorical: true,
        key: 'category',
      },
      {
        minValue: 1,
        maxValue: 10,
        categorical: true,
        key: 'category2',
      },
    ],
  });

  // this is needed for sequentially regenerate the flow again, because new entities where added
  exploration.addNode(node1, entities);

  // user chose to select volume, both a node and a link needs to be created
  const node2 = new ExplorationNode({
    // generates query
    // ALL Volume
    numericPropertyKeys: ['volume'],
  });

  exploration.addNode(node2, entities, node1);

  const sankey = exploration.getSankeyOutput(exploration.getSankeyInput());
  const cluterSettings: NodeClusterSetting[] = sankey.nodes.map(node => ({
    id: node.id,
    layout: 'vertical',
    value: node.value as number,
    x0: node.x0 as number,
    x1: node.x1 as number,
    y0: node.y0 as number,
    y1: node.y1 as number,
  }));

  const cluster = exploration.createCluster(cluterSettings);

  // maxZoom + zero + unclustered (maxZoom + 1) = maxZoom 16 is 0-16 + 17 for unclustered which totals to 18
  expect(cluster.length).toEqual(exploration.maxZoom + 2);

  const clusterNodes = exploration.getClusters([-1000, -1000, 1000, 1000]);

  expect(clusterNodes.length).toEqual(7);
});

// test.skip('generateAtomics - basic', () => {
//   const entity1 = new Entity({
//     id: '1',
//     type: 'Type1',
//     relationships: {
//       downstream: {
//         type: 'Relationship',
//         object: '2',
//         properties: {
//           volume: {
//             type: 'Property',
//             value: 10,
//           },
//         },
//       },
//     },
//   });
//   const entity2 = new Entity({
//     id: '2',
//     type: 'Type2',
//   });
//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['Type1'],
//   });
//   const atomics = exploration.generateAtomics([entity1, entity2]);
//   expect(atomics.length).toEqual(1);
// });

// test.skip('generateAtomics - simple', () => {
//   const entityGenerator = new EntityGenerator();
//   const fromEntities = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'FromSample',
//     propertiesConfig: [
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'volume',
//         unitCode: 'm3',
//       },
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'category',
//       },
//     ],
//   });
//   const toEntities = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'ToSample',
//     propertiesConfig: [],
//   });
//   entityGenerator.setRelationships(fromEntities, toEntities, 'downstream');
//   const entities = [...fromEntities, ...toEntities];

//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['FromSample'],
//     groupKeys: ['category'],
//   });
//   const atomics = exploration.generateAtomics(entities);
//   expect(atomics.length).toEqual(20);
// });

// test.skip('generateAtomics - property group chain', () => {
//   const entityGenerator = new EntityGenerator();
//   const fromEntities = entityGenerator.generateEntities({
//     numEntities: 2,
//     idPrefix: 'sample',
//     type: 'FromSample',
//     propertiesConfig: [
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'volume',
//         unitCode: 'm3',
//       },
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'category1',
//       },
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'category2',
//       },
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'category3',
//       },
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'category4',
//       },
//     ],
//   });
//   const toEntities = entityGenerator.generateEntities({
//     numEntities: 2,
//     idPrefix: 'sample',
//     type: 'ToSample',
//     propertiesConfig: [],
//   });
//   entityGenerator.setRelationships(fromEntities, toEntities, 'downstream');
//   const entities = [...fromEntities, ...toEntities];

//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['FromSample'],
//     groupKeys: ['category1', 'category2', 'category3', 'category4'],
//   });
//   const atomics = exploration.generateAtomics(entities);
//   expect(atomics.length).toEqual(10);
// });

// // note: __selectedPropertyKey is never supposed to be several groups, since there will be more than groupLimit
// test.skip('generateAtomics - property by __type and __selectedPropertyKey', () => {
//   const entityGenerator = new EntityGenerator();
//   const type1 = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'Type1',
//     propertiesConfig: [
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'volume',
//         unitCode: 'm3',
//       },
//     ],
//   });
//   const type2 = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'Type2',
//     propertiesConfig: [
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'volume',
//         unitCode: 'm3',
//       },
//     ],
//   });
//   const type3 = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'Type3',
//     propertiesConfig: [
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'volume',
//         unitCode: 'm3',
//       },
//     ],
//   });

//   const entities = [...type1, ...type2, ...type3];

//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   // exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['Type1', 'Type2', 'Type3'],
//     groupKeys: ['__type', '__selectedPropertyKey'],
//   });
//   const atomics = exploration.generateAtomics(entities);
//   expect(atomics.length).toEqual(60);
// });

// test.skip('generateAtomics - small sequence', () => {
//   const entityGenerator = new EntityGenerator();
//   const fromEntities = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'FromSample',
//     propertiesConfig: [
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'volume',
//         unitCode: 'm3',
//       },
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'category',
//       },
//     ],
//   });
//   const middleEntities = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'MiddleSample',
//     propertiesConfig: [
//       {
//         minValue: 1,
//         maxValue: 10,
//         key: 'volume',
//         unitCode: 'm3',
//       },
//     ],
//   });
//   const endEntities = entityGenerator.generateEntities({
//     numEntities: 10,
//     idPrefix: 'sample',
//     type: 'EndSample',
//     propertiesConfig: [],
//   });
//   entityGenerator.setRelationships(fromEntities, middleEntities, 'downstream');
//   entityGenerator.setRelationships(middleEntities, endEntities, 'downstream');
//   const entities = [...fromEntities, ...middleEntities, ...endEntities];

//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['FromSample'],
//     groupKeys: ['category'],
//   });
//   exploration.addNode({
//     types: ['MiddleSample'],
//   });
//   const atomics = exploration.generateAtomics(entities);
//   expect(atomics.length).toEqual(30);
// });

// test.only('generateAtomics - time index hourly', () => {
//   const observedAts = [
//     '2000-01-01 00:00:00',
//     '2000-01-01 00:00:01',
//     '2000-01-01 00:00:02',
//     '2000-01-01 00:00:03',
//     '2000-01-01 00:00:04',
//     '2000-01-02 00:00:05',
//   ];
//   const entities = observedAts.map((observedAt, i) => {
//     return new Entity({
//       id: `${i}`,
//       observedAt,
//       type: 'Test',
//       properties: {
//         volume: {
//           type: 'Property',
//           value: 10,
//         },
//       },
//       relationships: {
//         downstream: {
//           type: 'Relationship',
//           object: '1',
//         },
//       },
//     });
//   });
//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['Test'],
//   });
//   const atomics = exploration.generateAtomics(entities);
//   expect(atomics.length).toEqual(6);
//   expect(exploration.startDate.getFullYear()).toEqual(2000);
//   expect(exploration.startDate.getSeconds()).toEqual(0);
//   expect(exploration.endDate.getSeconds()).toEqual(5);
//   expect(exploration.timeResolution).toEqual(5);
//   expect(exploration.getTimeStep(new Date(entities[0].observedAt))).toEqual(0);
//   expect(exploration.getTimeStep(new Date(entities[5].observedAt))).toEqual(24);
// });

// test.only('generateAtomics - time index daily', () => {
//   const observedAts = [
//     '2000-01-01 00:00:00',
//     '2000-01-02 00:00:01',
//     '2000-01-03 00:00:02',
//     '2000-01-04 00:00:03',
//     '2000-01-05 00:00:04',
//     '2000-01-08 00:00:05', // need more than a week
//   ];
//   const entities = observedAts.map((observedAt, i) => {
//     return new Entity({
//       id: `${i}`,
//       observedAt,
//       type: 'Test',
//       properties: {
//         volume: {
//           type: 'Property',
//           value: 10,
//         },
//       },
//       relationships: {
//         downstream: {
//           type: 'Relationship',
//           object: '1',
//         },
//       },
//     });
//   });
//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['Test'],
//   });
//   const atomics = exploration.generateAtomics(entities);
//   expect(atomics.length).toEqual(6);
//   expect(exploration.startDate.getFullYear()).toEqual(2000);
//   expect(exploration.startDate.getDate()).toEqual(1);
//   expect(exploration.endDate.getDate()).toEqual(8);
//   expect(exploration.timeResolution).toEqual(4);
//   expect(exploration.getTimeStep(new Date(entities[0].observedAt))).toEqual(0);
//   expect(exploration.getTimeStep(new Date(entities[5].observedAt))).toEqual(7);
// });

// test.skip('generateAtomics - time index monthly', () => {
//   const observedAts = [
//     '2000-01-01 00:00:00',
//     '2000-02-02 00:00:01',
//     '2001-03-03 00:00:02',
//     '2005-04-04 00:00:03',
//     '2005-05-05 00:00:04',
//     '2006-01-01 00:00:05', // need more than a few hundred months but less than 10 years
//   ];
//   const entities = observedAts.map((observedAt, i) => {
//     return new Entity({
//       id: `${i}`,
//       observedAt,
//       type: 'Test',
//       properties: {
//         volume: {
//           type: 'Property',
//           value: 10,
//         },
//       },
//       relationships: {
//         downstream: {
//           type: 'Relationship',
//           object: '1',
//         },
//       },
//     });
//   });
//   const exploration = new Exploration();
//   exploration.addSelectedProperty('volume');
//   exploration.addRelationship('downstream');
//   exploration.addNode({
//     types: ['Test'],
//   });
//   const atomics = exploration.generateAtomics(entities);
//   expect(atomics.length).toEqual(6);
//   expect(exploration.startDate.getFullYear()).toEqual(2000);
//   expect(exploration.endDate.getFullYear()).toEqual(2006);
//   expect(exploration.timeResolution).toEqual(2);
//   expect(exploration.getTimeStep(new Date(entities[0].observedAt))).toEqual(0);
//   expect(exploration.getTimeStep(new Date(entities[5].observedAt))).toEqual(72);
// });
