import { AnimationLoop } from '@luma.gl/engine';
import { createGLContext } from '@luma.gl/gltools';
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
    canvas.id = 'canvas';
    const parent = props.parent || document.body;
    parent.appendChild(canvas);

    this.animationLoop = new AnimationLoop({
      onCreateContext: opts =>
        createGLContext({
          ...opts,
          canvas,
        }),
      onRender: this.renderLayers.bind(this),
    });
    this.animationLoop.start({
      width: props.width,
      height: props.height,
    });
  }
  renderLayers() {
    console.log('render layers');
  }
}
