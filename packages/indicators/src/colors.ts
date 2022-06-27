// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { scaleLinear } from 'd3-scale';
import { getIndicator } from './index.js';

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

export function generateColor(value, sufficient, excellent) {
  const bad = getBad(sufficient, excellent);

  const colorRange = scaleLinear()
    .domain([bad, sufficient, excellent])
    .range(['red', 'yellow', 'blue']);

  colorRange.clamp(true);
  // this could probably be done smarter, this is a quick fix
  const colorRgb = colorRange(value)
    .split('(')[1]
    .split(')')[0]
    .split(',')
    .map(Number);

  return colorRgb;
}

export function getIndicatorColor(indicatorId: string, value: number) {
  // todo: check if there are some other color generation, like fixed ranges
  const { sufficient, excellent } = getIndicator(indicatorId);
  if (!sufficient && !excellent) {
    return null;
  }

  return generateColor(value, sufficient, excellent);
}
