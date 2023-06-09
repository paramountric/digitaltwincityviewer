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
  const [selections, setSelections] = useState<any>({});
  const {
    state: filteredFeatures,
    actions: { addFilteredFeatures, removeFilteredFeatures },
  } = useFilteredFeatures();
  const { state: filterCategories } = useFilterCategories();
  const { actions: uiActions } = useUi();

  const handleAddSelectedFeatures = (key: string, selectionCategory: any) => {
    console.log('selectionCategory', selectionCategory);
    // it's to be turned off
    if (selections[key]) {
      removeFilteredFeatures(Object.values(selectionCategory));
    } else {
      addFilteredFeatures(Object.values(selectionCategory));
    }
    uiActions.triggerUpdate();
    setSelections({
      ...selections,
      [key]: !selections[key],
    });
  };

  return (
    <div className="">
      {Object.keys(filterCategories).map((category: any) => (
        <FilterResultPanel
          key={category}
          label={filterCategoryLabels[category] || category}
        >
          <div className="max-h-96 scroll-child">
            {Object.keys(filterCategories[category]).map(
              (key: any, i: number) => (
                <div
                  key={key}
                  className="flex items-center px-2 text-gray-900 hover:bg-gray-200"
                >
                  <label
                    htmlFor="default-checkbox"
                    className="w-full py-2 text-sm font-medium cursor-pointer"
                  >
                    {`${key} (${
                      Object.values(filterCategories[category][key]).length
                    })`}
                  </label>
                  {/* <input
                        id="default-checkbox"
                        type="checkbox"
                        value=""
                        checked={Boolean(selections[key])}
                        onChange={() => {
                          handleAddSelectedFeatures(
                            key,
                            filterCategories[category][key]
                          );
                        }}
                        className="w-8 h-8 border-gray-300 rounded-full "
                      /> */}
                  <div
                    className={`
              relative cursor-pointer mr-3 flex items-center`}
                    onClick={() => {
                      handleAddSelectedFeatures(
                        key,
                        filterCategories[category][key]
                      );
                    }}
                  >
                    <input
                      type="checkbox"
                      id="default-checkbox"
                      value=""
                      checked={Boolean(selections[key])}
                      className={`w-0 h-0 opacity-0 checked:bg-primary-500 peer`}
                    />
                    <div className="after:checkmark peer-checked:after:block peer-checked:bg-gray-500 border-gray-300 border-[1px] w-6 h-6 rounded-md hover:bg-gray-300" />
                  </div>
                </div>
              )
            )}
          </div>
        </FilterResultPanel>
      ))}
    </div>
  );
}
