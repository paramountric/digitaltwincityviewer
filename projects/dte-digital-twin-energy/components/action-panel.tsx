import {useIndicators} from '../hooks/indicators';
import {useBaseMapData} from '../hooks/data';
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
  const {
    baseMapKeyOptions,
    actions: baseMapActions,
    state: baseMapState,
  } = useBaseMapData();

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
        name={`Climate: ${indicatorState.selectedYear}`}
        selectedKey={indicatorState.selectedYear}
        options={yearOptions.map((year: string) => ({key: year, label: year}))}
      ></ActionPanelMenu>
      <ActionPanelMenu
        onSelect={baseMapActions.setBaseMapKey}
        name={`Basemap: ${baseMapState.baseMapKey}`}
        selectedKey={baseMapState.baseMapKey}
        options={baseMapKeyOptions}
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
