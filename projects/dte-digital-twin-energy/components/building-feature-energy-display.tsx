import {useLayoutEffect, useRef, useState} from 'react';
import {Disclosure} from '@headlessui/react';
import {ChevronUpIcon} from '@heroicons/react/20/solid';
import {select} from 'd3-selection';
import {scaleBand, scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {getColorFromScale} from '../lib/colorScales';
import {propertyLabels, units, rounding} from '../lib/constants';

type BuildingFeatureEnergyDisplayProps = {
  feature: any;
};

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

function applyChart(el: HTMLDivElement, properties: any, key: string) {
  const isGhg = key === 'ghgEmissions';
  const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';
  select(el).selectAll('svg').remove();
  const timelineValues = getIndicatorYears(properties, key);
  const max = Math.max(...timelineValues);
  if (max === 0) {
    return;
  }
  const years: string[] = ['2020', '2030', '2050'];
  const yearProperties = years.map(year => `${key}${year}`);

  const margin = {top: 20, right: 0, bottom: 20, left: 0};
  const width = 250;
  const height = 80 - margin.top - margin.bottom;
  const x = scaleBand().domain(years).range([0, width]).padding(0.6);
  const y = scaleLinear().domain([0, max]).range([height, 0]);

  const svg = select(el)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  svg
    .selectAll('.bar')
    .data(timelineValues)
    .enter()
    .append('rect')
    .attr('fill', d => getColorFromScale(d, scaleKey))
    .attr('stroke', '#aaa')
    .attr('stroke-width', '0.5px')
    .attr('class', 'bar')
    .attr('x', (d, i): number => {
      return x(years[i]) as number;
    })
    .attr('width', x.bandwidth())
    .attr('y', function (d) {
      return y(d);
    })
    .attr('height', function (d) {
      return height - y(d);
    });

  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    //.style('text-decoration', 'underline')
    .text(propertyLabels[key]);

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(axisBottom(x));

  svg.append('g').call(axisLeft(y));
}

const BuildingFeatureEnergyDisplay: React.FC<
  BuildingFeatureEnergyDisplayProps
> = props => {
  const indicatorKeys = [
    'deliveredEnergy',
    'finalEnergy',
    'ghgEmissions',
    'heatDemand',
    'primaryEnergy',
  ];
  const deliveredEnergyRef = useRef<HTMLDivElement>(null);
  const finalEnergyRef = useRef<HTMLDivElement>(null);
  const ghgEmissionsRef = useRef<HTMLDivElement>(null);
  const heatDemandRef = useRef<HTMLDivElement>(null);
  const primaryEnergyRef = useRef<HTMLDivElement>(null);
  const [trigger, setTrigger] = useState(-1);
  useLayoutEffect(() => {
    console.log(deliveredEnergyRef);
    if (deliveredEnergyRef.current) {
      applyChart(
        deliveredEnergyRef.current,
        props.feature.properties,
        'deliveredEnergy'
      );
    }
    if (finalEnergyRef.current) {
      applyChart(
        finalEnergyRef.current,
        props.feature.properties,
        'finalEnergy'
      );
    }
    if (ghgEmissionsRef.current) {
      applyChart(
        ghgEmissionsRef.current,
        props.feature.properties,
        'ghgEmissions'
      );
    }
    if (heatDemandRef.current) {
      applyChart(heatDemandRef.current, props.feature.properties, 'heatDemand');
    }
    if (primaryEnergyRef.current) {
      applyChart(
        primaryEnergyRef.current,
        props.feature.properties,
        'primaryEnergy'
      );
    }
  }, [props.feature.properties, trigger]);
  return (
    <Disclosure>
      {({open}) => (
        <>
          <Disclosure.Button
            onClick={() => setTrigger(trigger + 1)}
            className="flex w-full justify-between rounded-md py-2 text-left text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
          >
            <span>Energy</span>
            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-2 text-sm text-gray-500">
            <div id="delivered-energy-bar-chart" ref={deliveredEnergyRef}></div>
            <div id="final-energy-bar-chart" ref={finalEnergyRef}></div>
            <div id="ghg-emissions-bar-chart" ref={ghgEmissionsRef}></div>
            <div id="heat-demand-chart" ref={heatDemandRef}></div>
            <div id="primary-energy-chart" ref={primaryEnergyRef}></div>
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
