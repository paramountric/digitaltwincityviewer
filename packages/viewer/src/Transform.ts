// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Matrix4 } from '@math.gl/core';
import { ViewerProps } from './Viewer';

export class Transform {
  private needsUpdate = true;
  public projectionMatrix = Matrix4.IDENTITY;
  private fovy = (75 * Math.PI) / 180;
  private aspect = 1;
  private near = 0.1;
  private far = Infinity;
  constructor(viewerProps: ViewerProps) {
    this.create();
  }
  update(viewerProps: ViewerProps) {
    console.log('update transform');
  }
  create() {
    if (this.needsUpdate) {
      const { fovy, aspect, near, far } = this;
      this.projectionMatrix = new Matrix4().perspective({
        fovy,
        aspect,
        near,
        far,
      });
      this.needsUpdate = false;
    }
  }
}
