import { useUi } from '../../hooks/use-ui';
import { useSelectedFeature } from '../../hooks/use-selected-feature';
import { useFilteredFeatures } from '../../hooks/use-filtered-features';
import FilterPredictionsSingleBuildingPanel from './FilterPredictionsSingleBuildingPanel';
import FilterPredictionsSelectionPanel from './FilterPredictionsSelectionPanel';

export default function PanelPredictions() {
  const { actions: uiActions, state: uiState } = useUi();
  const { state: selectedFeature } = useSelectedFeature();
  const {
    state: { aggregatedFeature },
  } = useFilteredFeatures();

  const {
    selectedFilterBuildingOption,
    filterButton,
    selectedFilterGridOption,
  } = uiState;

  const showBuilding =
    filterButton === 'buildings' &&
    selectedFeature &&
    selectedFilterBuildingOption === 'single';

  const selectionType = showBuilding
    ? 'building'
    : filterButton === 'buildings' &&
      selectedFilterBuildingOption === 'selection'
    ? 'selection'
    : filterButton === 'grid'
    ? selectedFilterGridOption
    : filterButton;

  let filterMessage = '';

  // any value in the filterMessage will block the prediction panel from showing
  if (!uiState.showScenario) {
    filterMessage = 'Turn on scenario to see predictions';
  } else if (
    uiState.filterButton === 'buildings' &&
    uiState.selectedFilterBuildingOption === 'selection' &&
    !aggregatedFeature
  ) {
    filterMessage = 'Chose the buildnings you want to see above';
  } else if (
    uiState.filterButton === 'buildings' &&
    uiState.selectedFilterBuildingOption === 'single' &&
    !selectedFeature
  ) {
    filterMessage = 'Select building on the map to see predictions';
  } else if (!selectedFeature && !aggregatedFeature) {
    filterMessage = 'Select some option to see predictions';
  } else if (
    uiState.filterButton === 'buildings' &&
    uiState.selectedFilterBuildingOption === 'single'
  ) {
    // todo: validation
  }

  return (
    <div>
      {filterMessage ? (
        <div>{filterMessage}</div>
      ) : (
        <FilterPredictionsSelectionPanel
          feature={showBuilding ? selectedFeature : aggregatedFeature}
          renovationKey={uiState.selectedRenovationOption}
        />
      )}
      {showBuilding ? (
        <FilterPredictionsSingleBuildingPanel
          selectionType={selectionType}
          feature={selectedFeature}
        />
      ) : null}
    </div>
  );
}
