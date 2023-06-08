import { useState, useEffect } from 'react';
import { useNotes } from '../../hooks/use-notes';
import { useUi } from '../../hooks/use-ui';
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

type FilterMenuProps = {};

const FilterMenu: React.FC<FilterMenuProps> = () => {
  const { state: uiState, actions } = useUi();
  const { state: notesListState } = useNotes();
  // const [selectedFeature, setSelectedFeature] = useState(null);
  // const { state: selectedFeature } = useSelectedFeature();
  const { state: filteredFeatures } = useFilteredFeatures();

  // useEffect(() => {
  //   console.log('filteredFeatures', filteredFeatures);
  //   if (filteredFeatures.features && filteredFeatures.features.length === 1) {
  //     setSelectedFeature(filteredFeatures.features[0]);
  //   } else {
  //     setSelectedFeature(null);
  //   }
  // }, [filteredFeatures]);

  const { selectedFilterBuildingOption, filterButton, showScenario } = uiState;
  const { aggregatedFeature, features } = filteredFeatures;
  const selectedFeature = features?.length === 1 ? features[0] : null;

  const allBuildingsFeature = {
    type: 'Feature',
    properties: {
      name: 'Gothenburg',
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

  console.log('selectedFeature', selectedFeature);

  const showBuilding =
    filterButton === 'buildings' &&
    selectedFeature &&
    (selectedFilterBuildingOption === 'single' || !showScenario);

  const showSelection =
    filterButton === 'buildings' &&
    selectedFilterBuildingOption === 'selection';

  const showAggregation = filterButton !== 'buildings';

  return (
    <div className="flex bg-opacity-95 flex-col absolute right-0 z-30 max-h-[calc(100vh-7rem)] p-2 text-gray-700 bg-white border border-gray-300 rounded-l-md top-28 text-m scroll-child">
      {showScenario && (
        <div className="flex flex-col w-full gap-1">
          <div className="ml-2 text-xs">See data for...</div>
          <FilterMenuActionPanel />
        </div>
      )}
      {/* OVERVIEW */}
      <div className="py-2">
        {showBuilding && <InfoPanelSingleBuilding feature={selectedFeature} />}
        {showSelection && (
          <InfoPanelSelectedBuildings feature={aggregatedFeature} />
        )}
        {showAggregation && (
          <InfoPanelAggregationFeature feature={aggregatedFeature} />
        )}
        {/* Default info is the 'all buildings' */}
        {!showBuilding && !showSelection && !showAggregation && (
          <InfoPanelAllBuildings feature={allBuildingsFeature} />
        )}
      </div>
      {/* THIS IS THE EXTRA PANEL WHEN SELECTION FOR FILTER SHOULD BE DONE */}
      {showScenario && showSelection && (
        <FilterResultPanel label="Select buildings">
          <PanelSelection />
        </FilterResultPanel>
      )}
      {/* PREDICTIONS - RESULT FROM FILTERING (how to do with isOpen??? is there a way to set it dynamically? */}
      {showScenario && (
        <FilterResultPanel isOpen={uiState.showScenario} label="Predictions">
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
  );
};

export default FilterMenu;
