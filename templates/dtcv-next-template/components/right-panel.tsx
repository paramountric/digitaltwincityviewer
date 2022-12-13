import {XMarkIcon} from '@heroicons/react/20/solid';
import {useUi} from '../hooks/use-ui';

type RightPanelProps = {};

const RightPanel: React.FC<RightPanelProps> = () => {
  const {
    actions: {setShowRightPanel},
  } = useUi();

  return (
    <div className="absolute right-1 top-16 bg-white z-30 rounded-md p-2 border text-m text-gray-700 border-gray-300">
      <div className="flex justify-between w-full">
        <div className="">Selected object</div>
        <div onClick={() => setShowRightPanel(false)} className="ml-1">
          <XMarkIcon className="h-5 w-5 cursor-pointer hover:bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
