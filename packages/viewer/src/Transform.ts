// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Matrix4 } from '@math.gl/core';
import { ViewerProps } from './Viewer';

export class Transform {
  private needsUpdate = true;
  public projectionMatrix = Matrix4.IDENTITY;
  public viewMatrix = Matrix4.IDENTITY;
  private fovy = (75 * Math.PI) / 180;
  private aspect = 1;
  private near = 0.1;
  private far = Infinity;
  constructor(viewerProps: ViewerProps) {
    this.update(viewerProps);
  }
  public update(viewerProps: ViewerProps) {
    const { xMin, yMin, xMax, yMax } = viewerProps;
    if (!xMin || !yMin || !xMax || yMax) {
      return;
    }
    // todo: check what has updated and set this.needsUpdate flag
    this.createMatrices(viewerProps);
  }
  private createMatrices(viewerProps: ViewerProps) {
    if (this.needsUpdate) {
      const { fovy, aspect, near, far } = this;
      const { width, height, zoom } = viewerProps;
      if (!width || !height || !zoom) {
        return;
      }
      this.projectionMatrix = new Matrix4().perspective({
        fovy,
        aspect,
        near, // todo: find a way to calculate this from extent
        far, // todo: find a way to calculate this from extent
      });
      this.viewMatrix = new Matrix4();
      this.needsUpdate = false;
    }
  }
}
