import { useUi } from '../../hooks/use-ui';
import FilterMenuActionPanel from './FilterMenuActionPanel';
import FilterResultPanel from './FilterResultPanel';
import PanelNotes from './PanelNotes';
import PanelPredictions from './PanelPredictions';

type FilterMenuProps = {};

const FilterMenu: React.FC<FilterMenuProps> = () => {
  const { state, actions } = useUi();

  return (
    <div className="absolute right-0 z-30 p-2 text-gray-700 bg-white border border-gray-300 rounded-l-md top-28 text-m">
      <div className="flex justify-between w-full">
        <div className="text-xs">See data for...</div>
      </div>
      <FilterMenuActionPanel />
      <FilterResultPanel />
      <PanelPredictions />
      <PanelNotes />
    </div>
  );
};

export default FilterMenu;
