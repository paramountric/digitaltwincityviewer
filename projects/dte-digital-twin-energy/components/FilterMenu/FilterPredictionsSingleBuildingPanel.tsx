import { useLayoutEffect, useRef, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { schemeSet2 } from 'd3-scale-chromatic';
import { timeFormat } from 'd3-time-format';
import { getColorFromScale } from '../../lib/colorScales';
import { propertyLabels, units, rounding } from '../../lib/constants';
import { useUi } from '../../hooks/use-ui';

const formatMonth = timeFormat('%b');

type FilterPredictionsSingleBuildingPanelProps = {
  selectionType: string;
  feature: any;
};

function formatValue(properties: any, propertyKey: string) {
  let val = properties[propertyKey];
  if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
    val = val.toFixed(rounding[propertyKey]);
  }
  return val;
}

// kwh/m2 or total ghg/m2 for each of the years
function getIndicatorDegreeValues(
  properties: any,
  selectedIndicatorKey: string,
  renovationKey: string
) {
  const hfa = properties.hfa || 1;

  // if (renovationKey !== 'ref') {
  //   const only1degIsInTheData =
  //     properties[`${selectedIndicatorKey}50_25_${renovationKey}`];
  //   return [0, only1degIsInTheData / hfa, 0, 0];
  // }
  // todo: refactor the property names, since they are not named in a good way -> the 18 year has the same values and are all the degZero
  const deg0 = JSON.parse(
    properties[`m${selectedIndicatorKey}18_25_${renovationKey}`] || '[0]'
  );
  const deg25 = JSON.parse(
    properties[`m${selectedIndicatorKey}50_25_${renovationKey}`] || '[0]'
  );
  const deg45 = JSON.parse(
    properties[`m${selectedIndicatorKey}50_45_${renovationKey}`] || '[0]'
  );
  const deg85 = JSON.parse(
    properties[`m${selectedIndicatorKey}50_85_${renovationKey}`] || '[0]'
  );
  // divide each value in the arrays by hfa to get the values per m2
  return [
    deg0.map((v: number) => v / hfa),
    deg25.map((v: number) => v / hfa),
    deg45.map((v: number) => v / hfa),
    deg85.map((v: number) => v / hfa),
  ];
  // return ['18', '50'].map(year => {
  //   const keyAddM2 = `${selectedIndicatorKey}${year}_${selectedDegreeKey}_ban`; // building area normalized
  //   return properties[keyAddM2] || 0;
  // });
}

function applyChart(
  el: HTMLDivElement,
  properties: any,
  selectedIndicatorKey: string
) {
  // take the two first characters of the combinedKey to get the selectedIndicatorKey
  const isGhg = selectedIndicatorKey === 'ge';
  const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';
  const unit = units[`${selectedIndicatorKey}M2`];
  select(el).selectAll('svg').remove();
  const timelineValues = getIndicatorDegreeValues(
    properties,
    selectedIndicatorKey,
    'ref'
  ) as any;
  if (!timelineValues[0][0] && !timelineValues[1][0]) {
    return;
  }
  // find max of array of array with numbers
  const max = Math.max(...timelineValues.flat());
  if (max === 0) {
    return;
  }

  const monthlyValues = Array(12)
    .fill(0)
    .map((_, i) => {
      return [
        timelineValues[0][i],
        timelineValues[1][i],
        timelineValues[2][i],
        timelineValues[3][i],
      ];
    });

  const degrees: string[] = ['2018', '+1°C', '+1.5°C', '+2°C'];

  const margin = { top: 20, right: 60, bottom: 20, left: 60 };
  const width = 500 - margin.left - margin.right;
  const height = 220 - margin.top - margin.bottom;
  const x0 = scaleBand()
    .domain(monthlyValues.map((_, i) => i + 1) as any)
    .range([0, width])
    .padding(0.1);
  const x1 = scaleBand()
    .domain(degrees)
    .range([0, x0.bandwidth()])
    .padding(0.05);
  const y = scaleLinear().domain([0, max]).range([height, 0]);

  const svg = select(el)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const tooltip = select('.tooltip');

  const colorScale = scaleOrdinal<number>()
    .domain(['0', '1', '2', '3'])
    .range(schemeSet2);

  svg
    .selectAll('.month')
    .data(monthlyValues)
    .enter()
    .append('g')
    .attr('class', 'month')
    .attr('transform', (d, i) => `translate(${x0((i + 1) as any)},0)`)
    .selectAll('.bar')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('fill', (d, i) => colorScale(`${i % 4}`))
    // .attr('fill', (d, i) =>
    //   getColorFromScale(timelineValues[i], scaleKey, true)
    // )
    .attr('stroke', '#aaa')
    .attr('stroke-width', '0.5px')
    .attr('class', 'bar')
    .attr('x', (d, i) => x1(degrees[i]) as number)
    .attr('width', x1.bandwidth())
    .attr('y', d => y(d))
    .attr('height', d => height - y(d))
    .on('mouseover', function (d) {
      tooltip
        .text(d.target.__data__.toFixed(1) + ' ' + unit)
        .style('left', d.offsetX + 'px')
        .style('top', d.y - 35 + 'px');
    })
    .on('mouseout', function (d) {
      //tooltip.style('opacity', 0);
    });

  const legend = svg
    .append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 20}, 0)`);

  const legendItems = [
    { label: '2018', color: colorScale('0') },
    { label: '1°', color: colorScale('1') },
    { label: '1.5°', color: colorScale('2') },
    { label: '2°', color: colorScale('3') },
  ];

  legend
    .selectAll('.legend-item')
    .data(legendItems)
    .enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('x', 0)
    .attr('y', (d, i) => i * 20)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', d => d.color);

  legend
    .selectAll('.legend-label')
    .data(legendItems)
    .enter()
    .append('text')
    .attr('class', 'legend-label')
    .attr('x', 15)
    .attr('y', (d, i) => i * 20 + 10)
    .style('font-size', '9px')
    .style('fill', 'gray')
    .text(d => d.label);

  // const degrees: string[] = ['2018', '+1°C', '+1.5°C', '+2°C'];

  // const margin = { top: 20, right: 0, bottom: 20, left: 60 };
  // const width = 500 - margin.left - margin.right;
  // const height = 220 - margin.top - margin.bottom;
  // const x = scaleBand().domain(degrees).range([0, width]).padding(0.6);
  // const y = scaleLinear().domain([0, max]).range([height, 0]);

  // const svg = select(el)
  //   .append('svg')
  //   .attr('width', width + margin.left + margin.right)
  //   .attr('height', height + margin.top + margin.bottom)
  //   .append('g')
  //   .attr('transform', `translate(${margin.left},${margin.top})`);

  // const tooltip = select('.tooltip');

  // svg
  //   .selectAll('.bar')
  //   .data(timelineValues)
  //   .enter()
  //   .append('rect')
  //   .attr('fill', d => getColorFromScale(d, scaleKey, true))
  //   .attr('stroke', '#aaa')
  //   .attr('stroke-width', '0.5px')
  //   .attr('class', 'bar')
  //   .attr('x', (d, i): number => {
  //     return x(degrees[i]) as number;
  //   })
  //   .attr('width', x.bandwidth())
  //   .attr('y', function (d) {
  //     return y(d);
  //   })
  //   .attr('height', function (d) {
  //     return height - y(d);
  //   })
  //   .on('mouseover', function (d) {
  //     console.log(d);
  //     tooltip
  //       .text(d.target.__data__.toFixed(1) + ' ' + unit)
  //       .style('left', d.offsetX + 'px')
  //       .style('top', d.y - 35 + 'px');
  //   })
  //   .on('mouseout', function (d) {
  //     //tooltip.style('opacity', 0);
  //   });
  // svg
  //   .selectAll('.bar-text')
  //   .data(timelineValues)
  //   .enter()
  //   .append('text')
  //   .text(d => {
  //     return `${propertyLabels[selectedIndicatorKey]} (${d.toFixed(1)})`;
  //   })
  //   .attr('x', width / 2)
  //   .attr('y', 0 - margin.top / 2)
  //   .attr('text-anchor', 'middle')
  //   .style('font-size', '12px')
  //   .style('text-anchor', 'middle');

  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    //.style('text-decoration', 'underline')
    .text(propertyLabels[selectedIndicatorKey]);

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      axisBottom(x0).tickFormat(d =>
        formatMonth(new Date(2022, Number(d) - 1, 1))
      )
    );

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

  // text label for the y axis
  // svg
  //   .append('text')
  //   .attr('transform', 'rotate(-90)')
  //   .attr('y', 0 - margin.left)
  //   .attr('x', 0 - height / 2)
  //   .attr('dy', '1em')
  //   .style('text-anchor', 'middle')
  //   .style('font-size', '10px')
  //   .style('fill', '#999')
  //   .text(unit);
}

const FilterPredictionsSingleBuildingPanel: React.FC<
  FilterPredictionsSingleBuildingPanelProps
> = props => {
  const deliveredEnergyRef = useRef<HTMLDivElement>(null);
  const finalEnergyRef = useRef<HTMLDivElement>(null);
  const ghgEmissionsRef = useRef<HTMLDivElement>(null);
  const heatDemandRef = useRef<HTMLDivElement>(null);
  const coolDemandRef = useRef<HTMLDivElement>(null);
  const primaryEnergyRef = useRef<HTMLDivElement>(null);
  const [trigger, setTrigger] = useState(-1);
  const { state: uiState, getCombinedKey } = useUi();

  useLayoutEffect(() => {
    if (finalEnergyRef.current) {
      applyChart(finalEnergyRef.current, props.feature.properties, 'fe');
    }
    if (heatDemandRef.current) {
      applyChart(heatDemandRef.current, props.feature.properties, 'hd');
    }
    if (primaryEnergyRef.current) {
      applyChart(primaryEnergyRef.current, props.feature.properties, 'pe');
    }
    if (deliveredEnergyRef.current) {
      applyChart(deliveredEnergyRef.current, props.feature.properties, 'de');
    }
    if (ghgEmissionsRef.current) {
      applyChart(ghgEmissionsRef.current, props.feature.properties, 'ge');
    }
    if (coolDemandRef.current) {
      applyChart(coolDemandRef.current, props.feature.properties, 'cd');
    }
  }, [props.feature.properties, trigger, uiState.selectedDegreeKey]);

  const selectionLabels = {
    baseAreas: 'base area',
    primaryAreas: 'primary area',
    grid1km: '1x1km square',
    grid250m: '250x250m square',
    grid100m: '100x100m square',
  } as any;

  return (
    <div>
      <div>{`Monthly values in climate scenarios for the selected building`}</div>
      <div
        className="mt-3"
        id="delivered-energy-bar-chart"
        ref={deliveredEnergyRef}
      ></div>
      <div
        className="mt-3"
        id="final-energy-bar-chart"
        ref={finalEnergyRef}
      ></div>
      <div
        className="mt-3"
        id="ghg-emissions-bar-chart"
        ref={ghgEmissionsRef}
      ></div>
      <div className="mt-3" id="heat-demand-chart" ref={heatDemandRef}></div>
      <div className="mt-3" id="cool-demand-chart" ref={coolDemandRef}></div>
      <div
        className="mt-3"
        id="primary-energy-chart"
        ref={primaryEnergyRef}
      ></div>
      <div className="absolute top-0 left-0 z-50 p-1 bg-white border shadow-md tooltip">
        {/* this is replaced with tooltip text */}
      </div>
    </div>
  );
};

export default FilterPredictionsSingleBuildingPanel;
