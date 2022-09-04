import {useIndicators} from '../hooks/indicators';
import {useProtectedData} from '../hooks/data';
import ActionPanelMenu from './action-panel-menu';

type ActionPanelProps = {};
const ActionPanel: React.FC<ActionPanelProps> = () => {
  const {
    selectedYear,
    setSelectedYear,
    propertyKey,
    setPropertyKey,
    getPropertyLabel,
    propertyKeyOptions,
    yearOptions,
  } = useIndicators();
  const {scenarioKey, setScenarioKey, scenarioKeyOptions} = useProtectedData();

  return (
    <div className="absolute flex justify-center w-full top-16 z-20">
      <ActionPanelMenu
        name="Indicators"
        selectedKey={propertyKey}
        options={propertyKeyOptions}
      ></ActionPanelMenu>
      <ActionPanelMenu
        name="Year"
        selectedKey={selectedYear}
        options={yearOptions.map(year => ({key: year, label: year}))}
      ></ActionPanelMenu>
      <ActionPanelMenu
        name="Scenario"
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
