import { useUi } from '../hooks/use-ui';
import FilterMenuActionPanel from './filter-menu-action-panel';
import FilterResultPanel from './filter-result-panel';
import NotesPanel from './notes-panel';
import PredictionPanel from './prediction-panel';

type FilterMenuProps = {};

const FilterMenu: React.FC<FilterMenuProps> = () => {
  const { state, actions } = useUi();

  return (
    <div className="absolute right-1 top-16 bg-white z-30 rounded-md p-2 border text-m text-gray-700 border-gray-300">
      <div className="flex justify-between w-full">
        <div className="text-xs">See data for...</div>
      </div>
      <FilterMenuActionPanel />
      <FilterResultPanel />
      <PredictionPanel />
      <NotesPanel />
    </div>
  );
};

export default FilterMenu;
