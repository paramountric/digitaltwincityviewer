// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

//import earcut from 'earcut';

export type Point = [number, number];
export type Polygon = Point[];
export type MultiPolygon = Polygon[];

export function isClockwise(polygon: Polygon) {
  const { sum } = polygon.reduce(
    (memo, p) => {
      const { last } = memo;
      const add = (p[0] - last[0]) * (p[1] + last[1]);
      return {
        sum: memo.sum + add,
        last: p,
      };
    },
    { sum: 0, last: polygon[polygon.length - 1] }
  );
  return sum > 0;
}

// export function projectPolygon(polygon: Polygon | MultiPolygon, projectFn, out: Polygon | MultiPolygon) {
//   if (Number.isFinite(polygon[0][0])) {
//     const projected = [];
//     for (const point of polygon) {
//       projected.push(projectFn(point));
//     }
//   } else {
//     for (const poly of polygon) {

//     }
//   }
// }

// export function triangulate(mp: MultiPolygon) {
//   const { vertices, holes, dimensions } = earcut.flatten(mp);
//   const indices = earcut(vertices, holes, dimensions);
//   return {
//     vertices,
//     indices,
//     holes,
//   };
// }
