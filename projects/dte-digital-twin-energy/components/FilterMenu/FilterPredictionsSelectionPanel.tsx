import { useLayoutEffect, useRef, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { getColorFromScale } from '../../lib/colorScales';
import {
  propertyLabels,
  units,
  rounding,
  renovationLabels,
} from '../../lib/constants';
import { useUi } from '../../hooks/use-ui';

type FilterPredictionsSelectionPanelProps = {
  feature: any;
  renovationKey: string;
};

function formatValue(properties: any, propertyKey: string) {
  let val = properties[propertyKey];
  if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
    val = val.toFixed(rounding[propertyKey]);
  }
  return val;
}

// kwh/m2 or total ghg/m2 for each of the years
function getIndicatorDegreeOrRenovationValues(
  properties: any,
  scenarioKey: string,
  selectedIndicatorKey: string,
  selectedYear: string,
  renovationKey: string
) {
  // console.log(properties);
  const hfa = properties.hfa || 1;
  if (scenarioKey === 'renovation') {
    console.log(properties);
    console.log('hfa', hfa);
    console.log('selectedIndicatorKey', selectedIndicatorKey);
    console.log('renovationKey', renovationKey);
    const ref = properties[`${selectedIndicatorKey}${selectedYear}_25_ref`];
    // deep renovation
    const dr = properties[`${selectedIndicatorKey}${selectedYear}_25_dr`];
    // er
    const er = properties[`${selectedIndicatorKey}${selectedYear}_25_er`];
    // hr
    const hr = properties[`${selectedIndicatorKey}${selectedYear}_25_hr`];
    return [ref / hfa, dr / hfa, er / hfa, hr / hfa];
    // const only1degIsInTheData =
    //   properties[`${selectedIndicatorKey}50_25_${renovationKey}`];
    // return [0, only1degIsInTheData / hfa, 0, 0];
  }
  // todo: refactor the property names, since they are not named in a good way -> the 18 year has the same values and are all the degZero
  const deg0 = properties[`${selectedIndicatorKey}18_25_ref`];
  const deg25 = properties[`${selectedIndicatorKey}50_25_ref`];
  const deg45 = properties[`${selectedIndicatorKey}50_45_ref`];
  const deg85 = properties[`${selectedIndicatorKey}50_85_ref`];
  return [deg0 / hfa, deg25 / hfa, deg45 / hfa, deg85 / hfa];
  // return ['18', '50'].map(year => {
  //   const keyAddM2 = `${selectedIndicatorKey}${year}_${selectedDegreeKey}_ban`; // building area normalized
  //   return properties[keyAddM2] || 0;
  // });
}

function applyChart(
  el: HTMLDivElement,
  properties: any,
  scenarioKey: string,
  selectedIndicatorKey: string,
  selectedYear: string,
  renovationKey: string
) {
  if (!properties) {
    return;
  }
  // take the two first characters of the combinedKey to get the selectedIndicatorKey
  const isGhg = selectedIndicatorKey === 'ge';
  const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';
  const unit = units[`${selectedIndicatorKey}M2`];
  select(el).selectAll('svg').remove();
  const timelineValues = getIndicatorDegreeOrRenovationValues(
    properties,
    scenarioKey,
    selectedIndicatorKey,
    selectedYear,
    renovationKey
  );
  // console.log(timelineValues);
  const max = Math.max(...timelineValues);
  if (max === 0) {
    return;
  }

  const domain: string[] =
    scenarioKey === 'renovation'
      ? Object.values(renovationLabels)
      : ['2018', '+1°C', '+1.5°C', '+2°C'];

  const margin = {
    top: 20,
    right: 0,
    bottom: 20,
    left: scenarioKey === 'renovation' ? 100 : 40,
  };
  const width = 500 - margin.left - margin.right;
  const height = 220 - margin.top - margin.bottom;
  // const x = scaleBand().domain(domain).range([0, width]).padding(0.6);
  const x = scaleLinear()
    .domain([0, max] as any)
    .range([0, width]); //.padding(0.6);
  const y = scaleBand()
    .domain(domain as any)
    .range([height, 0])
    .padding(0.6);

  const svg = select(el)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const tooltip = select('.tooltip');

  svg
    .selectAll('.bar')
    .data(timelineValues)
    .enter()
    .append('rect')
    .attr('fill', d => getColorFromScale(d, scaleKey, true))
    .attr('stroke', '#aaa')
    .attr('stroke-width', '0.5px')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', (d, i) => y(domain[i]) as number)
    .attr('width', d => x(d))
    .attr('height', y.bandwidth())
    .attr('fill', d => getColorFromScale(d, scaleKey, true))
    .attr('stroke', '#aaa')
    .attr('stroke-width', '0.5px')
    .on('mouseover', function (d) {
      tooltip
        .text(d.target.__data__.toFixed(1) + ' ' + unit)
        .style('left', d.offsetX + 'px')
        .style('top', d.y - 35 + 'px');
    })
    .on('mouseout', function (d) {
      //tooltip.style('opacity', 0);
    });
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
    .text(`${propertyLabels[selectedIndicatorKey]} (${unit})`);

  svg.append('g').attr('class', 'axis').call(axisLeft(y));

  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(axisBottom(x).ticks(5));

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

const FilterPredictionsSelectionPanel: React.FC<
  FilterPredictionsSelectionPanelProps
> = props => {
  const { state: uiState, getCombinedKey } = useUi();
  const deliveredEnergyRef = useRef<HTMLDivElement>(null);
  const finalEnergyRef = useRef<HTMLDivElement>(null);
  const ghgEmissionsRef = useRef<HTMLDivElement>(null);
  const heatDemandRef = useRef<HTMLDivElement>(null);
  const coolDemandRef = useRef<HTMLDivElement>(null);
  const primaryEnergyRef = useRef<HTMLDivElement>(null);
  const [trigger, setTrigger] = useState(-1);

  useLayoutEffect(() => {
    if (finalEnergyRef.current) {
      applyChart(
        finalEnergyRef.current,
        props.feature?.properties,
        uiState.scenarioKey,
        'fe',
        uiState.selectedYearKey,
        props.renovationKey
      );
    }
    if (heatDemandRef.current) {
      applyChart(
        heatDemandRef.current,
        props.feature?.properties,
        uiState.scenarioKey,
        'hd',
        uiState.selectedYearKey,
        props.renovationKey
      );
    }
    if (primaryEnergyRef.current) {
      applyChart(
        primaryEnergyRef.current,
        props.feature?.properties,
        uiState.scenarioKey,
        'pe',
        uiState.selectedYearKey,
        props.renovationKey
      );
    }
    if (deliveredEnergyRef.current) {
      applyChart(
        deliveredEnergyRef.current,
        props.feature?.properties,
        uiState.scenarioKey,
        'de',
        uiState.selectedYearKey,
        props.renovationKey
      );
    }
    if (ghgEmissionsRef.current) {
      applyChart(
        ghgEmissionsRef.current,
        props.feature?.properties,
        uiState.scenarioKey,
        'ge',
        uiState.selectedYearKey,
        props.renovationKey
      );
    }
    if (coolDemandRef.current) {
      applyChart(
        coolDemandRef.current,
        props.feature?.properties,
        uiState.scenarioKey,
        'cd',
        uiState.selectedYearKey,
        props.renovationKey
      );
    }
  }, [
    props.feature?.properties,
    trigger,
    uiState.selectedDegreeKey,
    uiState.selectedYearKey,
    uiState.scenarioKey,
  ]);

  return (
    <div>
      {/* <div>Annual values in climate scenarios</div> */}
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

export default FilterPredictionsSelectionPanel;
