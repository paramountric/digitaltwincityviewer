import { useNotes } from '../../hooks/use-notes';
import { useUi } from '../../hooks/use-ui';
import FilterMenuActionPanel from './FilterMenuActionPanel';
import FilterResultPanel from './FilterResultPanel';
import PanelNotes from './PanelNotes';
import PanelPredictions from './PanelPredictions';

type FilterMenuProps = {};

const FilterMenu: React.FC<FilterMenuProps> = () => {
  const { state, actions } = useUi();
  const { state: notesListState } = useNotes();

  return (
    <div className="flex bg-opacity-95 flex-col absolute right-0 z-30 max-h-[calc(100vh-7rem)] p-2 text-gray-700 bg-white border border-gray-300 rounded-l-md top-28 text-m scroll-child">
      <div className="flex flex-col w-full gap-1">
        <div className="ml-2 text-xs">See data for...</div>
        <FilterMenuActionPanel />
      </div>
      <div className="py-2"></div>
      <FilterResultPanel label="Predictions">
        <PanelPredictions />
      </FilterResultPanel>
      <FilterResultPanel
        label={
          <>
            Notes
            <span className="text-xs font-normal">
              ({notesListState.length})
            </span>
          </>
        }
      >
        <PanelNotes />
      </FilterResultPanel>
    </div>
  );
};

export default FilterMenu;
