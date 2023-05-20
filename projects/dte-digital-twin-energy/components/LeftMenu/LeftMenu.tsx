import Layers from './Layers';
import LeftMenuItem from './LeftMenuItem';

export default function LeftMenu() {
  return (
    <div className="absolute z-30 flex flex-col gap-4 py-8 rounded-md top-20 text-m">
      <LeftMenuItem label="Layers">
        <Layers />
      </LeftMenuItem>
      <LeftMenuItem label="Import">
        <Layers />
      </LeftMenuItem>
      <LeftMenuItem label="Export">
        <Layers />
      </LeftMenuItem>
      <LeftMenuItem label="Save">
        <Layers />
      </LeftMenuItem>
    </div>
  );
}
