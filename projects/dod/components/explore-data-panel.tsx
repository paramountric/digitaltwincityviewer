import { Node, ForceLayout } from '@paramountric/entity';
import { useObjects } from '../hooks/objects';
import { useExploration } from '../hooks/exploration';
import { useGraph } from '../hooks/graph';
import { useNode } from '../hooks/node';
import { useViewer } from '../hooks/viewer';

type ExploreDataPanelProps = {
  node: Node;
};

export default function ExploreDataPanel(props: ExploreDataPanelProps) {
  const {
    state: objectLoaders,
    loadingState,
    actions: { getBucketLoader },
  } = useObjects();
  const {
    state: { selectedNodeId },
  } = useNode();
  const {
    state: explorationState,
    actions: { setExplorationData, setIncludeInstances, setIncludeTypes },
  } = useExploration();
  const {
    state: { graph },
    actions: { setLayout },
  } = useGraph();
  const { viewer } = useViewer();

  const node = graph?.findNode(selectedNodeId);
  // A bucket (commit) has a referenceObject id (already loading/loaded when trigger this panel)
  const objectId = props.node.getPropertyValue('referencedObject');

  // If not exist, this is children data of the bucket: EntityNode, EntityTypeNode, EntityGroupNode
  // (the exploration should already be loaded with the default nodes so that this component can render)
  if (objectId) {
    const loader = objectLoaders[objectId];

    if (!loader) {
      console.warn('this is a token error');
      return null;
    }
  }

  const toggleTypes = () => {
    if (!viewer) {
      return;
    }
    setIncludeTypes(!explorationState.includeTypes);
    const bucketLoader = getBucketLoader(objectId);
    if (bucketLoader) {
      const nodes: Node[] = Object.values(bucketLoader.nodeMap);
      setExplorationData(nodes, node);
      // const position = viewer.getNodePosition(node);
      setLayout(new ForceLayout());
    }
  };

  const toggleInstances = () => {
    if (!viewer) {
      return;
    }
    console.log('is', explorationState.includeInstances);
    setIncludeInstances(!explorationState.includeInstances);
    const bucketLoader = getBucketLoader(objectId);
    if (bucketLoader) {
      const nodes: Node[] = Object.values(bucketLoader.nodeMap);
      setExplorationData(nodes, node);
      // const position = viewer.getNodePosition(node);
      setLayout(new ForceLayout());
    }
  };

  const toggleProperties = () => {};

  const toggleRelations = () => {};

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Explore data</h2>
            <p className="text-sm font-medium text-gray-500">
              {props.node?.getPropertyValue('name')}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">Select </h3>
        <p>{(loadingState[objectId] || 0).toFixed()} %</p>
        <p>
          todo: load data with progress indicator. toggle show types by default.
          Enable to toggle all instance. Enable a filter with options (use
          relations: spatial like intersects, etc, validation like validType,
          more) enable to click on group node or instance node to show that in
          right menu
        </p>
      </div>
      <div className="flex">
        {objectId && (
          <button
            type="button"
            onClick={toggleTypes}
            className="flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Show types
          </button>
        )}
        {objectId && (
          <button
            type="button"
            onClick={toggleInstances}
            className="ml-3 flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Show instances
          </button>
        )}
        {!objectId && (
          <button
            type="button"
            onClick={toggleProperties}
            className="ml-3 flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Show properties
          </button>
        )}
        {!objectId && (
          <button
            type="button"
            onClick={toggleRelations}
            className="ml-3 flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Show relations
          </button>
        )}
      </div>
    </div>
  );
}
