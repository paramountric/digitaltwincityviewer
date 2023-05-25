import { useUi } from '../../hooks/use-ui';
import { CheckIcon } from '@heroicons/react/24/outline';
import ButtonSwitch from '../ButtonSwitch';
import ScenarioEnergy from './ScenarioEnergy';
import ButtonSelect from '../ButtonSelect';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type ActionPanelProps = {};

const ActionPanel: React.FC<ActionPanelProps> = () => {
  const { actions: uiActions, state: uiState } = useUi();

  const sectionBaseStyle = 'flex items-center justify-center px-4 gap-2';

  const dispalyScenario = () => {
    switch (uiState.scenarioKey) {
      case 'energy':
        return <ScenarioEnergy />;
      case 'solar':
        return <div>Solar</div>;
      case 'renovation':
        return <div>Renovation</div>;
      default:
        return <ScenarioEnergy />;
    }
  };

  return (
    <div className="z-20 flex justify-center divide-x-2 divide-gray-700 w-fit top-16">
      <div className={`${sectionBaseStyle}`}>
        <span className="inline-flex isolate action-panel">
          <ButtonSelect
            label={'Energy'}
            actions={() => uiActions.setScenario('energy')}
            state={uiState.scenarioKey === 'energy'}
          />
          <ButtonSelect
            label={'Solar'}
            actions={() => uiActions.setScenario('solar')}
            state={uiState.scenarioKey === 'solar'}
          />
          <ButtonSelect
            label={'Renovation'}
            actions={() => uiActions.setScenario('renovation')}
            state={uiState.scenarioKey === 'renovation'}
          />
        </span>
      </div>
      <div className={`${sectionBaseStyle}`}>{dispalyScenario()}</div>
      <div className={`${sectionBaseStyle} `}>
        <ButtonSwitch
          label={'SCENARIO OFF'}
          actions={uiActions.setShowScenario}
          state={uiState.showScenario}
        />
      </div>
    </div>
  );
};

export default ActionPanel;
