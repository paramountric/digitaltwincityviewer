import {useIndicators} from '../hooks/indicators';
import {useBaseMapData} from '../hooks/data';
import ActionPanelMenu from './action-panel-menu';
import {propertyLabels} from '../lib/constants';

const yearLabels: {
  [key: string]: string;
} = {
  '2020': '2020',
  '2050_4_5': '2050 (4.5)',
  '2050_8_5': '2050 (8.5)',
};

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
        name={`Climate: ${yearLabels[indicatorState.selectedYear]}`}
        selectedKey={indicatorState.selectedYear}
        options={yearOptions}
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
