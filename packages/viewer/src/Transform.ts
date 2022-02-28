// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Matrix4 } from '@math.gl/core';
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
  private needsUpdate = true;
  public projectionMatrix = Matrix4.IDENTITY;
  public viewMatrix = Matrix4.IDENTITY;
  private fovy = FOV_RADIANS;
  private altitude = 0.5 / Math.tan(0.5 * FOV_RADIANS);
  private aspect = 1;
  private near = 0.1;
  private far = Infinity;
  private xMin: number;
  private yMin: number;
  private xMax: number;
  private yMax: number;
  constructor(viewerProps: ViewerProps) {
    const { cityExtentRadius } = viewerProps;
    this.xMin = -cityExtentRadius;
    this.yMin = -cityExtentRadius;
    this.xMax = cityExtentRadius;
    this.yMax = cityExtentRadius;
    this.update(viewerProps);
  }
  public update(viewerProps: ViewerProps) {
    const { cityExtentRadius } = viewerProps;
    if (!cityExtentRadius) {
      return;
    }
    // todo: check what has updated and set this.needsUpdate flag
    this.createMatrices(viewerProps);
  }
  public getUniforms() {
    return {};
  }
  private createMatrices(viewerProps: ViewerProps) {
    if (this.needsUpdate) {
      const { fovy, aspect, near, far } = this;
      const {
        canvasWidth,
        canvasHeight,
        cameraZoom,
        cameraPitch,
        cameraBearing,
      } = viewerProps;
      if (!canvasWidth || !canvasHeight || !cameraZoom) {
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
      this.viewMatrix = vm;
      this.needsUpdate = false;
    }
  }
}
