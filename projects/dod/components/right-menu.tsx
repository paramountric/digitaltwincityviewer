import { ChangeEvent, Fragment, ReactHTML, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PencilIcon, PlusIcon } from '@heroicons/react/20/solid';
import {
  Edge,
  ForceLayout,
  Node,
  TimeProcessLayout,
} from '@paramountric/entity';
import NodeHierarchyBreadcrumbs from './node-hierarchy-breadcrumbs';
import { validateUntrusted } from '../lib/jdt';
import { useNode } from '../hooks/node';
import { useUi } from '../hooks/ui';
import { useStreams } from '../hooks/streams';
import { useObjects } from '../hooks/objects';
import { useImport } from '../hooks/import';
import { useViewer } from '../hooks/viewer';
import { useGraph } from '../hooks/graph';
import { useExploration } from '../hooks/exploration';
import { useToken } from '../hooks/token';
import { useTypes } from '../hooks/types';

const INSTANCE_PAGINATION = 20;

function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

function formatDate(date: Date) {
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')
  );
}

export default function RightMenu() {
  const {
    state: { showRightMenu, showImportTypeDialog, importTypeStreamId },
    actions: {
      setShowRightMenu,
      setShowLeftMenu,
      setShowImportDataDialog,
      setShowImportTypeDialog,
      setShowEditTypeDialog,
    },
  } = useUi();
  const {
    state: { selectedNodeId },
    actions: { setSelectedNodeViewerId },
  } = useNode();
  const { isLoading } = useStreams();
  const {
    state: { graph },
    actions: { setLayout },
  } = useGraph();
  const {
    actions: { importFromText, setFileType },
  } = useImport();
  const {
    actions: { loadBucket, getBucketLoader },
  } = useObjects();
  const {
    actions: {
      setExplorationData,
      addExplorationData,
      getExplorationNodes,
      getExplorationEdges,
    },
  } = useExploration();
  const {
    state: { loadedTypeMap },
  } = useTypes();
  const tokenData = useToken();
  const { viewer } = useViewer();
  const [explorationCenter, setExplorationCenter] = useState<number[]>([0, 0]);

  const [explorationSteps, setExplorationSteps] = useState<Node[]>([]);

  const node = graph?.findNode(selectedNodeId);

  const validateNodesByReference = (nodes: Node[]) => {
    for (const node of nodes) {
      for (const type of node.types) {
        console.log(type);
        if (loadedTypeMap[type]) {
          const validationErrors = validateUntrusted(
            loadedTypeMap[type].schema,
            node.getData()
          );
          const valid = validationErrors.length === 0;
          if (valid) {
            node.setDataProperty('valid', true);
            console.log('set valid', node);
          } else {
            node.setDataProperty('valid', false);
            node.setDataProperty('validationErrors', validationErrors);
            console.log('set invalid', node);
          }
        } else {
          node.setDataProperty('noSchema', true);
        }
      }
    }
  };

  const zoomToSelectedNodeViewer = () => {
    if (!viewer || !node) {
      return;
    }
    setSelectedNodeViewerId(node.id);
    // set viewState interpolator
    viewer.zoomToNodeViewer(node);
  };

  const clearExploration = () => {
    setExplorationSteps([]);
    addExplorationData([], []);
    setLayout(new ForceLayout({ center: explorationCenter }));
    viewer?.zoomOut(1);
  };

  const exploreSelectedNode = async () => {
    if (!tokenData?.token) {
      console.warn('token is not loaded');
      return;
    }
    if (viewer && node) {
      console.log(node);
      const nodes = [...explorationSteps, node];
      setExplorationSteps(nodes);
      const streamId = node.getPropertyValue('streamId');
      const commitId = node.getPropertyValue('commitId');
      const objectId = node.getPropertyValue('referencedObject');
      if (node.type === 'Group') {
        const type = node.types[0];
        const parentId = node.getPropertyValue('parentId');
        console.log('parentId', parentId);
        const bucketLoader = getBucketLoader(parentId);
        // load the default, to show groups
        if (bucketLoader) {
          const nodes: Node[] = Object.values(bucketLoader.nodeMap);
          validateNodesByReference(nodes);
          const filtered = nodes
            .filter(n => n.types.find(t => t === type))
            .slice(0, INSTANCE_PAGINATION);
          const edges = filtered.map(
            f =>
              new Edge({
                id: `${node.getId()}-${f.getId()}`,
                type: 'LINE',
                sourceId: node.getId(),
                targetId: f.getId(),
                data: {
                  name: 'has instance',
                },
              })
          );

          const existingNodes = getExplorationNodes();
          // console.log('existing nodes', existingNodes);
          // for (const en of existingNodes) {
          //   const pos = viewer.getNodePosition(en);
          //   console.log('pos', pos);
          //   en.x = pos[0];
          //   en.y = pos[1];
          //   en.locked = true;
          // }
          const existingEdges = getExplorationEdges();
          addExplorationData(
            [...existingNodes, ...filtered],
            [...existingEdges, ...edges]
          );
          setLayout(new ForceLayout({ center: explorationCenter }));
        } else {
          console.log('no parent found!');
        }
      } else if (node.type === 'Entity') {
        const propertyNodes = [];
        const propertyValues = node.getPropertyValues();
        const validationPropertyErrors = (
          node.getPropertyValue('validationErrors') || []
        ).reduce((memo: any, err: any) => {
          if (
            err.schemaPath &&
            err.schemaPath[0] === 'properties' &&
            err.schemaPath[1]
          ) {
            memo[err.schemaPath[1]] = true;
          }
          return memo;
        }, {});
        if (validationPropertyErrors) {
          console.log('validaitonErrors', validationPropertyErrors);
        }
        const ignorePropertyKeys = [
          'valid',
          'validationErrors',
          'streamId',
          'parentId',
          'commitId',
          'speckleType',
        ];
        for (const propertyKey of Object.keys(propertyValues)) {
          if (ignorePropertyKeys.find(k => k === propertyKey)) {
            continue;
          }
          const propertyNode = new Node({
            id: `${node.id}-${propertyKey}`,
            type: 'Property',
            types: [propertyKey],
            data: {
              name: `${propertyKey}: ${propertyValues[propertyKey]}`,
            },
          });
          if (validationPropertyErrors[propertyKey]) {
            propertyNode.setDataProperty('valid', false);
          }
          propertyNodes.push(propertyNode);
          const edges = propertyNodes.map(
            n =>
              new Edge({
                id: `${node.getId()}-${n.getId()}`,
                type: 'LINE',
                sourceId: node.getId(),
                targetId: n.getId(),
                data: {
                  name: 'has property',
                },
              })
          );
          const existingNodes = getExplorationNodes();
          // for (const en of existingNodes) {
          //   const pos = viewer.getNodePosition(en);
          //   console.log('pos', pos);
          //   en.x = pos[0];
          //   en.y = pos[1];
          //   en.locked = true;
          // }
          const existingEdges = getExplorationEdges();
          addExplorationData(
            [...existingNodes, ...propertyNodes],
            [...existingEdges, ...edges]
          );
          setLayout(new ForceLayout({ center: explorationCenter }));
        }
      } else {
        // if this is not a base or bucket, use the node itself and its properties for exploration
        // if (!streamId || !objectId) {
        //   const propertyNodes = [];
        //   const propertyValues = node.getPropertyValues();
        //   for (const propertyKey of Object.keys(propertyValues)) {
        //     propertyNodes.push(
        //       new Node({
        //         id: `${node.id}-${propertyKey}`,
        //         type: 'Property',
        //         types: [propertyKey],
        //         data: {
        //           name: `${propertyKey}: ${propertyValues[propertyKey]}`,
        //         },
        //       })
        //     );
        //   }
        //   viewer.zoomToExploreNode(node);
        //   //setShowLeftMenu(true);
        //   console.log(propertyNodes);
        //   setExplorationData(propertyNodes, node);
        //   setLayout(new ForceLayout({ center: explorationCenter }));
        //   return;
        // }
        // the node will keep position since it's being locked when switching layout in the Viewer component
        viewer.zoomToExploreNode(node);
        //setShowLeftMenu(true);
        await loadBucket(streamId, commitId, objectId, tokenData.token);
        const bucketLoader = getBucketLoader(objectId);
        // load the default, to show groups
        if (bucketLoader) {
          const nodes: Node[] = Object.values(bucketLoader.nodeMap);
          validateNodesByReference(nodes);
          setExplorationData(nodes, node);
          const position = viewer.getNodePosition(node);
          const absPos = [Math.abs(position[0]), Math.abs(position[1])];
          setExplorationCenter(absPos);
          setLayout(new ForceLayout({ center: absPos }));
        }
      }
    }
  };

  console.log(node);

  const loadExampleFile = async () => {
    if (!viewer) {
      return;
    }
    zoomToSelectedNodeViewer();
    // const response = await fetch(
    //   'http://localhost:9000/files/ifc/BAS-NOR/BAS-NOR-STR-MOE.ifc'
    // );
    // const parser = new IfcParser();
    // const data = await response.arrayBuffer();
    // const dataView = new Uint8Array(data);
    // const result = await parser.parse(dataView);
    // console.log(result);
    // const nodes = Object.keys(result.productGeo).map(key => {
    //   const product = result.productGeo[key];
    //   return {
    //     id: key,
    //     name: `${key} - ${product[0] ? product[0].referenceId : 'no ref'}`,
    //   };
    // });
    //const text = await response.text();
    // will put entities in import store
    //const nodeMap = importFromText(text);
    // viewer.setImportNodes(
    //   Object.values(nodeMap).filter(
    //     node => node?.bounds && node.bounds[0] !== Infinity
    //   )
    // );
    // setShowImportDataDialog(true);
  };

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('file');
    if (!e?.target?.files) {
      return;
    }
    const file = e?.target?.files[0];
    console.log(file);
    const reader = new FileReader();
    const splits = file.name.split('.');
    console.log(splits);
    setFileType(splits[splits.length - 1]);
    reader.onload = () => {
      const result = reader.result as string;
      importFromText(result);
      setShowImportDataDialog(true);
    };
    reader.onloadstart = p => {
      // this.store.reset();
      // this.store.setIsLoading(true);
    };
    reader.onloadend = p => {
      // this.store.setIsLoading(false);
      // this.store.setIsLoading(false);
      // this.store.render();
      // this.close();
    };
    reader.readAsText(file);
  };

  const handleShowEditTypeDialog = (type: string) => {
    setShowEditTypeDialog(true);
  };

  const handleShowImportTypeDialog = () => {
    if (!node || !node.getPropertyValue('streamId')) {
      return;
    }
    setShowImportTypeDialog(true, node.getPropertyValue('streamId'));
    console.log(node.getPropertyValue('streamId'));
  };

  return (
    <Transition.Root show={Boolean(node) && showRightMenu} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={() => {}}>
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="pointer-events-auto relative w-96">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 left-14 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    className="rounded-full text-gray-300 bg-white hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => setShowRightMenu(false)}
                  >
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="h-full overflow-y-auto bg-white p-8 border-l border-gray-200">
                {/* <div className="mt-4">
                  <NodeHierarchyBreadcrumbs />
                </div> */}
                <div className="space-y-6 pb-16">
                  <div>
                    <div className="mt-4 flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">
                          <span className="sr-only">Details for </span>
                          {node?.getPropertyValue('name')}
                        </h2>
                        <p className="text-sm font-medium text-gray-500">
                          {node?.type || 'NoType'}
                        </p>
                      </div>
                      {/* <button
                        type="button"
                        className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <HeartIcon className="h-6 w-6" aria-hidden="true" />
                        <span className="sr-only">Favorite</span>
                      </button> */}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {node?.getPropertyValue('description') ||
                          'No description'}
                      </p>
                      <button
                        type="button"
                        className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Add description</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Types</h3>
                    <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                      {node?.types.map(type => (
                        <div
                          key={type}
                          className="flex justify-between py-3 text-sm font-medium"
                        >
                          <dt className="text-gray-500">{type}</dt>
                          <dd
                            className="text-blue-400"
                            onClick={() => handleShowEditTypeDialog(type)}
                          >
                            edit
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  {node?.getPropertyValue('createdAt') && (
                    <div>
                      <h3 className="font-medium text-gray-900">History</h3>
                      <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Created</dt>
                          <dd className="text-gray-900">
                            {node &&
                              formatDate(
                                new Date(node?.getPropertyValue('createdAt'))
                              )}
                          </dd>
                        </div>
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Last modified</dt>
                          <dd className="text-gray-900">
                            {node &&
                              formatDate(
                                new Date(node?.getPropertyValue('updatedAt'))
                              )}
                          </dd>
                        </div>
                        {node?.getPropertyValue('authorName') && (
                          <div className="flex justify-between py-3 text-sm font-medium">
                            <dt className="text-gray-500">Author</dt>
                            <dd className="text-gray-900">
                              {node?.getPropertyValue('authorName')}
                            </dd>
                          </div>
                        )}
                        {/* <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">See changes</dt>
                        <dd className="text-gray-900">4032 x 3024</dd>
                      </div> */}
                      </dl>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Speckle connection
                    </h3>
                    <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                      <div className="flex justify-between py-3 text-sm font-medium">
                        <dt className="text-gray-500">Server</dt>
                        <dd className="text-gray-900">
                          {process.env.NEXT_PUBLIC_SPECKLE_SERVER_URL}
                        </dd>
                      </div>
                      {node?.getPropertyValue('streamId') && (
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Stream ID</dt>
                          <dd className="text-gray-900">
                            {node?.getPropertyValue('streamId')}
                          </dd>
                        </div>
                      )}
                      {node?.getPropertyValue('commitId') && (
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Commit ID</dt>
                          <dd className="text-gray-900">
                            {node?.getPropertyValue('commitId')}
                          </dd>
                        </div>
                      )}
                      {node?.getPropertyValue('speckleType') && (
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Speckle Type</dt>
                          <dd className="text-gray-900">
                            {node?.getPropertyValue('speckleType')}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Validation</h3>
                    <dl className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                      {node?.getValidState() && (
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">State</dt>
                          <dd className="text-gray-900">
                            {node?.getValidState()}
                          </dd>
                        </div>
                      )}
                      {node?.getPropertyValue('validationErrors') && (
                        <div className="flex justify-between py-3 text-sm font-medium">
                          <dt className="text-gray-500">Hint</dt>
                          <dd className="text-gray-900">
                            {node
                              ?.getPropertyValue('validationErrors')
                              .map((err: any) => {
                                if (
                                  err.schemaPath &&
                                  err.schemaPath[0] === 'properties' &&
                                  err.schemaPath[1]
                                ) {
                                  return err.schemaPath[1];
                                }
                                return '';
                              })
                              .join(', ')}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  {/* <div>
                    <h3 className="font-medium text-gray-900">Shared with</h3>
                    <ul
                      role="list"
                      className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200"
                    >
                      <li className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                          <img
                            src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=1024&h=1024&q=80"
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            Aimee Douglas
                          </p>
                        </div>
                        <button
                          type="button"
                          className="ml-6 rounded-md bg-white text-sm font-medium text-blue-600 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        >
                          Remove
                          <span className="sr-only"> Aimee Douglas</span>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                          <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=oilqXxSqey&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                          <p className="ml-4 text-sm font-medium text-gray-900">
                            Andrea McMillan
                          </p>
                        </div>
                        <button
                          type="button"
                          className="ml-6 rounded-md bg-white text-sm font-medium text-blue-600 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        >
                          Remove
                          <span className="sr-only"> Andrea McMillan</span>
                        </button>
                      </li>
                      <li className="flex items-center justify-between py-2">
                        <button
                          type="button"
                          className="group -ml-1 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                            <PlusIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="ml-4 text-sm font-medium text-blue-600 group-hover:text-blue-400">
                            Share
                          </span>
                        </button>
                      </li>
                    </ul>
                  </div> */}
                  {/* <div className="flex">
                    <button
                      type="button"
                      className="flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Download
                    </button>
                    <button
                      onClick={loadExampleFile}
                      type="button"
                      className="ml-3 flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      className="ml-3 flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div> */}
                  <div className="flex">
                    {node?.type !== 'Base' &&
                      node?.type !== 'Property' &&
                      !explorationSteps.find(n => n.id === node.id) && (
                        <button
                          type="button"
                          onClick={exploreSelectedNode}
                          className="flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        >
                          {explorationSteps.length > 0
                            ? 'Add to exploration'
                            : 'Explore'}
                        </button>
                      )}
                    {explorationSteps.length > 0 && (
                      <button
                        type="button"
                        onClick={clearExploration}
                        className="ml-3 flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      >
                        Clear
                      </button>
                    )}
                    {/* <button
                      type="button"
                      onClick={zoomToSelectedNodeViewer}
                      className="ml-3 flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      View
                    </button> */}
                  </div>
                </div>
                {node?.type === 'Base' && (
                  <div className="flex">
                    <button
                      type="button"
                      onClick={handleShowImportTypeDialog}
                      className="flex-1 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                      Import type definition
                    </button>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
