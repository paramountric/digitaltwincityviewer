import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUi } from '../hooks/ui';
import AddBaseWizard from './add-base-wizard';

// todo:
// 1. select kind of base (ifc, speckle, geojson, etc <- use loaders.gl to add more support quickly)
// 2. loader page for selecting file to upload, link to asset online (gltf, dtcv) or speckle stream, etc
// (let this be pure client loading -> entities, for file import -> use speckle and then use the stream here)
// 3. reload the viewport with new base, keep existing exploration graph
// return (
//   <div>
//     <div>Step 1. select type of Base</div>
//     <div>Step 2. select type source</div>
//     <div>Step 3. loading progress when job imports source into entities</div>
//   </div>

export default function AddBaseDialog() {
  const {
    state,
    actions: { setShowAddBaseDialog },
  } = useUi();

  return (
    <Transition.Root show={state.showAddBaseDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setShowAddBaseDialog(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="md:max-w-7xl md:mx-10 relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                {/*<div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setShowAddBaseDialog(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
  </div>*/}
                <div>
                  <AddBaseWizard />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
