// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { AnimationLoop, ProgramManager } from '@luma.gl/engine';
import { AnimationLoopProps } from '@luma.gl/engine/src/lib/animation-loop';
import {
  createGLContext,
  resizeGLContext,
  setParameters,
} from '@luma.gl/gltools';
import { project } from '@luma.gl/shadertools';
import { clear } from '@luma.gl/webgl';
import { EventManager } from 'mjolnir.js';
import { Transform } from './Transform';
import { DataSource, DataSourceProps } from './DataSource';
import { Layer } from './Layer';

export type ViewerProps = {
  canvasParent?: HTMLCanvasElement; // prepare for headless
  canvasWidth?: number;
  canvasHeight?: number;
  cityLon?: number;
  cityLat?: number;
  cityExtentRadius?: number;
  cameraOffset?: [x: number, y: number];
  cameraZoom?: number;
  cameraPitch?: number;
  cameraBearing?: number;
  sources?: DataSourceProps[];
  onInit?: () => void;
};

const defaultViewerProps: ViewerProps = {
  cameraOffset: [0, 0],
};

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
    // const { cityLon, cityLat } = viewerProps;
    // if (cityLon && cityLat) {
    //   const overrideX = getMetersX(cityLon);
    //   const overrideY = getMetersY(cityLat);
    // }
    this.props = defaultViewerProps;
    this.sources = {};
    this.layers = {};
    // create and append canvas
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'dtcv-canvas';
    const parent = viewerProps.canvasParent || document.body;
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
      width: viewerProps.canvasWidth,
      height: viewerProps.canvasHeight,
    });
  }
  public update(viewerProps: ViewerProps): void {
    const { cityLon, cityLat } = viewerProps;
    if (
      (cityLon && cityLon !== this.props.cityLon) ||
      (cityLat && cityLat !== this.props.cityLat)
    ) {
      // todo: this means loading a different city
    }
    Object.assign(this.props, viewerProps);
    this.updateTransform();
  }
  private updateTransform() {
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
    this.programManager.addDefaultModule(project);
    resizeGLContext(animationLoopProps.gl, {
      useDevicePixels: true,
      width: this.props.canvasWidth || window.innerWidth,
      height: this.props.canvasHeight || window.innerHeight,
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
          this.layers[layerProps.id] = new Layer(this, layerProps);
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
        cameraOffset: [
          this.props.cameraOffset[0] + evt.deltaX,
          this.props.cameraOffset[1] + evt.deltaY,
        ],
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
