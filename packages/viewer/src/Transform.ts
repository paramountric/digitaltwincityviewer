// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Matrix4, Vector4 } from '@math.gl/core';
import { vec4 } from 'gl-matrix';
import { ViewerProps } from './Viewer';

const PI = Math.PI;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
const FOV = 75;
const FOV_RADIANS = FOV * DEGREES_TO_RADIANS;

// https://github.com/uber-web/math.gl/blob/master/modules/web-mercator/src/web-mercator-utils.ts
const HALF_EARTH_CIRC = 20015000;

function getMetersX(longitude: number): number {
  return longitude * (HALF_EARTH_CIRC / 180);
}

// https://gist.github.com/springmeyer/871897
// https://en.wikipedia.org/wiki/Web_Mercator_projection
function getMetersY(latitude: number): number {
  const y = Math.log(Math.tan(latitude * (PI / 360) + PI_4)) / PI;
  return y * HALF_EARTH_CIRC;
}

export class Transform {
  public projectionMatrix = Matrix4.IDENTITY;
  public viewMatrix = Matrix4.IDENTITY;
  public pixelMatrix = Matrix4.IDENTITY;
  public invPixelMatrix = Matrix4.IDENTITY;
  private fovy = FOV_RADIANS;
  private altitude = 0.5 / Math.tan(0.5 * FOV_RADIANS);
  private aspect = 1;
  private near = 0.1;
  private far = Infinity;
  private scale = 2 ** 0;
  private xMin: number;
  private yMin: number;
  private xMax: number;
  private yMax: number;
  constructor(viewerProps: ViewerProps) {
    const { cityExtentRadius } = viewerProps;
    if (!cityExtentRadius) {
      console.warn('City extent radius must be given');
      return;
    }
    this.xMin = -cityExtentRadius;
    this.yMin = -cityExtentRadius;
    this.xMax = cityExtentRadius;
    this.yMax = cityExtentRadius;
    this.update(viewerProps);
  }
  public update(viewerProps: ViewerProps) {
    this.scale = viewerProps.cameraZoom || 0;
    this.createMatrices(viewerProps);
  }
  public getUniforms() {
    console.log(this.viewMatrix);
    return {
      view: this.viewMatrix,
      project: this.projectionMatrix,
      viewMatrix: this.viewMatrix,
      projectionMatrix: this.projectionMatrix,
      viewProjectionMatrix: new Matrix4(this.projectionMatrix).multiplyRight(
        this.viewMatrix
      ),
    };
  }

  // https://github.com/maplibre/maplibre-gl-js/blob/main/src/geo/transform.ts#:~:text=%7D-,pointCoordinate,-(p%3A%20Point)%20%7B
  pixelPointToPoint(
    pixelPoint: [number, number],
    scale: number
  ): [number, number] {
    const p = pixelPoint;
    const targetZ = 0;
    const coord0 = new Vector4(p[0], p[1], 0, 1);
    const coord1 = new Vector4(p[0], p[1], 1, 1);
    coord0.transform(this.invPixelMatrix);
    coord1.transform(this.invPixelMatrix);

    const x0 = coord0[0] / coord0[3];
    const x1 = coord1[0] / coord1[3];
    const y0 = coord0[1] / coord0[3];
    const y1 = coord1[1] / coord1[3];
    const z0 = coord0[2] / coord0[3];
    const z1 = coord1[2] / coord1[3];
    const t = z0 === z1 ? 0 : (targetZ - z0) / (z1 - z0);
    const x = (x0 * (1 - t) + x1 * t) / scale;
    const y = (y0 * (1 - t) + y1 * t) / scale;
    return [x, y];
  }

  private createMatrices(viewerProps: ViewerProps) {
    const { fovy, aspect, near, far } = this;
    const {
      canvasWidth,
      canvasHeight,
      cameraOffset,
      cameraZoom,
      cameraPitch,
      cameraBearing,
    } = viewerProps;
    if (!canvasWidth || !canvasHeight) {
      return;
    }
    const scale = 2 ** cameraZoom;
    this.projectionMatrix = new Matrix4().perspective({
      fovy,
      aspect,
      near, // todo: find a way to calculate this from extent
      far, // todo: find a way to calculate this from extent
    });
    const vm = new Matrix4();
    vm.translate([0, 0, -this.altitude]);
    vm.rotateX(-cameraPitch * DEGREES_TO_RADIANS);
    vm.rotateZ(cameraBearing * DEGREES_TO_RADIANS);
    vm.scale([scale, scale, scale]);
    vm.translate([...cameraOffset, 0]);
    this.viewMatrix = vm;

    const pxm = new Matrix4();
    pxm.scale([canvasWidth / 2, -canvasHeight / 2, 1]);
    pxm.translate([1, -1, 0]);
    pxm.multiplyRight(this.projectionMatrix);
    this.pixelMatrix = pxm;
    this.invPixelMatrix = pxm.invert();
  }
}
