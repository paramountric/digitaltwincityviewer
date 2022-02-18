// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { AnimationLoop, ProgramManager } from '@luma.gl/engine';
import { AnimationLoopProps } from '@luma.gl/engine/src/lib/animation-loop';
import {
  createGLContext,
  resizeGLContext,
  setParameters,
} from '@luma.gl/gltools';
import { clear } from '@luma.gl/webgl';
import { EventManager } from 'mjolnir.js';
import { Transform } from './Transform';
import { DataSource, DataSourceProps } from './DataSource';
import { Layer } from './Layer';

export type ViewerProps = {
  parent?: HTMLCanvasElement; // prepare for headless
  width?: number;
  height?: number;
  longitude?: number;
  latitude?: number;
  xCenter?: number;
  yCenter?: number;
  // todo: change offset to extent
  xOffset?: number;
  yOffset?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  sources?: DataSourceProps[];
  onInit?: () => void;
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
  programManager: ProgramManager;
  sources: { [id: string]: DataSource };
  layers: { [id: string]: Layer };
  context: {
    gl: WebGLRenderingContext;
  };
  constructor(viewerProps: ViewerProps = {}) {
    const { longitude, latitude } = viewerProps;
    if (longitude && latitude) {
      const overrideX = getMetersX(longitude);
      const overrideY = getMetersY(latitude);
      viewerProps.xCenter = overrideX;
      viewerProps.yCenter = overrideY;
    }
    this.props = viewerProps;
    this.sources = {};
    this.layers = {};
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
    this.animationLoop = new AnimationLoop(defaultAnimationLoopProps);
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
      // todo: need to figure out how to check if viewerProps has changed
      // for now it will always recalculate transform below (if it's initialized)
    }
    Object.assign(this.props, viewerProps);
    if (this.transform) {
      console.log(this.props);
      this.transform.update(this.props);
      this.updateSources(this.props);
    }
  }
  private init(animationLoopProps: AnimationLoopProps) {
    setParameters(animationLoopProps.gl, {
      blend: true,
      polygonOffsetFill: true,
      depthTest: true,
    });
    this.eventManager = new EventManager(animationLoopProps.gl.canvas, {
      events: {
        panstart: this.onDragStart.bind(this),
        panmove: this.onDrag.bind(this),
        panend: this.onDragEnd.bind(this),
        pointermove: this.onMouseMove.bind(this),
        click: this.onClick.bind(this),
      },
    });
    this.transform = new Transform(this.props);
    // Note: there is a deprecation warning on Program in Luma v8. Look continuously into the v9 progress (Feb 2022 it's still in review).
    this.programManager = new ProgramManager(animationLoopProps.gl);
    resizeGLContext(animationLoopProps.gl, {
      useDevicePixels: true,
      width: this.props.width || window.innerWidth,
      height: this.props.height || window.innerHeight,
    });
    this.context = {
      gl: animationLoopProps.gl,
    };
    if (this.props.onInit) {
      this.props.onInit();
    }
  }
  private updateSources(viewerProps: ViewerProps) {
    // ? sourceManager maybe
    const { sources = [] } = viewerProps;
    for (const sourceProps of sources) {
      // todo: initialize source class here, start load data, preprocess data, cache data, etc
      this.sources[sourceProps.id] = new DataSource(sourceProps);
      const { layers = [] } = sourceProps;
      // todo: the source should build the data for the layers async and call update when resolved
      if (this.context?.gl) {
        for (const layerProps of layers) {
          // todo: need to check layers state here, update or add layer only if needed
          this.layers[layerProps.id] = new Layer(this.context.gl, layerProps);
        }
      }
    }
  }
  private renderLayers() {
    if (this.context?.gl) {
      const { gl } = this.context;
      clear(gl, { color: [1, 1, 1, 1] });
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      for (const layer of Object.values(this.layers)) {
        layer.render();
      }
    }
  }
  private onDragStart(evt: HammerInput) {
    //console.log(evt);
  }
  private onDrag(evt: HammerInput) {
    if (this.transform) {
      const newProps = Object.assign({}, this.props, {
        xCenter: this.props.xCenter + evt.deltaX,
        yCenter: this.props.yCenter + evt.deltaY,
      });
      this.update(newProps);
    }
  }
  private onDragEnd(evt: HammerInput) {
    //console.log(evt);
  }
  private onMouseMove(evt: HammerInput) {
    //console.log(evt);
  }
  private onClick(evt: HammerInput) {
    console.log(evt);
  }
}
