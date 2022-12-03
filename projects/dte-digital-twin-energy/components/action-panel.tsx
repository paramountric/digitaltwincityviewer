import {useUi} from '../hooks/use-ui';
import ActionPanelMenu from './action-panel-menu';
import {
  propertyLabels,
  propertyKeyOptions,
  yearLabels,
  yearOptions,
  baseMapLabels,
  baseMapOptions,
} from '../lib/constants';

type ActionPanelProps = {};
const ActionPanel: React.FC<ActionPanelProps> = () => {
  const {actions: uiActions, state: uiState} = useUi();

  return (
    <div className="absolute flex justify-center w-full top-16 z-20">
      <ActionPanelMenu
        onSelect={uiActions.setSelectedPropertyKey}
        name={`Energy indicator: ${
          propertyLabels[uiState.selectedPropertyKey]
        }`}
        selectedKey={uiState.selectedPropertyKey}
        options={propertyKeyOptions}
      ></ActionPanelMenu>
      <ActionPanelMenu
        onSelect={uiActions.setSelectedYearKey}
        name={`Climate: ${yearLabels[uiState.selectedYearKey]}`}
        selectedKey={uiState.selectedYearKey}
        options={yearOptions}
      ></ActionPanelMenu>
      <ActionPanelMenu
        onSelect={uiActions.setSelectedBaseMapKey}
        name={`Basemap: ${baseMapLabels[uiState.selectedBaseMapKey]}`}
        selectedKey={uiState.selectedBaseMapKey}
        options={baseMapOptions}
      ></ActionPanelMenu>
    </div>
  );
};

export default ActionPanel;
