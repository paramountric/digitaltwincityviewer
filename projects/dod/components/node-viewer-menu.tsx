import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUi } from '../hooks/ui';
import { useNode } from '../hooks/node';
import { useViewer } from '../hooks/viewer';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NodeViewerMenu() {
  const {
    state: { selectedNodeViewerId },
    actions: { setSelectedNodeViewerId },
  } = useNode();
  const { viewer } = useViewer();
  const {
    state: { showTimelineX },
  } = useUi();

  if (!selectedNodeViewerId) {
    return null;
  }

  const position = viewer?.calculateViewerPosition();

  if (!position) {
    return null;
  }

  const deselectNode = () => {
    setSelectedNodeViewerId(null);
    if (viewer) {
      viewer.zoomOut();
    }
  };

  return (
    <div className="absolute z-50 top-10 left-50 bg-white p-5 pt-0">
      <button
        type="button"
        className="rounded-full text-gray-300 bg-white hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ top: `${position.x}px`, left: `${position.y}px` }}
        onClick={deselectNode}
      >
        <span className="sr-only">Close panel</span>
        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
