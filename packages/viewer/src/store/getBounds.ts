import { vec4, vec2, mat4 } from 'gl-matrix';

// WIP! see comments

// https://github.com/uber-web/math.gl/blob/master/modules/web-mercator/src/get-bounds.ts
// this is temporary until decided how projection should be used
export function getBounds() {
  if (!this.viewer.deck) {
    return [0, 0, 0, 0];
  }
  const viewport = this.viewer.deck.viewManager.getViewport('mapview');
  const { width, height, pixelUnprojectionMatrix, distanceScales } = viewport;

  // todo: refactor when pattern is clear on which transformations are done in the Viewer
  // now sometimes math.gl is used, and sometimes directly gl-matrix
  function transformVector(matrix: number[], vector: number[]): number[] {
    const result = vec4.transformMat4(
      vec4.create(),
      vector as vec4,
      matrix as mat4
    );
    vec4.scale(result, result, 1 / result[3]);
    return result as number[];
  }

  // todo: include proper elevation!
  const elevation = 1;

  const sw = transformVector(pixelUnprojectionMatrix, [
    0,
    height,
    elevation,
    1,
  ]);
  const se = transformVector(pixelUnprojectionMatrix, [
    width,
    height,
    elevation,
    1,
  ]);
  const z = elevation * distanceScales.unitsPerMeter[2];

  console.log(distanceScales);

  const nw1 = transformVector(pixelUnprojectionMatrix, [0, 0, 1, 1]);
  const nw2 = transformVector(pixelUnprojectionMatrix, [0, height, 1, 1]);
  const nwt = (z - nw1[2]) / (nw2[2] - nw1[2]);
  const nw = vec2.lerp(vec2.create(), nw1 as vec2, nw2 as vec2, nwt);

  const ne1 = transformVector(pixelUnprojectionMatrix, [width, 0, 1, 1]);
  const ne2 = transformVector(pixelUnprojectionMatrix, [width, height, 1, 1]);
  const net = (z - ne1[2]) / (ne2[2] - ne1[2]);
  const ne = vec2.lerp(vec2.create(), ne1 as vec2, ne2 as vec2, net);

  // todo: multiply with distanceScales.metersPerUnit for x,y
  // todo: z is elevation in meters
  // todo: layer matrix needs to be taken into consideration

  return { sw, se, nw, ne };
}
