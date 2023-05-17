import { Fragment } from 'react';
import { useUi } from '../../hooks/use-ui';
import { getColorFromScale, getScaleRanges } from '../../lib/colorScales';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type LegendProps = {};

const Legend: React.FC<LegendProps> = () => {
  const { getPropertyLabel, getPropertyUnit, state: indicatorState } = useUi();

  const selectedProperty = 'energyDeclaration' as string;
  const isGhg = selectedProperty === 'ghgEmissions';
  const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';

  const scaleRanges = getScaleRanges(scaleKey);

  return (
    <div className="absolute px-2 pt-1 pb-2 bg-white border border-gray-300 rounded-md w-36 right-2 bottom-2">
      <div className="w-full text-center text-s">{getPropertyLabel()}</div>
      <div className="w-full mb-3 text-xs text-center">
        ({getPropertyUnit()})
      </div>
      {scaleRanges.map((range, i) => {
        return (
          <div className="flex px-2 text-xs" key={`r-${i}`}>
            <div
              className={classNames(
                `bg-energy${scaleRanges.length - i}`,
                'w-8 rounded-sm m-1 p-1 col-span-1'
              )}
              key={`c-${i}`}
            ></div>
            <span>
              {range[1] === '>'
                ? `${range[1]} ${range[0]}`
                : `${range[0]} - ${range[1]}`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Legend;
