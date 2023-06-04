import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import FilterResultPanel from './FilterResultPanel';
import { useViewer } from '../../hooks/use-viewer';
import { useUi } from '../../hooks/use-ui';
import { useFilteredFeatures } from '../../hooks/use-filtered-features';
import { useFilterCategories } from '../../hooks/use-filter-categories';
import { filterCategoryLabels } from '../../lib/constants';

export default function PanelBuilding() {
  const { viewer, getFeatureCategories } = useViewer();
  const { actions: uiActions, state: uiState } = useUi();
  const {
    state: filteredFeatures,
    actions: { setFilteredFeatures },
  } = useFilteredFeatures();
  const { state: filterCategories } = useFilterCategories();

  const handleSetSelectedFeatures = (selectionCategory: any) => {
    console.log('selectionCategory', selectionCategory);
    setFilteredFeatures(Object.values(selectionCategory));
  };

  return (
    <div className=" max-w-prose">
      {Object.keys(filterCategories).map((category: any) => (
        <FilterResultPanel
          key={category}
          label={filterCategoryLabels[category] || category}
        >
          {Object.keys(filterCategories[category]).map(
            (key: any, i: number) => (
              <div key={key} className="flex items-center mb-4">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value=""
                  onClick={() => {
                    handleSetSelectedFeatures(filterCategories[category][key]);
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="default-checkbox"
                  className="ml-2 text-sm font-medium text-gray-900"
                >
                  {`${key} (${
                    Object.values(filterCategories[category][key]).length
                  })`}
                </label>
              </div>
            )
          )}
        </FilterResultPanel>
      ))}
    </div>
  );
}
