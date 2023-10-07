import ItemLayers from './ItemLayers';
import LeftMenuItem from './LeftMenuItem';
import {
  Square2StackIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';

const TempItemLayers = () => {
  return (
    <div className="italic text-gray-400">
      Suggested feature: to toggle diffrent map layers
    </div>
  );
};

const TempItemImport = () => {
  return (
    <div className="italic text-gray-400">
      Suggested feature: to import data from files, for example Excel and
      Shapefile
    </div>
  );
};

const TempItemExport = () => {
  return (
    <div className="italic text-gray-400">
      Suggested feature: to export data to file
    </div>
  );
};

const TempItemSave = () => {
  return (
    <div className="italic text-gray-400">
      Suggested feature: to save different selections/views in the application
      for quick access
    </div>
  );
};

export default function LeftMenu() {
  const {
    state: { showInfoModal },
    actions: { setShowInfoModal },
  } = useUi();
  return (
    <div className="absolute z-30 flex flex-col gap-4 py-8 rounded-md top-20 text-m">
      <LeftMenuItem
        label="Layers"
        icon={<Square2StackIcon className="w-6 h-6" />}
      >
        <TempItemLayers />
      </LeftMenuItem>
      <LeftMenuItem
        label="Import"
        icon={<ArrowUpOnSquareIcon className="w-6 h-6 rotate-90" />}
      >
        <TempItemImport />
      </LeftMenuItem>
      <LeftMenuItem
        label="Export"
        icon={<ArrowDownOnSquareIcon className="w-6 h-6" />}
      >
        <TempItemExport />
      </LeftMenuItem>
      <LeftMenuItem
        label="Save"
        icon={<ArrowDownTrayIcon className="w-6 h-6" />}
      >
        <TempItemSave />
      </LeftMenuItem>
      <div
        className={
          'flex items-center px-2 py-3 m-0 text-sm font-medium text-white transition bg-gray-700 hover:bg-gray-500 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 rounded-r-xl w-32'
        }
        onClick={() => setShowInfoModal(!showInfoModal)}
      >
        Info
      </div>
    </div>
  );
}
