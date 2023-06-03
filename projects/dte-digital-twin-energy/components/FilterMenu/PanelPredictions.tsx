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

  return (
    <div>
      <FilterPredictionsSelectionPanel
        feature={showBuilding ? selectedFeature : aggregatedFeature}
      />
      {showBuilding ? (
        <FilterPredictionsSingleBuildingPanel
          selectionType={selectionType}
          feature={selectedFeature}
        />
      ) : null}
    </div>
  );
}
