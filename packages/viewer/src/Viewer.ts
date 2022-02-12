import { AnimationLoop } from '@luma.gl/engine';
import { AnimationLoopProps } from '@luma.gl/engine/src/lib/animation-loop';
import { createGLContext, resizeGLContext } from '@luma.gl/gltools';
import { EventManager } from 'mjolnir.js';
import { MjolnirEvent } from 'mjolnir.js/dist/es5/types';

type ViewerProps = {
  parent?: HTMLCanvasElement; // prepare for headless
  width?: number;
  height?: number;
};

export class Viewer {
  props: ViewerProps;
  animationLoop: AnimationLoop;
  eventManager: EventManager;
  constructor(viewerProps: ViewerProps = {}) {
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
    (this.animationLoop = new AnimationLoop(
      Object.assign(defaultAnimationLoopProps)
    )),
      this.update(viewerProps);
    this.animationLoop.start({
      width: viewerProps.width,
      height: viewerProps.height,
    });
  }
  public update(viewerProps: ViewerProps): void {
    Object.assign(this.props, viewerProps);
    console.log();
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
    resizeGLContext(animationLoopProps.gl, {
      useDevicePixels: true,
      width: this.props.width || window.innerWidth,
      height: this.props.height || window.innerHeight,
    });
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
