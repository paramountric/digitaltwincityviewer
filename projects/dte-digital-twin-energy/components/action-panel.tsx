import {useIndicators} from '../hooks/indicators';
import {useProtectedData} from '../hooks/data';
import ActionPanelMenu from './action-panel-menu';
import {propertyLabels} from '../lib/constants';

type ActionPanelProps = {};
const ActionPanel: React.FC<ActionPanelProps> = () => {
  const {
    state: indicatorState,
    actions: indicatorActions,
    propertyKeyOptions,
    yearOptions,
  } = useIndicators();
  const {scenarioKey, setScenarioKey, scenarioKeyOptions} = useProtectedData();

  return (
    <div className="absolute flex justify-center w-full top-16 z-20">
      <ActionPanelMenu
        onSelect={indicatorActions.setPropertyKey}
        name={`Energy indicator: ${propertyLabels[indicatorState.propertyKey]}`}
        selectedKey={indicatorState.propertyKey}
        options={propertyKeyOptions}
      ></ActionPanelMenu>
      <ActionPanelMenu
        onSelect={indicatorActions.setSelectedYear}
        name={`Year: ${indicatorState.selectedYear}`}
        selectedKey={indicatorState.selectedYear}
        options={yearOptions.map((year: string) => ({key: year, label: year}))}
      ></ActionPanelMenu>
      <ActionPanelMenu
        onSelect={setScenarioKey}
        name={`Basemap: ${scenarioKey}`}
        selectedKey={scenarioKey}
        options={scenarioKeyOptions}
      ></ActionPanelMenu>
    </div>
  );
};

{
  /* <div className="absolute top-16 z-10">
      <span>{getPropertyLabel()}</span>
      {propertyKeyOptions.map(option => (
        <button key={option.key} onClick={() => setPropertyKey(option.key)}>
          {option.label}
        </button>
      ))}

      <span>{selectedYear}</span>
      {yearOptions.map(option => (
        <button key={option} onClick={() => setSelectedYear(option)}>
          {option}
        </button>
      ))}
    </div> */
}

export default ActionPanel;
