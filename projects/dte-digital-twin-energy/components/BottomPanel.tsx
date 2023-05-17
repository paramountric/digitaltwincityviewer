import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { select, selectAll } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { useViewer } from '../hooks/use-viewer';
// import {useClimateScenarioData} from '../hooks/data';
// import {useIndicators} from '../hooks/indicators';
import { propertyLabels, units } from '../lib/constants';

function renderChart(
  el: HTMLDivElement | null,
  elWidth: number,
  elHeight: number,
  timelineValues: number[],
  key: string
) {
  if (!el) {
    return;
  }
  select(el).selectAll('svg').remove();
  const max = Math.max(...timelineValues);
  if (max === 0) {
    return;
  }
  const min = Math.min(...timelineValues);

  const margin = { top: 20, right: 20, bottom: 45, left: 100 };
  const width = elWidth - margin.left - margin.right;
  const height = elHeight - margin.top - margin.bottom;

  const unit = units[`${key}Timeline`];
  const label = propertyLabels[key];

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  var x = scaleBand().domain(months).range([0, width]).padding(0.5);
  var y = scaleLinear().domain([0, max]).range([height, 0]);

  var colorScale = scaleLinear()
    .domain([min, max])
    .range(['#eee', '#ccc'] as Iterable<number>);
  // .range(['#eff3ff', '#2171b5'] as Iterable<number>);

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
    .attr('fill', (d) => colorScale(d))
    .attr('stroke', '#999')
    .attr('class', 'bar')
    .attr('x', (d, i) => {
      return x(months[i]) as number;
    })
    .attr('width', x.bandwidth())
    .attr('y', function (d) {
      return y(d);
    })
    .attr('height', function (d) {
      return height - y(d);
    });

  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(axisBottom(x));

  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#777')
    .text(label);

  svg.append('g').call(axisLeft(y).ticks(4));
  // text label for the y axis
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 30 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#777')
    .text(unit);
}

type BottomPanelProps = {};

const BottomPanel: React.FC<BottomPanelProps> = (props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  // const {state: indicatorState} = useIndicators();
  // const {state: dataState, isLoading} = useClimateScenarioData();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const getSize = () => {
    setWidth(chartRef.current?.clientWidth || 0);
    setHeight(chartRef.current?.clientHeight || 0);
  };

  // useLayoutEffect(() => {
  //   getSize();
  //   if (chartRef.current && dataState.timelineData && width && height) {
  //     const {showTimelinePerM2, propertyKey, selectedYear} = indicatorState;
  //     const timelineDataKey = showTimelinePerM2 ? 'perM2' : 'total';
  //     const timelineValues = dataState.timelineData[timelineDataKey];
  //     renderChart(chartRef.current, width, height, timelineValues, propertyKey);
  //   }
  // }, [dataState.timelineData, width, height]);

  useEffect(() => {
    window.addEventListener('resize', getSize);
    return () => window.removeEventListener('resize', getSize);
  }, []);

  return null;
  // dataState.timelineData && (
  //   <div className="absolute z-50 w-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-md left-1/2 bottom-2 h-44">
  //     {isLoading ? (
  //       <div className="relative flex items-center justify-center">
  //         <div className="w-8 h-8 mt-16 ease-linear border-4 border-t-4 border-gray-200 rounded-full loader"></div>
  //       </div>
  //     ) : dataState.timelineData ? (
  //       <div className="h-44" ref={chartRef}></div>
  //     ) : (
  //       <div>No buildings found</div>
  //     )}
  //   </div>
  // )
};

export default BottomPanel;
