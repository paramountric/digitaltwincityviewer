import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import FilterResultPanel from './FilterResultPanel';
import { useViewer } from '../../hooks/use-viewer';
import { useUi } from '../../hooks/use-ui';

export default function PanelBuilding() {
  const { viewer, getFeatureCategories, setSelectedFeatures } = useViewer();
  const { actions: uiActions, state: uiState } = useUi();

  const { showScenario } = uiState;

  const selectionCategories = useMemo(() => {
    const cat = getFeatureCategories();
    console.log('cat', cat);
    return cat;
  }, [viewer]);

  // todo: move this to constants
  const selectionLabels = {
    hs: 'Heating System',
    own: 'Owner',
    bt: 'Building Type',
  } as any;

  const handleSetSelectedFeatures = (featureIds: any) => {
    console.log('featureIds', featureIds);
    setSelectedFeatures(featureIds);
  };

  return (
    <div className=" max-w-prose">
      {Object.keys(selectionCategories).map((category: any) => (
        <FilterResultPanel
          key={category}
          label={selectionLabels[category] || category}
        >
          {Object.keys(selectionCategories[category]).map(
            (key: any, i: number) => (
              <div key={key} className="flex items-center mb-4">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value=""
                  onClick={() => {
                    handleSetSelectedFeatures(
                      selectionCategories[category][key]
                    );
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="default-checkbox"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  {key}
                </label>
              </div>
            )
          )}
        </FilterResultPanel>
      ))}
    </div>
  );
}
