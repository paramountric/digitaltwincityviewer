import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { CheckIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useUi } from '../hooks/ui';
import SelectBaseType from './select-base-type';
import SetBaseDetails, { BaseDetails } from './set-base-details';

const CREATE_BASE = gql`
  mutation CreateBase(
    $name: String
    $description: String
    $isPublic: Boolean
    $withContributors: [String!]
  ) {
    streamCreate(
      stream: {
        name: $name
        description: $description
        isPublic: $isPublic
        withContributors: $withContributors
      }
    )
  }
`;

type Step = {
  id: string;
  name: string;
  status: 'incomplete' | 'complete';
  required: boolean;
};

const steps: Step[] = [
  {
    id: 'select-base',
    name: 'Select base type',
    status: 'complete', // because it starts preselected... should be changed
    required: true,
  },
  {
    id: 'base-details',
    name: 'Base details',
    status: 'incomplete',
    required: true,
  },
  {
    id: 'upload-data',
    name: 'Upload data',
    status: 'incomplete',
    required: false,
  },
  {
    id: 'invite',
    name: 'Collaboration',
    status: 'incomplete',
    required: false,
  },
];

export default function AddBaseWizard() {
  const {
    state,
    actions: { setShowAddBaseDialog },
  } = useUi();
  const [wizardState, setWizardState] = useState<Step[]>(steps);
  const [selectedStep, setSelectedStep] = useState<string>('select-base');
  const [selectedBaseType, setSelectedBaseType] = useState<number | null>(1);
  const [baseDetails, setBaseDetails] = useState<BaseDetails | null>(null);
  const [createBase, { data }] = useMutation(CREATE_BASE);

  const getCurrentStep = () => {
    return wizardState.find(s => s.id === selectedStep) || selectNextStep();
  };
  const handleSelectStep = (stepId: string) => {
    setSelectedStep(stepId);
  };
  // select first step that is incomplete
  const selectNextStep = () => {
    const step =
      wizardState.find(s => s.status === 'incomplete') ||
      wizardState[wizardState.length - 1];
    setSelectedStep(step.id);
    return step;
  };
  const notComplete = () => {
    return Boolean(
      wizardState.find(s => s.required && s.status === 'incomplete')
    );
  };
  const onSelectBaseType = (value: number) => {
    if (value) {
      setSelectedBaseType(value);
      const step =
        wizardState.find(s => s.id === 'select-base') || wizardState[0];
      const rest = wizardState.filter(s => s.id !== step.id);
      step.status = 'complete';
      setWizardState([step, ...rest]);
    }
    console.log(value);
  };
  const onSetBaseDetails = (baseDetails: BaseDetails) => {
    setBaseDetails(baseDetails);
    const step =
      wizardState.find(s => s.id === 'base-details') || wizardState[1];
    const rest = wizardState.filter(s => s.id !== step.id);
    step.status = baseDetails.name ? 'complete' : 'incomplete';
    setWizardState([step, ...rest]);
  };
  const renderContent = () => {
    const step = getCurrentStep();
    let component = <div>content</div>;
    if (selectedStep === 'select-base') {
      component = <SelectBaseType onSelectBaseType={onSelectBaseType} />;
    } else if (selectedStep === 'base-details') {
      component = (
        <SetBaseDetails
          onSetBaseDetails={onSetBaseDetails}
          baseType={selectedBaseType || 1} // baseType should be defined here
        />
      );
    }
    return (
      <div>
        <h1 className="text-lg text-gray-900 m-10">{step.name}</h1>
        {component}
      </div>
    );
  };
  const handleCreateBase = () => {
    if (!baseDetails) {
      return;
    }
    const { name, description, latitude, longitude } = baseDetails;
    createBase({
      variables: {
        name,
        description,
        isPublic: false,
        //withContributors: [],
      },
    });
  };
  // get a proper next button
  const getNextButton = () => {
    const step = getCurrentStep();
    if (step.status === 'incomplete') {
      return (
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent cursor-not-allowed bg-gray-300 px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          disabled={true}
        >
          Next
        </button>
      );
    } else if (notComplete() && step.status === 'complete') {
      return (
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={selectNextStep}
        >
          Next
        </button>
      );
    } else {
      return (
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={handleCreateBase}
        >
          Create base
        </button>
      );
    }
  };
  return (
    <div>
      <nav aria-label="Progress">
        <ol
          role="list"
          className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="relative md:flex md:flex-1">
              {step.status === 'complete' ? (
                <a
                  onClick={() => handleSelectStep(step.id)}
                  className="group flex w-full items-center"
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-400 group-hover:bg-blue-800">
                      <CheckIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ml-4 text-sm font-medium text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </a>
              ) : (
                <a
                  onClick={() => handleSelectStep(step.id)}
                  className="group flex items-center"
                >
                  <span className="flex items-center px-6 py-4 text-sm font-medium">
                    {step.id !== selectedStep ? (
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                        <span className="text-gray-500 group-hover:text-gray-900">
                          <ChevronRightIcon
                            className="h-6 w-6 text-gray-300"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    ) : (
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-600 group-hover:border-gray-400">
                        <span className="text-gray-500 group-hover:text-gray-900">
                          <ChevronDownIcon
                            className="h-6 w-6 text-gray-600"
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                    )}
                    <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                      {step.name}
                    </span>
                  </span>
                </a>
              )}

              {stepIdx !== steps.length - 1 ? (
                <>
                  {/* Arrow separator for lg screens and up */}
                  <div
                    className="absolute top-0 right-0 hidden h-full w-5 md:block"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-full w-full text-gray-300"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
      {renderContent()}
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        {getNextButton()}
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={() => setShowAddBaseDialog(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
