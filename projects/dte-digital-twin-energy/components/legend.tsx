import {Fragment} from 'react';
import {useIndicators} from '../hooks/indicators';
import {getColorFromScale, getScaleRanges} from '../lib/colorScales';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type LegendProps = {};

const Legend: React.FC<LegendProps> = () => {
  const {getPropertyLabel, getPropertyUnit, propertyKey} = useIndicators();

  const selectedProperty = propertyKey;
  const isGhg = selectedProperty === 'ghgEmissions';
  const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';

  const scaleRanges = getScaleRanges(scaleKey);

  return (
    <div className="absolute p-1 right-2 bottom-2 bg-white grid grid-cols-4 rounded-md border border-gray-300">
      <div className="col-span-2">{getPropertyLabel()}</div>
      <div className="col-span-2 text-xs pt-1 px-1 italic">
        {getPropertyUnit()}
      </div>
      {scaleRanges.map((range, i) => {
        return (
          <Fragment key={i}>
            <div
              className={classNames(
                `bg-energy${i + 1}`,
                'w-8 rounded-sm m-1 col-span-1'
              )}
              key={`c-${i}`}
            ></div>
            <div className="text-xs px-2 col-span-3" key={`r-${i}`}>
              {range[1] === '>'
                ? `${range[1]} ${range[0]}`
                : `${range[0]} - ${range[1]}`}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default Legend;
