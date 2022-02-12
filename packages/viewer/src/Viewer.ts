import { AnimationLoop } from '@luma.gl/engine';
import { AnimationLoopProps } from '@luma.gl/engine/src/lib/animation-loop';
import { createGLContext, resizeGLContext } from '@luma.gl/gltools';
import { EventManager } from 'mjolnir.js';

// todo: transformations, eventmanager

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
    this.animationLoop = new AnimationLoop({
      onCreateContext: ctxOptions =>
        createGLContext({
          ...ctxOptions,
          canvas,
        }),
      onInitialize: this.init.bind(this),
      onRender: this.renderLayers.bind(this),
    });
    this.animationLoop.start({
      width: viewerProps.width,
      height: viewerProps.height,
    });
  }
  init(animationLoopProps: AnimationLoopProps) {
    resizeGLContext(animationLoopProps.gl, {
      useDevicePixels: true,
      width: this.props.width || window.innerWidth,
      height: this.props.height || window.innerHeight,
    });
  }
  renderLayers() {
    console.log('render layers');
  }
}
