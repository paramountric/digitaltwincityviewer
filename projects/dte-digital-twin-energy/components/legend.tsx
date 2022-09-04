import {Fragment} from 'react';
import {useIndicators} from '../hooks/indicators';
import {getColorFromScale, getScaleRanges} from '../lib/colorScales';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type LegendProps = {};

const Legend: React.FC<LegendProps> = () => {
  const {getPropertyLabel, getPropertyUnit, propertyKey} = useIndicators();
  // complete mess, but how to style css dynamically in lit element WITHOUT changing the previous set values (in a list) <- it did not work to apply it in-line is style attribute
  // todo: at least iterate through a range to create the colorbox classes
  // static styles = css`
  //   :host {
  //     z-index: 10;
  //     position: absolute;
  //     background: #fff;
  //     opacity: 1;
  //     bottom: 300px;
  //     right: 5px;
  //     opacity: 0.95;
  //     width: 200px;
  //   }

  //   :host .colorbox-1 {
  //     padding: 10px;
  //     background-color: var(--scale-color-1);
  //   }

  //   :host .colorbox-2 {
  //     padding: 10px;
  //     background-color: var(--scale-color-2);
  //   }

  //   :host .colorbox-3 {
  //     padding: 10px;
  //     background-color: var(--scale-color-3);
  //   }

  //   :host .colorbox-4 {
  //     padding: 10px;
  //     background-color: var(--scale-color-4);
  //   }

  //   :host .colorbox-5 {
  //     padding: 10px;
  //     background-color: var(--scale-color-5);
  //   }

  //   :host .colorbox-6 {
  //     padding: 10px;
  //     background-color: var(--scale-color-6);
  //   }

  //   :host .colorbox-7 {
  //     padding: 10px;
  //     background-color: var(--scale-color-7);
  //   }
  // `;

  const selectedProperty = propertyKey;
  const isGhg = selectedProperty === 'ghgEmissions';
  const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';

  const scaleRanges = getScaleRanges(scaleKey);

  console.log(scaleRanges);

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
