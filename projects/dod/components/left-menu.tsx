import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNode } from '../hooks/node';
import { useUi } from '../hooks/ui';
import { useStreams } from '../hooks/streams';
import AddDataPanel from './add-data-panel';
import ExploreDataPanel from './explore-data-panel';
import { useGraph } from '../hooks/graph';
import { useViewer } from '../hooks/viewer';

export default function LeftMenu() {
  const {
    state: { showLeftMenu, leftMenuPanel },
    actions: { setShowLeftMenu },
  } = useUi();
  const {
    state: { selectedNodeId },
  } = useNode();
  const { isLoading } = useStreams();
  const {
    state: { graph },
  } = useGraph();
  const { viewer } = useViewer();

  const node = graph?.findNode(selectedNodeId);

  const closeMenu = () => {
    viewer?.zoomOut();
    setShowLeftMenu(false);
  };

  const renderLeftMenuPanel = () => {
    if (!node) {
      return null;
    }
    switch (leftMenuPanel) {
      case 'explore':
        return <ExploreDataPanel node={node}></ExploreDataPanel>;
      case 'add-data':
        return <AddDataPanel node={node}></AddDataPanel>;
    }
  };

  return (
    <Transition.Root show={Boolean(node) && showLeftMenu} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={() => {}}>
        <div className="pointer-events-none fixed inset-y-0 -left-96 flex max-w-full pr-10">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="translate-x-0"
            enterTo="translate-x-full"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="translate-x-full"
            leaveTo="translate-x-0"
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
                <div className="absolute top-0 right-14 flex pt-4 pl-2 sm:-mr-10 sm:pl-4">
                  <button
                    type="button"
                    className="rounded-full text-gray-300 bg-white hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={closeMenu}
                  >
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="h-full overflow-y-auto bg-white p-8 border-r border-gray-200">
                {renderLeftMenuPanel()}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
