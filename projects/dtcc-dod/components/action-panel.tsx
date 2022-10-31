import ActionPanelMenu from './action-panel-menu';

const actionPanels = [
  {
    name: 'menu1',
    key: 'menu1',
    onSelect: () => {},
    selectedKey: 'key',
    options: [
      {
        key: 'key',
        label: 'Key',
      },
      {
        key: 'key2',
        label: 'Key 2',
      },
    ],
  },
  {
    name: 'menu1',
    key: 'menu2',
    onSelect: () => {},
    selectedKey: 'key',
    options: [
      {
        key: 'key',
        label: 'Key',
      },
      {
        key: 'key2',
        label: 'Key 2',
      },
    ],
  },
];

type ActionPanelProps = {};
const ActionPanel: React.FC<ActionPanelProps> = () => {
  return (
    <div className="absolute flex justify-center w-full top-16 z-20">
      {actionPanels.map(panel => (
        <ActionPanelMenu
          key={panel.key}
          onSelect={panel.onSelect}
          name={panel.name}
          selectedKey={panel.selectedKey}
          options={panel.options}
        ></ActionPanelMenu>
      ))}
    </div>
  );
};

export default ActionPanel;
