import { tickFormat, scaleTime, scaleThreshold } from 'd3-scale';

// this was changed from extreme time zoom to / 1000
const MINUTES_PER_COORDINATE = (60 * 24 * 30) / 1000;

export class TimeManager {
  intervalScale: scaleThreshold;
  constructor() {
    this.intervalScale = scaleThreshold()
      .domain([1, 10, 300, 1000, 7000, 28000, Infinity]) // after change year will not be reached at zoom zero
      .range(['second', 'minute', 'hour', 'day', 'week', 'month', 'year']);
  }

  // for a certain extent and zoom, use this scale function for a coordinate, scale(x)
  getTimescale(time, min, max, zoom) {
    // const start = MINUTES_PER_COORDINATE * min * 2 ** zoom || -1;
    // const end = MINUTES_PER_COORDINATE * max * 2 ** zoom || 1;
    const start = MINUTES_PER_COORDINATE * min || -1;
    const end = MINUTES_PER_COORDINATE * max || 1;
    // run through d3-timeScale to set the labels correctly
    // const timeSpan = end - start;
    // const middle = this.minX + timeSpan / 2;
    // const middleDate = this.xScale.invert(middle);
    // how much time per coordinate?
    // get interval d3 has decided on by comparing 2nd and 3rd ticks
    // const t1 = new Date(xScale.ticks()[1]);
    // const t2 = new Date(xScale.ticks()[2]);
    // get interval as seconds
    // const interval = (t2.getTime() - t1.getTime()) / 86400000;
    // const intervalZoom = interval * 2 ** this.zoom;
    // get interval scale to decide if minutes, days, hours, etc
    // const intervalType = this.intervalScale(interval);

    const scale = scaleTime()
      .domain([
        new Date(time).setMinutes(start),
        new Date(time).setMinutes(end),
      ])
      .range([min, max]);
    return scale;
  }
}
