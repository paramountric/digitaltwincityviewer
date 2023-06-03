import { useUi } from '../../hooks/use-ui';
import { useSelectedFeature } from '../../hooks/use-selected-feature';
import FilterPredictionsSingleBuildingPanel from './FilterPredictionsSingleBuildingPanel';
import FilterPredictionsSelectionPanel from './FilterPredictionsSelectionPanel';

export default function PanelPredictions() {
  const { actions: uiActions, state: uiState } = useUi();
  const { state: selectedFeature } = useSelectedFeature();

  const { selectedFilterBuildingOption, filterButton } = uiState;

  const showBuilding =
    filterButton === 'buildings' &&
    selectedFeature &&
    selectedFilterBuildingOption === 'single';

  // this is what needs to come out from the filter run in use-viewer
  const featureData = {};

  return (
    <div>
      <FilterPredictionsSelectionPanel featureData={featureData} />
      {showBuilding ? (
        <FilterPredictionsSingleBuildingPanel feature={selectedFeature} />
      ) : null}
    </div>
  );
}
