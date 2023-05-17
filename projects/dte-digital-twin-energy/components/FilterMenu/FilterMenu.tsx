import { useUi } from '../../hooks/use-ui';
import FilterMenuActionPanel from './FilterMenuActionPanel';
import FilterResultPanel from './FilterResultPanel';
import NotesPanel from './NotesPanel';
import PredictionPanel from './PredictionPanel';

type FilterMenuProps = {};

const FilterMenu: React.FC<FilterMenuProps> = () => {
  const { state, actions } = useUi();

  return (
    <div className="absolute z-30 p-2 text-gray-700 bg-white border border-gray-300 rounded-md right-1 top-28 text-m">
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
