import LeftMenuLayersMenu from './left-menu-layers-menu';

export default function LeftMenu() {
  return (
    <div className="absolute top-16 bg-white z-30 rounded-md p-2 border text-m text-gray-700 border-gray-300">
      <LeftMenuLayersMenu />
    </div>
  );
}
