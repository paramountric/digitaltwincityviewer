import ItemLayers from './ItemLayers';
import LeftMenuItem from './LeftMenuItem';
import {
  Square3Stack3DIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/20/solid';

export default function LeftMenu() {
  return (
    <div className="absolute z-30 flex flex-col gap-4 py-8 rounded-md top-20 text-m">
      <LeftMenuItem
        label="Layers"
        icon={<Square3Stack3DIcon className="w-6 h-6" />}
      >
        <ItemLayers />
      </LeftMenuItem>
      <LeftMenuItem
        label="Import"
        icon={<ArrowUpOnSquareIcon className="w-6 h-6 rotate-90" />}
      >
        <ItemLayers />
      </LeftMenuItem>
      <LeftMenuItem
        label="Export"
        icon={<ArrowDownOnSquareIcon className="w-6 h-6" />}
      >
        <ItemLayers />
      </LeftMenuItem>
      <LeftMenuItem
        label="Save"
        icon={<ArrowDownTrayIcon className="w-6 h-6" />}
      >
        <ItemLayers />
      </LeftMenuItem>
    </div>
  );
}
