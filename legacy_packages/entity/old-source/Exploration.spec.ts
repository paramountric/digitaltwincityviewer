import { Exploration, ExplorationNode } from './Exploration';
import { Entity } from './Entity';
import { EntityGenerator } from './EntityGenerator';

test('create exploration workflow', () => {
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
    numEntities: 10,
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

  const nodeOptions1 = exploration.getNodeOptions(node1.id);

  // suggestions can be made from node data, here volume was found from query
  expect(node1.metadata.foundNumericProperties.volume.count).toEqual(10);
  // for the moment the metadata is sent back for suggestions
  expect(nodeOptions1.foundNumericProperties.volume.count).toEqual(10);

  // user chose to select volume, both a node and a link needs to be created
  const node2 = new ExplorationNode({
    // generates query
    // ALL Volume
    numericPropertyKeys: ['volume'],
  });

  expect(node1.id).not.toEqual(node2.id);

  exploration.addNode(node2, entities, node1);

  expect(exploration.nodes.length).toEqual(1);
  expect(exploration.nodes[0].child).toBeTruthy();

  const sankey1 = exploration.getSankeyInput();

  type sankeyNode = {
    id: string; // group id!
    nodeId: string;
  };

  // // todo: rename link to path
  type sankeyLink = {
    id: string; // group id!,
    linkId: string; // same for several sankey paths
    source: string; // node id
    target: string; // node id (this splitted the link into paths)
  };

  const sankey1Nodes = sankey1.nodes as sankeyNode[];
  const sankey1Links = sankey1.links as sankeyLink[];

  // two nodes with one link between
  expect(sankey1Nodes.length).toEqual(2);
  expect(sankey1Links.length).toEqual(1);
  // id of nodes matches link source / target
  expect(sankey1Nodes[0].id).toEqual(sankey1Links[0].source);
  expect(sankey1Nodes[1].id).toEqual(sankey1Links[0].target);

  // // user chose to select category, this time a link already exist and will be sent in
  const node3 = new ExplorationNode(
    {
      numericPropertyKeys: ['volume'],
      categoricalPropertyKeys: ['category'],
    },
    'category'
  );

  exploration.addNode(node3, entities, node1);

  expect(exploration.nodes[0].child.id).toEqual('volume-category');
  expect(exploration.nodes[0].child.child.id).toEqual('volume');

  const links2 = exploration.linkGroups;

  const sankeyInput = exploration.getSankeyInput();

  expect(links2.size).toEqual(14);
  expect(sankeyInput.nodes.length).toEqual(9);
  expect(sankeyInput.links.length).toEqual(14);

  const node4 = new ExplorationNode(
    {
      numericPropertyKeys: ['volume'],
      categoricalPropertyKeys: ['category2'],
    },
    'category2'
  );

  exploration.addNode(node4, entities, node2);

  const links3 = exploration.linkGroups;

  const sankeyInput2 = exploration.getSankeyInput();

  expect(links3.size).toEqual(20);
  expect(sankeyInput2.nodes.length).toEqual(15);
  expect(sankeyInput2.links.length).toEqual(20);

  // exploration.addLink(node1, node3);
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
