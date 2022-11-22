import React, {Fragment} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {useUi} from '../hooks/use-ui';
import {useViewer} from '../hooks/use-viewer';
import {useLayers} from '../hooks/use-layers';
import modulesConfig from '../lib/dtcc-modules-conf.json';

export default function CreateFlowDialog() {
  const {
    state,
    actions: {setShowCreateFlowDialog, setIsLoading},
  } = useUi();
  const {
    state: viewerState,
    actions: {setCity, setCenter, setActiveDataSet},
  } = useViewer();
  const {
    actions: {addLayer, resetLayers},
  } = useLayers();

  const handleExecuteFlow = async flowSetting => {};

  // const exampleFlowSettings = [
  //   {
  //     name: 'Hello world',
  //     key: 'hello-world',
  //     modules: [
  //       {
  //         id: 'hello-world',
  //         name: 'Hello world module',
  //         description: 'This flow will just return a text string',
  //         input: [],
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Generate mesh',
  //     key: 'generate-mesh',
  //     modules: [
  //       {
  //         id: 'dtcc-builder',
  //         name: 'DTCC Builder',
  //         description:
  //           'This flow generates different meshes from the given files',
  //         input: [
  //           {
  //             type: 'Shapefile (zip)',
  //             description: 'Shapefile with building footprint polygons',
  //           },
  //           {
  //             type: 'Point cloud (las, laz)',
  //             description: 'Point cloud data covering the are of the shapefile',
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  return (
    <Transition.Root show={state.showCreateFlowDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-30"
        onClose={() => setShowCreateFlowDialog(false)}
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

        <div className="fixed inset-0 z-20 overflow-y-auto">
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
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 hover:ring-1 hover:ring-gray-400 focus:outline-none"
                    onClick={() => setShowCreateFlowDialog(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Select tools
                </Dialog.Title>
                <nav className="h-full overflow-y-auto mt-8">
                  {modulesConfig.modules.map(flowSetting => {
                    return (
                      <div
                        key={flowSetting.name}
                        className="relative hover:bg-gray-100 border-white rounded-md border hover:border-slate-100 hover:cursor-pointer m-2"
                      >
                        <div className="sticky rounded text-white top-0 z-10  bg-slate-500 px-6 py-1 text-md font-medium">
                          <h3>{flowSetting.name}</h3>
                        </div>
                        <p className="text-sm m-4">
                          Description: {flowSetting.description}
                        </p>
                        {/* <p className="ml-4 mt-2">Modules</p>
                        <ul
                          role="list"
                          className="relative z-0 divide-y divide-gray-200"
                        >
                          {flowSetting.modules.map(module => (
                            <li key={module.id}>
                              <div className="relative flex items-center space-x-3 px-6 py-5 ">
                                <div className="min-w-0 flex-1">
                                  <span
                                    className="absolute inset-0"
                                    aria-hidden="true"
                                  />
                                  <p className="text-sm font-medium text-gray-900">
                                    {module.name}
                                  </p>
                                  <p className="truncate text-sm text-gray-500">
                                    {module.description}
                                  </p>
                                  {module.input.length > 0 ? (
                                    <div>
                                      {module.input.map(input => (
                                        <span
                                          key={module.id}
                                          className="text-sm rounded-full p-1 px-2 mr-1 text-white bg-slate-400"
                                        >
                                          {input.type}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm italic">
                                      No required input
                                    </p>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul> */}
                      </div>
                    );
                  })}
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
