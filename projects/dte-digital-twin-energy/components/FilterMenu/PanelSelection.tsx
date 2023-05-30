import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import FilterResultPanel from './FilterResultPanel';
import { useViewer } from '../../hooks/use-viewer';

export default function PanelBuilding() {
  const { viewer, getFeatureCategories } = useViewer();

  const selectionCategories = useMemo(() => {
    return getFeatureCategories();
  }, [viewer]);

  return (
    <div className=" max-w-prose">
      {Object.keys(selectionCategories).map((category: any) => (
        <FilterResultPanel key={category} label={category}>
          {Object.keys(selectionCategories[category]).map((key: any) => (
            <div key={key} className="flex items-center mb-4">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                onClick={() => {
                  console.log('need to set filtered features');
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
          ))}
        </FilterResultPanel>
      ))}
    </div>
  );
}
