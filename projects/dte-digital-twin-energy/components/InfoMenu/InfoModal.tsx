import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useUi } from '../../hooks/use-ui';
import logo from '../../public/logo-dte.png';
import Image from 'next/image';

export default function InfoModal() {
  const { state: uiState, actions: uiActions } = useUi();
  return (
    <Transition.Root show={uiState.showInfoModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          uiActions.setShowInfoModal(false);
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
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 lg:px-8">
                  <h1 className="text-3xl font-semibold">Info Modal</h1>
                  <div className="flex items-center gap-6 py-4">
                    <div className="relative w-20 h-20 shrink-0">
                      <Image
                        src={logo}
                        alt="logo of DTCC"
                        className="object-contain"
                        fill
                        sizes="100%"
                      />
                    </div>
                    <p className="text-sm">
                      The Digital Twin Enegy (DTE) Viewer was developed within
                      the research project "Digital tvilling för att modellera
                      framtida energibehov i Göteborgs byggnadsbestånd: ett
                      verktyg för ökad aktörssamverkan, effektivisering och
                      samordning av energifrågor" funded by the Göteborg Energi
                      foundation for research and development.
                    </p>
                    <p>
                      In the DTE viewer you can visualize energy demand
                      scenarios for the building stock of Gothenburg using
                      climate and building energy modelling.
                    </p>
                    <p>
                      The DTE Viewer is the results of the joint work of
                      Chalmers University of Technology, the Digital Twin City
                      Center, Paramountric, and Sinom. Representatives of the
                      City of Gothenburg through the environmental
                      administration and city planning office; Göteborg Energi,
                      and housing company Framtiden have contributed to the
                      testing phase.
                    </p>
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
