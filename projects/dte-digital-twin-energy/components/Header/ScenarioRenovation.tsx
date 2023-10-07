import { useUi } from '../../hooks/use-ui';
import {
  renovationLabels,
  renovationOptions,
  propertyKeyOptions,
  propertyLabels,
  degreeLabels,
  degreeOptions,
} from '../../lib/constants';
import Dropdown from '../Dropdown';

export default function ScenarioRenovation() {
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
      {/* <Dropdown
        onSelect={uiActions.setSelectedPropertyKey}
        // name={propertyLabels[uiState.selectedPropertyKey] || 'energy'}
        name="Energy"
        selectedKey={'energy'}
        options={[]}
        roundedClass="rounded-md"
      /> */}
      {/* <div className="inline-flex justify-center text-xs font-medium text-gray-700 focus:outline-none">
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
      /> */}
      <div className="inline-flex text-xs font-medium text-gray-700 justify-centerbg-white focus:outline-none">
        if you renovate
      </div>
      <Dropdown
        onSelect={uiActions.setSelectedRenovationKey}
        name={renovationLabels[uiState.selectedRenovationOption]}
        selectedKey={uiState.selectedRenovationOption}
        options={renovationOptions}
        roundedClass="rounded-md"
      />
    </>
  );
}
