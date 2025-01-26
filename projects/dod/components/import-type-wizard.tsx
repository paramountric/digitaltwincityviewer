import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { CheckIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useUi } from '../hooks/ui';
import { useTypes, Type } from '../hooks/types';
import SetImportTypeDetails, {
  ImportTypeDetails,
} from './set-import-type-details';
import SetImportTypeData, { ImportTypeData } from './set-import-type-data';
import { useStreams } from '../hooks/streams';

const { NEXT_PUBLIC_SPECKLE_SERVER_URL } = process.env;

type Step = {
  id: string;
  name: string;
  status: 'incomplete' | 'complete';
  required: boolean;
};

const steps: Step[] = [
  {
    id: 'import-file',
    name: 'Select JSON Typedef file',
    status: 'incomplete',
    required: true,
  },
  {
    id: 'import-details',
    name: 'Type settings',
    status: 'incomplete',
    required: true,
  },
];

export default function ImportTypeWizard() {
  const {
    state: { importTypeStreamId },
    actions: { setShowImportTypeDialog },
  } = useUi();
  const {
    state: { loadedTypeMap },
    actions: { addType, setTypes },
  } = useTypes();
  const { typeCommits, createBranch, createCommit, createObject } =
    useStreams();
  const [wizardState, setWizardState] = useState<Step[]>(steps);
  const [selectedStep, setSelectedStep] = useState<string>('select-objects');
  const [importTypeDetails, setImportTypeDetails] =
    useState<ImportTypeDetails | null>(null);
  const [importTypeData, setImportTypeData] = useState<ImportTypeData | null>(
    null
  );

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
  const onSetImportTypeData = (importTypeData: ImportTypeData) => {
    setImportTypeData(importTypeData);
    setImportTypeDetails({
      name: importTypeData.fileName,
      description: '',
      saveToStream: false,
    });
    const step =
      wizardState.find(s => s.id === 'import-file') || wizardState[1];
    const rest = wizardState.filter(s => s.id !== step.id);
    step.status = importTypeData.typeDef ? 'complete' : 'incomplete';
    setWizardState([step, ...rest]);
  };
  const onSetImportTypeDetails = (importTypeDetails: ImportTypeDetails) => {
    setImportTypeDetails(importTypeDetails);
    const step =
      wizardState.find(s => s.id === 'import-details') || wizardState[1];
    const rest = wizardState.filter(s => s.id !== step.id);
    console.log(importTypeDetails);
    step.status = importTypeDetails.name ? 'complete' : 'incomplete';
    setWizardState([step, ...rest]);
  };

  const renderContent = () => {
    const step = getCurrentStep();
    let component = <div>content</div>;
    if (selectedStep === 'import-file') {
      component = (
        <SetImportTypeData
          importTypeData={importTypeData}
          onSetImportTypeData={onSetImportTypeData}
        />
      );
    } else if (selectedStep === 'import-details') {
      component = (
        <SetImportTypeDetails
          fileName={importTypeDetails?.name || null}
          onSetImportTypeDetails={onSetImportTypeDetails}
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
  console.log(typeCommits);
  const handleImportType = async () => {
    const { name, description, saveToStream } = importTypeDetails || {};
    const { typeDef, fileName } = importTypeData || {};
    if (!name || !typeDef) {
      console.log('required type data is not loaded');
      return;
    }
    // add type locally
    console.log('add type locally');
    const type: Type = {
      //id: name, // this should be commitId
      name: name,
      schema: typeDef,
    };
    addType(type);
    console.log('current stream', importTypeStreamId);
    if (saveToStream && importTypeStreamId) {
      console.log('trigger reqeusts');
      // if no branch (because it could have been added in other app meanwhile) create branch
      try {
        await createBranch(
          importTypeStreamId,
          'types',
          'This branch should only be used to store schemas for object validation'
        );
      } catch (err) {
        console.log('Branch already exist');
      }
      try {
        const objectId = await createObject(importTypeStreamId, [type]);

        if (objectId) {
          const previousTypeCommitId = typeCommits.reduce(
            (latest: string, commit) => {
              if (commit.streamId === importTypeStreamId) {
                latest = commit.id;
              }
              return latest;
            },
            ''
          );
          await createCommit(
            importTypeStreamId,
            'types',
            objectId,
            `The type ${name} was created from BaseBucket`,
            'BaseBucket',
            1,
            previousTypeCommitId ? [previousTypeCommitId] : null
          );
        }
        setShowImportTypeDialog(false, null);
      } catch (err) {
        console.log('error creating type object', err);
      }
    }
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
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-400 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 sm:ml-3 sm:w-auto sm:text-sm"
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
          onClick={handleImportType}
        >
          Import type
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
          onClick={() => setShowImportTypeDialog(false, null)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
