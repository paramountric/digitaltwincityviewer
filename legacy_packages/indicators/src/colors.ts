// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

// Note: this code was partly commented out because of need of the TS fix for D3 scaleLinear
// But it is not used in any project so far since custom color scales have been used instead on project level

import {scaleLinear} from 'd3-scale';
import {getIndicator} from './index.js';

function getBad(sufficient, excellent) {
  if ((!excellent && excellent !== 0) || (!sufficient && sufficient !== 0)) {
    return 0;
  }
  const span = Math.abs(sufficient - excellent) * 1.5;
  if (sufficient >= excellent) {
    return sufficient + span;
  }
  return sufficient - span;
}

function toNumericArray(d3Color) {
  // this could probably be done smarter, this is a quick fix
  // maybe there is a setting
  const colorRgb = d3Color.split('(')[1].split(')')[0].split(',').map(Number);
  return colorRgb;
}

export function generateColor(
  value,
  min,
  max,
  from: string,
  to: string,
  via?: string
) {
  // const middle = min + (max - min) / 2;
  // const colorRange = scaleLinear()
  //   .domain([min, middle, max])
  //   .range(via ? [from, via, to] : [from, to]);

  // colorRange.clamp(true);

  // return toNumericArray(colorRange(value));

  // todo: update TS to fix the errors from D3
  return [100, 100, 100];
}

export function extrapolateColor(value, sufficient, excellent) {
  const bad = getBad(sufficient, excellent);

  // const colorRange = scaleLinear()
  //   .domain([bad, sufficient, excellent])
  //   .range(['red', 'yellow', 'blue']);

  // colorRange.clamp(true);
  // return toNumericArray(colorRange(value));
  return [100, 100, 100];
}

export function getIndicatorColor(indicatorId: string, value: number) {
  // todo: check if there are some other color generation, like fixed ranges
  const {sufficient, excellent} = getIndicator(indicatorId);
  if (!sufficient && !excellent) {
    return null;
  }

  return extrapolateColor(value, sufficient, excellent);
}
