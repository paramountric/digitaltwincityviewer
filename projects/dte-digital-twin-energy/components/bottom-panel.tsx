import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {select, selectAll} from 'd3-selection';
import {scaleBand, scaleLinear} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {useViewer} from '../hooks/viewer';
import {useProtectedData} from '../hooks/data';
import {useIndicators} from '../hooks/indicators';
import {propertyLabels} from '../lib/constants';

function renderChart(
  el: HTMLDivElement | null,
  elWidth: number,
  elHeight: number,
  timelineValues: number[],
  label: string
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

  const margin = {top: 20, right: 20, bottom: 45, left: 100};
  const width = elWidth - margin.left - margin.right;
  const height = elHeight - margin.top - margin.bottom;

  console.log(elHeight);
  console.log(elWidth);

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
    .range(['#eff3ff', '#2171b5'] as Iterable<number>);

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
    .attr('fill', d => colorScale(d))
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
    .style('font-size', '14px')
    .text(label);

  svg.append('g').call(axisLeft(y));
}

type BottomPanelProps = {};

const BottomPanel: React.FC<BottomPanelProps> = props => {
  const chartRef = useRef<HTMLDivElement>(null);
  const {state: indicatorState} = useIndicators();
  const {updateTimelineData, timelineData, data, isLoading} =
    useProtectedData();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  const getSize = () => {
    setWidth(chartRef.current?.clientWidth || 0);
    setHeight(chartRef.current?.clientHeight || 0);
  };

  useLayoutEffect(() => {
    getSize();
    if (chartRef.current && timelineData && width && height) {
      const {showTimelinePerM2, propertyKey, selectedYear} = indicatorState;
      const timelineDataKey = showTimelinePerM2 ? 'perM2' : 'total';
      const timelineValues = timelineData[timelineDataKey];
      renderChart(
        chartRef.current,
        width,
        height,
        timelineValues,
        `${propertyLabels[propertyKey]}`
      );
    }
  }, [timelineData, width, height]);

  useEffect(() => {
    getSize();
    const {propertyKey, selectedYear} = indicatorState;
    updateTimelineData(propertyKey, selectedYear);
  }, [data, indicatorState]);

  useEffect(() => {
    window.addEventListener('resize', getSize);
    return () => window.removeEventListener('resize', getSize);
  }, []);

  return (
    timelineData && (
      <div className="absolute left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-md border border-gray-300 bottom-2 w-1/2 h-44">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="h-44" ref={chartRef}></div>
        )}
      </div>
    )
  );
};

export default BottomPanel;
