import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useUi } from '../../hooks/use-ui';
import logo from '../../public/logo-dte.png';
import Image from 'next/image';

export default function InfoHeader() {
  const { state: uiState, actions: uiActions } = useUi();
  return (
    <Transition.Root show={uiState.showInfoHeader} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          uiActions.setShowInfoHeader(false);
        }}
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
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-sm lg:max-w-2xl sm:p-6">
                <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 lg:px-8">
                  {/* <h1 className="text-3xl font-semibold">
                    Project information
                  </h1> */}
                  <div className="items-center gap-6 text-gray-700">
                    Daniela to come back with info here
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
