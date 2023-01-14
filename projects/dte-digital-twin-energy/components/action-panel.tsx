import {useUi} from '../hooks/use-ui';
import ActionPanelMenu from './action-panel-menu';
import {
  propertyLabels,
  propertyKeyOptions,
  yearLabels,
  yearOptions,
  degreeLabels,
  degreeOptions,
} from '../lib/constants';

type ActionPanelProps = {};
const ActionPanel: React.FC<ActionPanelProps> = () => {
  const {actions: uiActions, state: uiState} = useUi();

  return (
    <div className="absolute flex justify-center w-full top-16 z-20">
      <div className="mr-1">
        <div className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 mt-1 text-sm font-medium text-gray-700 shadow-sm focus:outline-none">
          See the
        </div>
      </div>
      <ActionPanelMenu
        onSelect={uiActions.setSelectedPropertyKey}
        name={propertyLabels[uiState.selectedPropertyKey] || 'energy'}
        selectedKey={uiState.selectedPropertyKey}
        options={propertyKeyOptions}
      ></ActionPanelMenu>
      <div className="mr-1">
        <div className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 mt-1 text-sm font-medium text-gray-700 shadow-sm focus:outline-none">
          for
        </div>
      </div>
      <ActionPanelMenu
        onSelect={uiActions.setSelectedYearKey}
        name={yearLabels[uiState.selectedYearKey] || 'year'}
        selectedKey={uiState.selectedYearKey}
        options={yearOptions}
      ></ActionPanelMenu>
      <div className="mr-1">
        <div className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 mt-1 text-sm font-medium text-gray-700 shadow-sm focus:outline-none">
          given the temperature rise of
        </div>
      </div>
      <ActionPanelMenu
        onSelect={uiActions.setSelectedBaseMapKey}
        name={
          degreeLabels[uiState.selectedDegreeKey] || 0
            ? `${degreeLabels[uiState.selectedDegreeKey]} degrees`
            : 'degrees'
        }
        selectedKey={uiState.selectedDegreeKey}
        options={degreeOptions}
      ></ActionPanelMenu>
    </div>
  );
};

export default ActionPanel;
