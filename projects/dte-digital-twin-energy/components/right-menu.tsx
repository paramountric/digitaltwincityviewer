import {XMarkIcon} from '@heroicons/react/20/solid';
import BuildingFeatureGeneralDisplay from './building-feature-general-display';
import BuildingFeatureEnergyDisplay from './building-feature-energy-display';
import {useClimateScenarioData} from '../hooks/data';
import {useSelectedFeature} from '../hooks/selected-feature';

type RightMenuProps = {
  selectedFeatureId: string;
};

const RightMenu: React.FC<RightMenuProps> = ({selectedFeatureId}) => {
  const {getFeature} = useClimateScenarioData();
  const {actions} = useSelectedFeature();

  const feature = getFeature(selectedFeatureId);

  return (
    <div className="absolute right-1 top-16 bg-white z-30 rounded-md p-2 border text-m text-gray-700 border-gray-300">
      <div className="flex justify-between w-full">
        <div className="">
          {feature.properties?.name ||
            feature.properties?.address ||
            feature.properties?.uuid ||
            'Selected building'}
        </div>
        <div onClick={() => actions.setFeatureId(null)} className="ml-1">
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
