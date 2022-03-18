// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Transform } from './Transform';
import { Viewer } from './Viewer';

type LayerProps = {
  id: string;
};

export abstract class Layer {
  gl: WebGLRenderingContext;
  transform: Transform;
  props: LayerProps;
  // todo: consider if sending in viewer instance in layer is good. Either the Layer class needs the Viewer instance, or the context parameters needed can be sent separately (Layer might need more things from Viewer later)
  constructor(viewer: Viewer, layerProps: LayerProps) {
    const { gl, timeline } = viewer.context;
    this.gl = gl;
    this.transform = viewer.transform;
  }

  getInstancePickingColors(numInstances) {
    let instancePickingColors = [];
    for (let i = 0; i < numInstances; i++) {
      instancePickingColors = instancePickingColors.concat(
        this.indexToColor(i)
      );
    }
    return instancePickingColors;
  }

  // encode first bit as unselected
  indexToColor(index) {
    return [
      (index + 1) & 255,
      ((index + 1) >> 8) & 255,
      ((index + 1) >> 16) & 255,
    ];
  }

  colorToIndex(color) {
    return color[0] + color[1] * 256 + color[2] * 65536 - 1;
  }

  abstract render({ moduleSettings: any }): void;
}
