// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { AnimationLoop, ProgramManager, Timeline } from '@luma.gl/engine';
import { AnimationLoopProps } from '@luma.gl/engine/src/lib/animation-loop';
import {
  createGLContext,
  resizeGLContext,
  setParameters,
} from '@luma.gl/gltools';
import { cssToDevicePixels, isWebGL2, withParameters } from '@luma.gl/gltools';
import {
  clear,
  Framebuffer,
  Texture2D,
  readPixelsToArray,
} from '@luma.gl/webgl';
import { EventManager } from 'mjolnir.js';
import { Transform } from './Transform';
import { DataSource, DataSourceProps } from './DataSource';
import { GeoJsonBuildingLayer } from './GeoJsonBuildingLayer';
import GL from '@luma.gl/constants';
import { PointOfInterestLayer } from './PointOfInterestLayer';

export type ViewerProps = {
  center?: [number, number];
  canvasParent?: HTMLCanvasElement; // prepare for headless
  width?: number;
  height?: number;
  cityLngLat?: [number, number];
  cityExtentRadius?: number;
  cameraOffset?: [x: number, y: number];
  zoom?: number;
  cameraPitch?: number;
  cameraBearing?: number;
  sources?: DataSourceProps[];
  onInit?: () => void;
};

const layerTypes = {
  'geojson-building': GeoJsonBuildingLayer,
  'point-of-interest': PointOfInterestLayer,
};

const defaultViewerProps: ViewerProps = {
  cameraOffset: [0, 0],
  cameraPitch: 0,
  cameraBearing: 0,
  zoom: 0,
};

export class Viewer {
  props: ViewerProps;
  animationLoop: AnimationLoop;
  eventManager: EventManager;
  transform: Transform;
  programManager: ProgramManager;
  sources: { [id: string]: DataSource };
  layers: { [id: string]: GeoJsonBuildingLayer }; // todo: use a generic solution for layer types
  context: {
    gl: WebGLRenderingContext;
    timeline: Timeline;
  };
  dragMode: number; // 0 = nodrag, 1 = pan, 2 = rotate
  dragStart: [number, number];
  mouse: [number, number];
  mouseDown: [number, number] | null;
  mouseLast: [number, number] = [0, 0];
  zoomStart: [number, number] = [0, 0];
  needsRender = true;
  picking: [number, number] | null;
  pickingFramebuffer: Framebuffer;
  depthFramebuffer: Framebuffer;
  pickedColor: Uint8Array;
  constructor(viewerProps: ViewerProps = {}) {
    this.props = defaultViewerProps;
    this.sources = {};
    this.layers = {};
    // create and append canvas
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'dtcv-canvas';
    this.props.width = this.props.width || window.innerWidth;
    this.props.height = this.props.height || window.innerHeight;
    const parent = viewerProps.canvasParent || document.body;
    parent.appendChild(canvas);
    // create animation loop and start
    const defaultAnimationLoopProps: AnimationLoopProps = {
      autoResizeViewport: true,
      autoResizeDrawingBuffer: true,
      onCreateContext: ctxOptions =>
        createGLContext({
          ...ctxOptions,
          webgl1: false, // webgl2 is required
          canvas,
        }),
      onInitialize: this.init.bind(this),
      onRender: this.render.bind(this),
    };
    this.animationLoop = new AnimationLoop(defaultAnimationLoopProps);
    this.update(viewerProps);
    this.animationLoop.start({
      width: viewerProps.width,
      height: viewerProps.height,
    });
  }
  public update(viewerProps: ViewerProps): void {
    Object.assign(this.props, viewerProps);
    this.updateTransform();
  }
  private updateTransform() {
    if (this.transform) {
      this.transform.setProps(this.props);
      this.updateSources(this.props);
    }
  }
  private init(animationLoopProps: AnimationLoopProps) {
    setParameters(animationLoopProps.gl, {
      blend: true,
      polygonOffsetFill: true,
      depthTest: true,
    });
    const timeline = new Timeline();
    timeline.play();
    this.animationLoop.attachTimeline(timeline);
    this.handleEvent = this.handleEvent.bind(this);
    this.eventManager = new EventManager(animationLoopProps.gl.canvas, {
      events: {
        mouseup: this.handleEvent,
        mousemove: this.handleEvent,
        mousedown: this.handleEvent,
        click: this.handleEvent,
        wheel: this.handleEvent,
        contextmenu: this.handleEvent,
      },
    });
    this.transform = new Transform(this.props);
    // Note: there is a deprecation warning on Program in Luma v8. Look continuously into the v9 progress (Feb 2022 it's still in review).
    // const programManager = ProgramManager.getDefaultProgramManager(
    //   animationLoopProps.gl
    // );
    // programManager.addDefaultModule(project);

    resizeGLContext(animationLoopProps.gl, {
      useDevicePixels: true,
      width: this.props.width,
      height: this.props.height,
    });
    this.context = {
      gl: animationLoopProps.gl,
      timeline,
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
          if (!layerTypes[layerProps.type]) {
            console.warn(
              `Layer type of type: ${layerProps.type} is not implemented`
            );
            continue;
          }
          // todo: need to check layers state here, update or add layer only if needed
          const LayerType = layerTypes[layerProps.type];
          this.layers[layerProps.id] = new LayerType(this, layerProps);
        }
      }
    }
  }
  private render() {
    if (!this.needsRender) {
      return;
    }
    if (this.context?.gl) {
      const { gl } = this.context;
      clear(gl, { color: [1, 1, 1, 1] });
      this.pick();
      for (const layer of Object.values(this.layers)) {
        layer.render({
          moduleSettings: {
            pickingSelectedColorValid: true,
            pickingActive: false,
            pickingHighlightColor: [0, 255, 0, 0.5],
            pickingSelectedColor: this.pickedColor,
          },
        });
      }
    }
    this.needsRender = false;
  }
  private handleEvent(event) {
    event.preventDefault();
    const eventType = event.type;
    switch (eventType) {
      case 'wheel':
        this.transform.onMouseWheel(event);
        break;
      case 'mousemove':
        this.transform.onMouseMove(event);
        this.onMouseMove(event);
        break;
      case 'mousedown':
        this.transform.onMouseDown(event);
        break;
      case 'mouseup':
        this.transform.onMouseUp(event);
        break;
    }
    this.needsRender = true;
  }
  private onMouseMove(event) {
    if (event.leftButton || event.rightButton) {
      return;
    }
    if (event.type === 'pointerleave') {
      this.picking = null;
      return;
    }
    if (!event.offsetCenter) {
      return;
    }
    const { x, y } = event.offsetCenter;
    this.picking = [x, y];
  }
  private pick() {
    if (this.context?.gl && this.picking) {
      const { gl } = this.context;
      const { width, height } = gl.canvas;
      const devicePixelRange = cssToDevicePixels(gl, this.picking, true);
      const devicePixel = [
        devicePixelRange.x + Math.floor(devicePixelRange.width / 2),
        devicePixelRange.y + Math.floor(devicePixelRange.height / 2),
      ];
      this.pickingFramebuffer = new Framebuffer(gl);
      this.pickingFramebuffer.resize({
        width,
        height,
      });

      this.depthFramebuffer = new Framebuffer(gl);
      this.depthFramebuffer.attach({
        [GL.COLOR_ATTACHMENT0]: new Texture2D(gl, {
          format: GL.RGBA32F,
          type: GL.FLOAT,
        }),
      });
      this.depthFramebuffer.resize({
        width,
        height,
      });

      withParameters(
        gl,
        {
          framebuffer: this.pickingFramebuffer,
          sissorTest: true,
          scissor: [...devicePixel, 1, 1],
          clearColor: [0, 0, 0, 0],
          depthMask: true,
          depthTest: true,
          depthRange: [0, 1],
          colorMask: [true, true, true, true],
          blend: true,
          blendFunc: [GL.ONE, GL.ZERO, GL.CONSTANT_ALPHA, GL.ZERO],
          blendEquation: GL.FUNC_ADD,
          blendColor: [0, 0, 0, 0],
        },
        () => {
          for (const layer of Object.values(this.layers)) {
            layer.render({
              moduleSettings: {
                pickingSelectedColorValid: false,
                pickingActive: true,
              },
            });
          }
        }
      );
      const pickedColor = new Uint8Array(4);
      readPixelsToArray(this.pickingFramebuffer, {
        sourceX: devicePixel[0],
        sourceY: devicePixel[1],
        sourceWidth: 1,
        sourceHeight: 1,
        target: pickedColor,
      });
      this.pickedColor = pickedColor;
      this.picking = null;
    }
  }
}
