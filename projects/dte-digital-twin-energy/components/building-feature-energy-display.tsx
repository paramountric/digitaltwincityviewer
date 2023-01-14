import {useLayoutEffect, useRef, useState} from 'react';
import {Disclosure} from '@headlessui/react';
import {ChevronUpIcon} from '@heroicons/react/20/solid';
import {select} from 'd3-selection';
import {scaleBand, scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {getColorFromScale} from '../lib/colorScales';
import {propertyLabels, units, rounding} from '../lib/constants';
import {useUi} from '../hooks/use-ui';

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

function getIndicatorKeys(selectedYear: string) {
  if (selectedYear === '2050_4_5') {
    return ['2018_4_5', '2030_4_5', '2050_4_5'];
  }

  if (selectedYear === '2050_8_5') {
    return ['2018_8_5', '2030_8_5', '2050_8_5'];
  }

  return ['2020', '2030', '2050'];
}

// kwh/m2 or total ghg/m2
function getIndicatorYears(properties: any, key: string, selectedYear: string) {
  return getIndicatorKeys(selectedYear).map(year => {
    // in case of not m2 - remove M2 from the end (need to update color scale as well)
    const keyAddM2 = `${key}${year}M2`;
    return properties[keyAddM2] || 0;
  });
}

function applyChart(
  el: HTMLDivElement,
  properties: any,
  key: string,
  selectedYear: string
) {
  const isGhg = key === 'ghgEmissions';
  const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';
  const unit = units[`${key}M2`];
  select(el).selectAll('svg').remove();
  const timelineValues = getIndicatorYears(properties, key, selectedYear);
  const max = Math.max(...timelineValues);
  if (max === 0) {
    return;
  }
  // const years: string[] = [
  //   `2020${scenarioPostfix}`,
  //   `2030${scenarioPostfix}`,
  //   `2050${scenarioPostfix}`,
  // ];
  const years: string[] = ['2020', '2030', '2050'];
  //const yearProperties = years.map(year => `${key}${year}`);

  const margin = {top: 20, right: 0, bottom: 20, left: 60};
  const width = 250 - margin.left - margin.right;
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
    .attr('fill', d => getColorFromScale(d, scaleKey, true))
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

  svg.append('g').call(axisLeft(y).ticks(2));

  // text label for the y axis
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('font-size', '10px')
    .style('fill', '#999')
    .text(unit);
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
  const {state: uiState} = useUi();
  useLayoutEffect(() => {
    if (deliveredEnergyRef.current) {
      applyChart(
        deliveredEnergyRef.current,
        props.feature.properties,
        'deliveredEnergy',
        uiState.selectedYearKey
      );
    }
    if (finalEnergyRef.current) {
      applyChart(
        finalEnergyRef.current,
        props.feature.properties,
        'finalEnergy',
        uiState.selectedYearKey
      );
    }
    if (ghgEmissionsRef.current) {
      applyChart(
        ghgEmissionsRef.current,
        props.feature.properties,
        'ghgEmissions',
        uiState.selectedYearKey
      );
    }
    if (heatDemandRef.current) {
      applyChart(
        heatDemandRef.current,
        props.feature.properties,
        'heatDemand',
        uiState.selectedYearKey
      );
    }
    if (primaryEnergyRef.current) {
      applyChart(
        primaryEnergyRef.current,
        props.feature.properties,
        'primaryEnergy',
        uiState.selectedYearKey
      );
    }
  }, [props.feature.properties, trigger, uiState.selectedYearKey]);
  return (
    <Disclosure>
      {({open}) => (
        <>
          <Disclosure.Button
            onClick={() => setTrigger(trigger + 1)}
            className="flex w-full bg-gray-100 justify-between rounded-md p-2 mt-2 text-left text-sm text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
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
