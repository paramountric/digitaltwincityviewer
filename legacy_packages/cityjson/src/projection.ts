import { convert } from '@dtcv/convert';

type ProjectOptions = {
  vertices: number[][];
  fromCrs: string;
  toCrs?: string;
  center?: [number, number, number];
};

export function projectVertices({
  vertices,
  fromCrs,
  toCrs,
  center, // this will be subtracted from each x, y, z after projection to toCrs
}: ProjectOptions) {
  const projectedVertices = [];
  for (const vertex of vertices) {
    const projectedCoordinate = convert({
      x: vertex[0],
      y: vertex[1],
      z: vertex[2],
      center,
      fromCrs,
      toCrs,
    });
    projectedVertices.push(projectedCoordinate);
  }
  return projectedVertices;
}

export function projectExtent(extent, fromCrs, toCrs) {
  const projectedExtentMin = convert({
    x: extent[0],
    y: extent[1],
    z: extent[2],
    fromCrs,
    toCrs,
  });
  const projectedExtentMax = convert({
    x: extent[3],
    y: extent[4],
    z: extent[5],
    fromCrs,
    toCrs,
  });
  return [...projectedExtentMin, ...projectedExtentMax];
}
