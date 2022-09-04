import {Disclosure} from '@headlessui/react';
import {ChevronUpIcon} from '@heroicons/react/20/solid';
import {select} from 'd3-selection';
import {scaleBand, scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {getColorFromScale} from '../lib/colorScales';
import {propertyLabels, units, rounding} from '../lib/constants';

type BuildingFeatureEnergyDisplayProps = {};

function formatValue(properties: any, propertyKey: string) {
  let val = properties[propertyKey];
  if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
    val = val.toFixed(rounding[propertyKey]);
  }
  return val;
}

function getIndicatorYears(properties: any, key: string) {
  const y2020 = properties[`${key}2020M2`] || 0;
  const y2030 = properties[`${key}2030M2`] || 0;
  const y2050 = properties[`${key}2050M2`] || 0;
  return [y2020, y2030, y2050];
}

const BuildingFeatureEnergyDisplay: React.FC<
  BuildingFeatureEnergyDisplayProps
> = props => {
  return (
    <Disclosure>
      {({open}) => (
        <>
          <Disclosure.Button className="flex w-full justify-between rounded-md py-2 text-left text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>Energy</span>
            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-2 text-sm text-gray-500">
            Content
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default BuildingFeatureEnergyDisplay;

// // Given a certain building, show energy charts for that building
// const BuildingFeatureEnergyDisplay: React.FC<DisplayProps> = () => {
//   return (
//     <div>
//       <div id={`indicator-display-${key}`}></div>
//       <table className="mb-1">
//         <tbody>
//           {properties.map(key => {
//             const val = formatValue(properties, key);
//             return (
//               <tr key={key}>
//                 <td>{propertyLabels[key] || 'fixme'}:</td>
//                 <td>
//                   ${val || '-'} ${units[key] || ''}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default BuildingFeatureEnergyDisplay;

// //   @property({type: Object})
// //   public properties;

// //   @property({type: String})
// //   public key;

// // if (!this.properties) {
// //   return null;
// // }
// // const {key} = this;
// // const isGhg = key === 'ghgEmissions';
// // const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';

// // const el = this.shadowRoot;
// // select(el).selectAll('svg').remove();
// // const timelineValues = this.getIndicatorYears(key);
// // const max = Math.max(...timelineValues);
// // if (max === 0) {
// //   return;
// // }
// // const years = ['2020', '2030', '2050'];
// // const properties = years.map(year => `${key}${year}`);

// // const margin = {top: 20, right: 0, bottom: 20, left: 0};
// // const width = 250;
// // const height = 80 - margin.top - margin.bottom;
// // const x = scaleBand().domain(years).range([0, width]).padding(0.5);
// // const y = scaleLinear().domain([0, max]).range([height, 0]);

// // const svg = select(el)
// //   .append('svg')
// //   .attr('width', width + margin.left + margin.right)
// //   .attr('height', height + margin.top + margin.bottom)
// //   .append('g')
// //   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
// // svg
// //   .selectAll('.bar')
// //   .data(timelineValues)
// //   .enter()
// //   .append('rect')
// //   .attr('fill', d => getColorFromScale(d, scaleKey))
// //   .attr('stroke', '#999')
// //   .attr('class', 'bar')
// //   .attr('x', function (d, i) {
// //     return x(years[i]);
// //   })
// //   .attr('width', x.bandwidth())
// //   .attr('y', function (d) {
// //     return y(d);
// //   })
// //   .attr('height', function (d) {
// //     return height - y(d);
// //   });

// // svg
// //   .append('text')
// //   .attr('x', width / 2)
// //   .attr('y', 0 - margin.top / 2)
// //   .attr('text-anchor', 'middle')
// //   .style('font-size', '12px')
// //   .style('text-decoration', 'underline')
// //   .text(propertyLabels[key]);

// // svg
// //   .append('g')
// //   .attr('transform', 'translate(0,' + height + ')')
// //   .call(axisBottom(x));

// // svg.append('g').call(axisLeft(y));
