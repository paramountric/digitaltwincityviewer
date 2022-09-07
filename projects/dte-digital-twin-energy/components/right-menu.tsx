import BuildingFeatureGeneralDisplay from './building-feature-general-display';
import BuildingFeatureEnergyDisplay from './building-feature-energy-display';
import {useProtectedData} from '../hooks/data';

type RightMenuProps = {
  selectedFeatureId: string;
};

const RightMenu: React.FC<RightMenuProps> = ({selectedFeatureId}) => {
  const {getFeature} = useProtectedData();

  const feature = getFeature(selectedFeatureId);

  return (
    <div className="absolute right-1 top-16 bg-white z-30 rounded-md p-2 border text-m text-gray-700 border-gray-300">
      <div className="w-full">
        {feature.properties?.name ||
          feature.properties?.address ||
          feature.properties?.uuid ||
          'Selected building'}
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
