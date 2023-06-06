import { useUi } from '../../hooks/use-ui';
import { solarLabels, solarOptions } from '../../lib/constants';
import Dropdown from '../Dropdown';

export default function ScenarioSolar() {
  const { actions: uiActions, state: uiState } = useUi();

  return (
    <>
      <div className="inline-flex justify-center text-sm font-medium text-gray-700 focus:outline-none">
        Estimate solar power potential of roofs for
      </div>
      <Dropdown
        onSelect={uiActions.setSelectedSolarKey}
        name={solarLabels[uiState.selectedSolarKey]}
        selectedKey={uiState.selectedSolarKey}
        options={solarOptions}
        roundedClass="rounded-md"
      />
    </>
  );
}
