import { useLayoutEffect, useRef, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { getColorFromScale } from '../../lib/colorScales';
import { propertyLabels, units, rounding } from '../../lib/constants';
import { useUi } from '../../hooks/use-ui';

type FilterPredictionsSelectionPanelProps = {
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
  selectedIndicatorKey: string
) {
  console.log(properties);
  // todo: refactor the property names, since they are not named in a good way -> the 18 year has the same values and are all the degZero
  const deg0 = properties[`${selectedIndicatorKey}18_25_ref_ban`];
  const deg25 = properties[`${selectedIndicatorKey}50_25_ref_ban`];
  const deg45 = properties[`${selectedIndicatorKey}50_45_ref_ban`];
  const deg85 = properties[`${selectedIndicatorKey}50_85_ref_ban`];
  return [deg0, deg25, deg45, deg85];
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
    selectedIndicatorKey
  );
  console.log(timelineValues);
  const max = Math.max(...timelineValues);
  if (max === 0) {
    return;
  }

  const degrees: string[] = ['2018', '+1°C', '+1.5°C', '+2°C'];

  const margin = { top: 20, right: 0, bottom: 20, left: 60 };
  const width = 500 - margin.left - margin.right;
  const height = 220 - margin.top - margin.bottom;
  // const x = scaleBand().domain(degrees).range([0, width]).padding(0.6);
  const x = scaleLinear()
    .domain([0, max] as any)
    .range([0, width]); //.padding(0.6);
  const y = scaleBand()
    .domain(degrees as any)
    .range([height, 0])
    .padding(0.3);

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
    .attr('y', (d, i) => y(degrees[i]) as number)
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
  return (
    <div>
      <div>Annual values in climate scenarios</div>
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
