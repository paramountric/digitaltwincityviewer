import {XMarkIcon} from '@heroicons/react/20/solid';
import BuildingFeatureGeneralDisplay from './building-feature-general-display';
import BuildingFeatureEnergyDisplay from './building-feature-energy-display';
import {useSelectedFeature} from '../hooks/use-selected-feature';

type RightMenuProps = {};

const RightMenu: React.FC<RightMenuProps> = () => {
  const {
    actions: {getSelectedFeature, setSelectedFeature},
  } = useSelectedFeature();

  const feature = getSelectedFeature();

  if (!feature) {
    return null;
  }

  return (
    <div className="absolute right-1 top-16 bg-white z-30 rounded-md p-2 border text-m text-gray-700 border-gray-300">
      <div className="flex justify-between w-full">
        <div className="">
          {feature.properties?.name ||
            feature.properties?.address ||
            feature.properties?.uuid ||
            'Selected building'}
        </div>
        <div onClick={() => setSelectedFeature(null)} className="ml-1">
          <XMarkIcon className="h-5 w-5 cursor-pointer hover:bg-gray-100 rounded-md" />
        </div>
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
