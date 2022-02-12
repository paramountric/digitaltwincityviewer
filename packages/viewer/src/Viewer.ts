import { AnimationLoop } from '@luma.gl/engine';
import { createGLContext, resizeGLContext } from '@luma.gl/gltools';
import { EventManager } from 'mjolnir.js';

// todo: transformations, eventmanager

type ViewerProps = {
  parent?: HTMLCanvasElement; // prepare for headless
  width?: number;
  height?: number;
};

export class Viewer {
  animationLoop: AnimationLoop;
  eventManager: EventManager;
  constructor(props: ViewerProps = {}) {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.id = 'dtcv-canvas';
    const parent = props.parent || document.body;
    parent.appendChild(canvas);

    this.animationLoop = new AnimationLoop({
      onCreateContext: opts => {
        const ctx = createGLContext({
          ...opts,
          canvas,
        });
        this.init(ctx, props);
        return ctx;
      },
      onRender: this.renderLayers.bind(this),
    });
    this.animationLoop.start({
      width: props.width,
      height: props.height,
    });
  }
  init(ctx: WebGLRenderingContext, props: ViewerProps) {
    resizeGLContext(ctx, {
      useDevicePixels: true,
      width: props.width || window.innerWidth,
      height: props.height || window.innerHeight,
    });
  }
  renderLayers() {
    console.log('render layers');
  }
}
