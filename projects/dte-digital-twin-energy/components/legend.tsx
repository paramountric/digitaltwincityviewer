import {useIndictors} from '../hooks/indicators';
import {getColorFromScale, getScaleRanges} from '../lib/colorScales';

type LegendProps = {};

const Legend: React.FC<LegendProps> = () => {
  const {getPropertyLabel, getPropertyUnit, propertyKey} = useIndictors();
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
    <div className="absolute p-1 right-2 bottom-2 bg-white opacity-90">
      <table>
        <thead>
          <tr>
            <td colSpan={3} className="col-span-2 p-3 font-medium">
              <span className="pr-2">{getPropertyLabel()}</span>
            </td>
          </tr>
        </thead>
        <tbody>
          {scaleRanges.map((range, i) => {
            return (
              <tr key={i}>
                <td className={`bg-energy-${i + 1} w-7`}></td>
                <td className="text-xs px-2">
                  {range[1] === '>'
                    ? `${range[1]} ${range[0]}`
                    : `${range[0]} - ${range[1]}`}
                </td>
                <td className="text-xs">{getPropertyUnit()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Legend;
