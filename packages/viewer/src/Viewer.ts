// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { AnimationLoop } from '@luma.gl/engine';
import { AnimationLoopProps } from '@luma.gl/engine/src/lib/animation-loop';
import { createGLContext, resizeGLContext } from '@luma.gl/gltools';
import { EventManager } from 'mjolnir.js';
import { MjolnirEvent } from 'mjolnir.js/dist/es5/types';
import { Transform } from './Transform';
import { DataSourceProps } from './DataSource';

export type ViewerProps = {
  parent?: HTMLCanvasElement; // prepare for headless
  width?: number;
  height?: number;
  longitude?: number;
  latitude?: number;
  xCenter?: number;
  yCenter?: number;
  xOffset?: number;
  yOffset?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  sources?: DataSourceProps[];
};

const PI = Math.PI;
const PI_4 = PI / 4;
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

export class Viewer {
  props: ViewerProps;
  animationLoop: AnimationLoop;
  eventManager: EventManager;
  transform: Transform;
  constructor(viewerProps: ViewerProps = {}) {
    const { longitude, latitude } = viewerProps;
    if (longitude && latitude) {
      const overrideX = getMetersX(longitude);
      const overrideY = getMetersY(latitude);
      viewerProps.xCenter = overrideX;
      viewerProps.yCenter = overrideY;
    }
    this.props = viewerProps;
    // create and append canvas
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'dtcv-canvas';
    const parent = viewerProps.parent || document.body;
    parent.appendChild(canvas);
    // create animation loop and start
    const defaultAnimationLoopProps: AnimationLoopProps = {
      onCreateContext: ctxOptions =>
        createGLContext({
          ...ctxOptions,
          canvas,
        }),
      onInitialize: this.init.bind(this),
      onRender: this.renderLayers.bind(this),
    };
    this.animationLoop = new AnimationLoop(
      Object.assign(defaultAnimationLoopProps)
    );
    this.update(viewerProps);
    this.animationLoop.start({
      width: viewerProps.width,
      height: viewerProps.height,
    });
  }
  public update(viewerProps: ViewerProps): void {
    const { xCenter, yCenter, longitude, latitude } = viewerProps;
    if (
      (xCenter && xCenter !== this.props.xCenter) ||
      (yCenter && yCenter !== this.props.yCenter) ||
      (longitude && longitude !== this.props.longitude) ||
      (latitude && latitude !== this.props.latitude)
    ) {
      return console.warn(
        'Fixme: viewer location is changed, the viewer needs to be reset'
      );
    }
    Object.assign(this.props, viewerProps);
    if (this.transform) {
      this.transform.update(this.props);
      this.updateLayers(this.props);
    }
  }
  private init(animationLoopProps: AnimationLoopProps) {
    this.eventManager = new EventManager(animationLoopProps.gl.canvas, {
      events: {
        panstart: this.onDragStart,
        panmove: this.onDrag,
        panend: this.onDragEnd,
        pointermove: this.onMouseMove,
        click: this.onClick,
      },
    });
    this.transform = new Transform(this.props);
    resizeGLContext(animationLoopProps.gl, {
      useDevicePixels: true,
      width: this.props.width || window.innerWidth,
      height: this.props.height || window.innerHeight,
    });
  }
  private updateLayers(viewerProps: ViewerProps) {
    // todo: create sources from source props, start load data, preprocess data, cache data
    // todo: create layers
    console.log('update layers');
  }
  private renderLayers() {
    console.log('render layers');
  }
  private onDragStart(evt: MjolnirEvent) {
    console.log(evt);
  }
  private onDrag(evt: MjolnirEvent) {
    console.log(evt);
  }
  private onDragEnd(evt: MjolnirEvent) {
    console.log(evt);
  }
  private onMouseMove(evt: MjolnirEvent) {
    console.log(evt);
  }
  private onClick(evt: MjolnirEvent) {
    console.log(evt);
  }
}
