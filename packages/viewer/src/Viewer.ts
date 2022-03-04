// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { AnimationLoop, ProgramManager } from '@luma.gl/engine';
import { AnimationLoopProps } from '@luma.gl/engine/src/lib/animation-loop';
import {
  createGLContext,
  resizeGLContext,
  setParameters,
} from '@luma.gl/gltools';
import { vec2 } from 'gl-matrix';
import { project } from '@luma.gl/shadertools';
import { clear } from '@luma.gl/webgl';
import { EventManager } from 'mjolnir.js';
import { Transform } from './Transform';
import { DataSource, DataSourceProps } from './DataSource';
import { Layer } from './Layer';
import { HammerInput } from 'mjolnir.js/dist/es5/types';

export type ViewerProps = {
  center?: [number, number];
  canvasParent?: HTMLCanvasElement; // prepare for headless
  width?: number;
  height?: number;
  cityLon?: number;
  cityLat?: number;
  cityExtentRadius?: number;
  cameraOffset?: [x: number, y: number];
  zoom?: number;
  cameraPitch?: number;
  cameraBearing?: number;
  sources?: DataSourceProps[];
  onInit?: () => void;
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
  layers: { [id: string]: Layer };
  context: {
    gl: WebGLRenderingContext;
  };
  dragMode: number; // 0 = nodrag, 1 = pan, 2 = rotate
  dragStart: [number, number];
  mouse: [number, number];
  mouseDown: [number, number] | null;
  mouseLast: [number, number] = [0, 0];
  zoomStart: [number, number] = [0, 0];
  needsRender = true;
  constructor(viewerProps: ViewerProps = {}) {
    this.props = defaultViewerProps;
    this.sources = {};
    this.layers = {};
    // create and append canvas
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'dtcv-canvas';
    this.props.width = this.props.width || window.innerWidth;
    this.props.height = this.props.height || window.innerHeight;
    canvas.style.width = Number.isFinite(this.props.width)
      ? `${this.props.width}px`
      : '100%';
    canvas.style.height = Number.isFinite(this.props.height)
      ? `${this.props.height}px`
      : '100%';
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
    this.handleEvent = this.handleEvent.bind(this);
    this.eventManager = new EventManager(animationLoopProps.gl.canvas, {
      events: {
        panstart: this.handleEvent,
        panmove: this.handleEvent,
        panend: this.handleEvent,
        pointermove: this.handleEvent,
        click: this.handleEvent,
        wheel: this.handleEvent,
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
  private render() {
    if (!this.needsRender) {
      return;
    }
    if (this.context?.gl) {
      const { gl } = this.context;
      clear(gl, { color: [1, 1, 1, 1] });
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      for (const layer of Object.values(this.layers)) {
        layer.render();
      }
    }
    this.needsRender = false;
  }
  private handleEvent(event) {
    const eventType = event.type;
    switch (eventType) {
      case 'wheel':
        this.transform.onMouseWheel(event);
        break;
      case 'pointermove':
        this.transform.onMouseMove(event);
        break;
      case 'panend':
        this.transform.onDragEnd(event);
        break;
      case 'panstart':
        this.transform.onDragStart(event);
        break;
      // case 'panmove':
      //   this.onDrag(event);
      //   break;
      // case 'panend':
      //   this.onDragEnd(event);
      //   break;
    }
    this.needsRender = true;
  }
  // private onDragStart(evt) {
  //   const { center, rightButton, leftButton } = evt;
  //   const { x, y } = center;
  //   this.dragMode = rightButton ? 2 : leftButton ? 1 : 0;
  //   this.dragStart = [x, y];
  // }
  // private onDragEnd(evt: HammerInput) {
  //   this.dragMode = 0;
  // }
  // private onDrag(evt) {
  //   const { width, height } = this.props;
  //   const [x, y] = this.mouse;
  //   const [lastX, lastY] = this.dragStart;
  //   const [dx, dy] = [x - lastX, y - lastY];
  //   const [diffX, diffY] = this.transform.pixelPointToPoint([
  //     dx * 2 + width * 0.5,
  //     dy * 2 + height * 0.5,
  //   ]);
  //   const [xOffset, yOffset] = this.props.cameraOffset;
  //   this.props.cameraOffset = [xOffset + diffX, yOffset + diffY];
  //   this.transform.setProps(this.props);
  //   this.needsRender = true;
  //   this.dragStart = [x, y];
  // }
  // private onMouseDown(evt) {
  //   const { x, y } = evt.center;
  //   this.mouseDown = [x, y];
  // }
  // private onMouseUp(evt) {
  //   this.mouseDown = null;
  // }
  // private onMouseMove(evt: HammerInput) {
  //   if (this.transform) {
  //     const { x, y } = evt.center;
  //     this.mouse = [x, y];
  //     //console.log(this.transform.pixelPointToPoint(this.mouse));
  //   }
  // }
  // private onMouseWheel(evt) {
  //   evt.preventDefault();
  //   console.log(evt);
  //   if (this.transform) {
  //     const delta = evt.delta;
  //     const [x, y] = this.mouse || [0, 0];
  //     // note: the transform is used in between targetPoint and diff
  //     const targetPointA = this.transform.pixelPointToPoint([x, y]);
  //     this.props.zoom = this.transform.getZoom(-delta);
  //     const [offsetX, offsetY] = this.props.cameraOffset; //this.transform.pixelPointToPoint(this.pixelCenter);

  //     // do the transform update
  //     this.transform.setProps(this.props);

  //     const targetPointB = this.transform.pixelPointToPoint([x, y]);

  //     const xDiff = targetPointB[0] - offsetX;
  //     const yDiff = targetPointB[1] - offsetY;
  //     const newX = targetPointA[0] - xDiff;
  //     const newY = targetPointA[1] - yDiff;

  //     console.log('target a', targetPointA);
  //     console.log('target b', targetPointB);
  //     console.log('xdiff', xDiff);
  //     console.log('ydiff', yDiff);

  //     this.props.cameraOffset = [newX, newY];
  //     this.transform.setProps(this.props);
  //     this.needsRender = true;
  //   }
  // }
  // private onClick(evt: HammerInput) {
  //   console.log(evt);
  // }
}
