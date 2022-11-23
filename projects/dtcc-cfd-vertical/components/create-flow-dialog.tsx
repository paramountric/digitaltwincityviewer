import React, {Fragment, useState} from 'react';
import {Dialog, Transition} from '@headlessui/react';
import {XMarkIcon} from '@heroicons/react/24/outline';
import {useUi} from '../hooks/use-ui';
import {useViewer} from '../hooks/use-viewer';
import {useLayers} from '../hooks/use-layers';
import SelectTool from './select-tool';
import ToolInput from './tool-input';
import RunTool from './run-tool';

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

  const [selectedToolName, setSelectedToolName] = useState<string>('');
  const [selectedCommandName, setSelectedCommandName] = useState<string>('');

  type Step = {
    id: string;
    name: string;
    status: 'current' | 'complete' | 'upcoming';
  };

  const steps: Step[] = [
    {
      id: 'step-1',
      name: 'Select tool',
      status: 'current',
    },
    {
      id: 'step-2',
      name: 'Input',
      status: 'upcoming',
    },
    {id: 'step-3', name: 'Run', status: 'upcoming'},
  ];

  const [stepsState, setStepsState] = useState<Step[]>(steps);

  const setSelectedStep = stepId => {
    const step = stepsState.find(s => s.id === stepId);
    handleSelectStep(step);
  };

  const handleSelectStep = step => {
    const newState = stepsState.map(stepState => {
      if (stepState.id === step.id) {
        return {...stepState, status: 'current'} as Step;
      } else {
        return {
          ...stepState,
          status: stepState.status === 'current' ? 'complete' : 'upcoming',
        } as Step;
      }
      return stepState;
    });
    setStepsState(newState);
  };

  const handleSelectTool = (toolName, commandName) => {
    console.log('toolName', toolName);
    setSelectedStep('step-2');
    setSelectedToolName(toolName);
    setSelectedCommandName(commandName);
  };

  const handleClickRun = () => {
    setSelectedStep('step-3');
  };

  const selectedStep =
    stepsState.find(s => s.status === 'current') || stepsState[0];
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
                <nav aria-label="Progress">
                  <ol
                    role="list"
                    className="space-y-4 md:flex md:space-y-0 md:space-x-8"
                  >
                    {stepsState.map(step => (
                      <li key={step.name} className="md:flex-1">
                        {step.status === 'complete' ? (
                          <a
                            onClick={() => handleSelectStep(step)}
                            className="group flex flex-col border-l-4 border-slate-400 py-2 pl-4 hover:border-slate-800 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
                          >
                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">
                              {step.id}
                            </span>
                            <span className="text-sm font-medium">
                              {step.name}
                            </span>
                          </a>
                        ) : step.status === 'current' ? (
                          <a
                            className="flex flex-col border-l-4 border-slate-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
                            aria-current="step"
                          >
                            <span className="text-sm font-medium text-slate-600">
                              {step.id}
                            </span>
                            <span className="text-sm font-medium">
                              {step.name}
                            </span>
                          </a>
                        ) : (
                          <a className="group flex flex-col border-l-4 border-gray-200 py-2 pl-4 hover:border-gray-300 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                              {step.id}
                            </span>
                            <span className="text-sm font-medium">
                              {step.name}
                            </span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
                <Dialog.Title
                  as="h3"
                  className="text-lg mt-6 font-medium leading-6 text-gray-900"
                >
                  {selectedStep.name}
                </Dialog.Title>
                {selectedStep.id === 'step-1' ? (
                  <SelectTool onSelectTool={handleSelectTool}></SelectTool>
                ) : selectedStep.id === 'step-2' ? (
                  <ToolInput
                    selectedToolName={selectedToolName}
                    selectedCommandName={selectedCommandName}
                    onClickRun={handleClickRun}
                  ></ToolInput>
                ) : (
                  <RunTool></RunTool>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
