import { useUi } from '../../hooks/use-ui';
import {
  degreeLabels,
  degreeOptions,
  propertyKeyOptions,
  propertyLabels,
  yearLabels,
  yearOptions,
} from '../../lib/constants';
import Dropdown from '../Dropdown';

export default function ScenarioEnergy() {
  const { actions: uiActions, state: uiState } = useUi();

  return (
    <>
      <div className="inline-flex justify-center text-xs font-medium text-gray-700 focus:outline-none">
        See the
      </div>
      <Dropdown
        onSelect={uiActions.setSelectedPropertyKey}
        name={propertyLabels[uiState.selectedPropertyKey] || 'energy'}
        selectedKey={uiState.selectedPropertyKey}
        options={propertyKeyOptions}
        roundedClass="rounded-md"
      />
      <div className="inline-flex justify-center text-xs font-medium text-gray-700 focus:outline-none">
        for the city of
      </div>
      <Dropdown
        onSelect={uiActions.setSelectedYearKey}
        name={yearLabels[uiState.selectedYearKey] || 'year'}
        selectedKey={uiState.selectedYearKey}
        options={yearOptions}
        roundedClass="rounded-md"
      />
      <div className="inline-flex text-xs font-medium text-gray-700 justify-centerbg-white focus:outline-none">
        given a temperature rise of
      </div>
      <Dropdown
        onSelect={uiActions.setSelectedBaseMapKey}
        name={
          degreeLabels[uiState.selectedDegreeKey] || 0
            ? `${degreeLabels[uiState.selectedDegreeKey]}`
            : 'degrees'
        }
        selectedKey={uiState.selectedDegreeKey}
        options={degreeOptions}
        roundedClass="rounded-md"
      />
    </>
  );
}
