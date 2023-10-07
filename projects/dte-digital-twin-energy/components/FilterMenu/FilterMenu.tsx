import { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/use-notes';
import { useUi } from '../../hooks/use-ui';
import {
  degreeLabels,
  degreeOptions,
  propertyKeyOptions,
  propertyLabels,
  yearLabels,
  yearOptions,
} from '../../lib/constants';
// import { useSelectedFeature } from '../../hooks/use-selected-feature';
import { useFilteredFeatures } from '../../hooks/use-filtered-features';
import FilterMenuActionPanel from './FilterMenuActionPanel';
import FilterResultPanel from './FilterResultPanel';
import PanelNotes from './PanelNotes';
import PanelPredictions from './PanelPredictions';
import InfoPanelSingleBuilding from './InfoPanelSingleBuilding';
import InfoPanelSelectedBuildings from './InfoPanelSelectedBuildings';
import InfoPanelAllBuildings from './InfoPanelAllBuildings';
import InfoPanelAggregationFeature from './InfoPanelAggregationFeature';
import PanelSelection from './PanelSelection';
import { select } from 'd3-selection';
//

type FilterMenuProps = {};

const FilterMenu: React.FC<FilterMenuProps> = () => {
  const { state: uiState, actions } = useUi();
  const { state: notesListState } = useNotes();
  // const [selectedFeature, setSelectedFeature] = useState(null);
  // const { state: selectedFeature } = useSelectedFeature();
  const { state: filteredFeatures } = useFilteredFeatures();

  // const [title, setTitle] = useState('Gothenburg');

  // useEffect(() => {
  //   console.log('filteredFeatures', filteredFeatures);
  //   if (filteredFeatures.features && filteredFeatures.features.length === 1) {
  //     setSelectedFeature(filteredFeatures.features[0]);
  //   } else {
  //     setSelectedFeature(null);
  //   }
  // }, [filteredFeatures]);

  const {
    selectedFilterBuildingOption,
    selectedFilterGridOption,
    filterButton,
    showScenario,
    selectedRenovationOption,
    selectedDegreeKey,
  } = uiState;
  const { aggregatedFeature, features } = filteredFeatures;
  const selectedFeature = features?.length === 1 ? features[0] : null;

  const allBuildingsFeature = {
    type: 'Feature',
    properties: {
      name: 'Gothenburg',
      size: '447,8 km²',
      population: '631,000',
      empty: '',
      heightAboveSeaLevel: '12 m',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [0, 0],
          [0, 0],
        ],
      ],
    },
  };

  const showBuilding =
    filterButton === 'buildings' &&
    (selectedFilterBuildingOption === 'single' || !showScenario);

  const showSelection =
    filterButton === 'buildings' &&
    selectedFilterBuildingOption === 'selection';

  const showAggregation = filterButton !== 'buildings';

  const renovationLabels = {
    ref: 'selected scenario',
    dr: 'full renovation',
    hr: 'facade and roof renovation',
    er: 'renovation of building installations',
  };

  const initialWord =
    selectedDegreeKey === '0' ? 'Annual values ' : 'Predicted values ';

  const getTitle = () => {
    if (filterButton === 'buildings') {
      if (selectedFilterBuildingOption === 'single') {
        return selectedFeature?.properties.addr || `Selected building`;
      } else if (selectedFilterBuildingOption === 'selection') {
        return `Selected buildings`;
      } else if (selectedFilterBuildingOption === 'all') {
        return selectedFeature?.properties?.name || 'Gothenburg';
      }
    } else if (filterButton === 'grid') {
      if (selectedFilterGridOption === 'grid1km') {
        return `Selected 1 km square`;
      } else if (selectedFilterGridOption === 'grid250m') {
        return `Selected 250 m square`;
      } else if (selectedFilterGridOption === 'grid100m') {
        return `Selected 100 m square`;
      }
    } else if (filterButton === 'districts') {
      return `Selected district`;
    } else if (filterButton === 'baseAreas') {
      return `Selected base area`;
    } else if (filterButton === 'primaryAreas') {
      return `Selected primary area`;
    }
    return 'Gothenburg';
  };

  const getPredictionText = () => {
    const renovationLabel = renovationLabels[selectedRenovationOption];
    if (filterButton === 'buildings') {
      if (selectedFilterBuildingOption === 'single') {
        return `${initialWord} for the selected building ${renovationLabel}`;
      }
      if (selectedFilterBuildingOption === 'selection') {
        return `${initialWord} for ${renovationLabel}`;
      }
      if (selectedFilterBuildingOption === 'all') {
        return `${initialWord}  for ${renovationLabel}`; // all buildings
      }
    } else if (filterButton === 'grid') {
      if (selectedFilterGridOption === 'grid1km') {
        return `${initialWord} for ${renovationLabel}`; //selected 1 km square
      }
      if (selectedFilterGridOption === 'grid250m') {
        return `${initialWord} for ${renovationLabel}`; // selected 250 m square
      }
      if (selectedFilterGridOption === 'grid100m') {
        return `${initialWord} for ${renovationLabel}`; // selected 100 m square
      }
    }
    return `${initialWord} for selected area ${renovationLabel}`;
  };

  // useEffect(() => {
  //   setTitle(getTitle());
  // }, [filterButton, selectedFilterGridOption, selectedFilterBuildingOption]);

  return (
    <div className="max-w-[578px] flex bg-opacity-95 flex-col absolute right-0 z-30 max-h-[calc(100vh-7rem)] p-2 text-gray-700 bg-white border border-gray-300 rounded-l-md top-28 text-m scroll-child">
      {showScenario && (
        <div className="flex flex-col w-full gap-1">
          <div className="ml-2 text-xs">See data for...</div>
          <FilterMenuActionPanel />
        </div>
      )}

      {/* OVERVIEW */}
      <div className="overflow-y-auto scroll-child scroll-px-4">
        <div className="px-2 pb-2 text-xl font-bold">{getTitle()}</div>

        {/* Default info is the 'all buildings' */}
        {!showBuilding && !showSelection && !showAggregation && (
          <InfoPanelAllBuildings feature={allBuildingsFeature} />
        )}

        {/* SELECTION */}
        {showSelection && (
          <>
            {aggregatedFeature ? (
              <FilterResultPanel
                isOpen={showSelection}
                label="Info for the filtered selection"
              >
                <InfoPanelSelectedBuildings feature={aggregatedFeature} />
              </FilterResultPanel>
            ) : (
              <div className="px-2 mb-6 text-xs italic text-gray-500">
                Select the buildings you wish to see the data for below
              </div>
            )}
          </>
        )}

        {/* SINGLE BUILDING */}
        {showBuilding && (
          <>
            {selectedFeature ? (
              <FilterResultPanel
                isOpen={showBuilding}
                label={`Info for the selected building`}
              >
                <InfoPanelSingleBuilding feature={selectedFeature} />
              </FilterResultPanel>
            ) : (
              <div className="px-2 mb-6 text-sm italic text-gray-500">
                Select a building on the map that you wish to see the data for
                below
              </div>
            )}
          </>
        )}

        {/* AGGREGATION */}
        {showAggregation && (
          <>
            {aggregatedFeature?.feature || aggregatedFeature?.properties ? (
              <FilterResultPanel
                isOpen={showAggregation}
                label="Info for the selected area"
              >
                <InfoPanelAggregationFeature feature={aggregatedFeature} />
              </FilterResultPanel>
            ) : (
              <div className="px-2 mb-6 text-sm italic text-gray-500">
                {filterButton === 'districts'
                  ? 'Select a city district on the map'
                  : filterButton === 'grid'
                  ? 'Select a tile on the map'
                  : 'Select an area on the map'}
              </div>
            )}
          </>
        )}

        {/* THIS IS THE EXTRA PANEL WHEN SELECTION FOR FILTER SHOULD BE DONE */}
        {showScenario && showSelection && (
          <FilterResultPanel label="Select buildings">
            <PanelSelection />
          </FilterResultPanel>
        )}
        {/* PREDICTIONS - RESULT FROM FILTERING (how to do with isOpen??? is there a way to set it dynamically? */}
        {showScenario && (
          <FilterResultPanel
            isOpen={uiState.showScenario}
            label={getPredictionText()}
          >
            <PanelPredictions />
          </FilterResultPanel>
        )}
        {/* NOTES */}
        <FilterResultPanel
          label={
            <>
              Notes
              <span className="text-xs font-normal">
                ({notesListState.length})
              </span>
            </>
          }
        >
          <PanelNotes />
        </FilterResultPanel>
      </div>
    </div>
  );
};

export default FilterMenu;
