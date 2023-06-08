import { XMarkIcon } from '@heroicons/react/20/solid';
import BuildingFeatureGeneralDisplay from '../BuildingFeature/BuildingFeatureGeneralDisplay';
import BuildingFeatureEnergyDisplay from '../BuildingFeature/BuildingFeatureEnergyDisplay';
// import { useSelectedFeature } from '../../hooks/use-selected-feature';

type RightMenuProps = {};

const RightMenu: React.FC<RightMenuProps> = () => {
  // const {
  //   actions: { getSelectedFeature, setSelectedFeature },
  // } = useSelectedFeature();

  const feature = {}; //getSelectedFeature();

  if (!feature) {
    return null;
  }

  return (
    <div className="absolute z-30 p-2 text-gray-700 bg-white border border-gray-300 rounded-md right-1 top-16 text-m">
      <div className="flex justify-between w-full">
        <div className=""></div>
        {/* <div onClick={() => setSelectedFeature(null)} className="ml-1">
          <XMarkIcon className="w-5 h-5 rounded-md cursor-pointer hover:bg-gray-100" />
        </div> */}
      </div>
      <BuildingFeatureGeneralDisplay
        feature={feature}
      ></BuildingFeatureGeneralDisplay>
      <BuildingFeatureEnergyDisplay
        feature={feature}
      ></BuildingFeatureEnergyDisplay>
    </div>
  );
};

export default RightMenu;
