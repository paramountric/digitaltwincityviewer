import {useUi} from '../hooks/use-ui';

export default function LeftPanel() {
  const {
    actions: {setShowLeftPanel},
  } = useUi();

  return (
    <div className="absolute z-10">
      <div className="flex flex-grow pt-16 pb-6 h-screen flex-col overflow-y-auto border-r border-gray-200 bg-white ">
        <div className="flex flex-grow flex-col">
          <div className="text-center font-medium p-1 text-gray-600">
            Left panel example
          </div>
        </div>
      </div>
    </div>
  );
}
