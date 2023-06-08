import ItemLayers from './ItemLayers';
import LeftMenuItem from './LeftMenuItem';
import {
  Square3Stack3DIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid';

const TempItemLayers = () => {
  return <div>Suggested feature: to toggle diffrent map layers</div>;
};

const TempItemImport = () => {
  return (
    <div>
      Suggested feature: to import data from files, for example Excel and
      Shapefile
    </div>
  );
};

const TempItemExport = () => {
  return <div>Suggested feature: to export data to file</div>;
};

const TempItemSave = () => {
  return (
    <div>
      Suggested feature: to save different selections/views in the application
      for quick access
    </div>
  );
};

export default function LeftMenu() {
  return (
    <div className="absolute z-30 flex flex-col gap-4 py-8 rounded-md top-20 text-m">
      <LeftMenuItem
        label="Layers"
        icon={<Square3Stack3DIcon className="w-6 h-6" />}
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
    </div>
  );
}
