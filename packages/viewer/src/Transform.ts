// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Matrix4 } from '@math.gl/core';
import { ViewerProps } from './Viewer';

const PI = Math.PI;
const DEGREES_TO_RADIANS = PI / 180;
const FOV = 75;
const FOV_RADIANS = FOV * DEGREES_TO_RADIANS;

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
    const { xOffset, yOffset } = viewerProps;
    this.xMin = -xOffset;
    this.yMin = -yOffset;
    this.xMax = xOffset;
    this.yMax = yOffset;
    this.update(viewerProps);
  }
  public update(viewerProps: ViewerProps) {
    const { xOffset, yOffset } = viewerProps;
    if (!xOffset || !yOffset) {
      return;
    }
    // todo: check what has updated and set this.needsUpdate flag
    this.createMatrices(viewerProps);
  }
  private createMatrices(viewerProps: ViewerProps) {
    if (this.needsUpdate) {
      const { fovy, aspect, near, far } = this;
      const { width, height, zoom, pitch, bearing } = viewerProps;
      if (!width || !height || !zoom) {
        return;
      }
      const scale = 2 ** zoom;
      this.projectionMatrix = new Matrix4().perspective({
        fovy,
        aspect,
        near, // todo: find a way to calculate this from extent
        far, // todo: find a way to calculate this from extent
      });
      const vm = new Matrix4();
      vm.translate([0, 0, -this.altitude]);
      vm.rotateX(-pitch * DEGREES_TO_RADIANS);
      vm.rotateZ(bearing * DEGREES_TO_RADIANS);
      vm.scale([scale, scale, scale]);
      this.viewMatrix = vm;
      this.needsUpdate = false;
    }
  }
}
