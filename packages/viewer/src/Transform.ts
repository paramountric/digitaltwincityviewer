// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License
// Heavily inspired by https://github.com/maplibre/maplibre-gl-js/blob/main/src/geo/transform.ts (Copyright (c) 2020, Mapbox under a BSD-3-Clause license)

import { mat4, vec4, vec2 } from 'gl-matrix';
import { Point } from './Point';
import { ViewerProps } from './Viewer';

const disableCameraRotation = false;

type Bounds = {
  nw: Point;
  ne: Point;
  se: Point;
  sw: Point;
};

export class Transform {
  mousePosition: [number, number] = [0, 0];
  mouseDown: [number, number];
  mouseUp: [number, number];
  mouseLast: [number, number];
  pixelMatrix = mat4.create();
  invPixelMatrix = mat4.create();
  projMatrix = mat4.create();
  invProjMatrix = mat4.create();
  viewMatrix = mat4.create();
  invViewMatrix = mat4.create();
  viewProjectionMatrix = mat4.create();
  projectionOffset = vec4.create();
  width: number;
  height: number;
  zoom: number;
  minZoom = 0;
  maxZoom = 18;
  phi: number;
  theta: number;
  degreesPerPixelPitch = -0.5;
  degreesPerPixelBearing = 0.2;
  center: Point;
  pixelCenter: [number, number];
  needsUpdate: boolean;
  dragState: 'NONE' | 'PAN' | 'ROTATE';
  bounds: Bounds;
  constructor(props: ViewerProps) {
    this.setProps(props);
  }

  public setProps(props: ViewerProps) {
    const { center, width, height, zoom, cameraPitch, cameraBearing } = props;
    this.width = width;
    this.height = height;
    this.zoom = zoom || 0;
    this.phi = cameraPitch || 0; // polar angle
    this.theta = cameraBearing || 0; // azimuthal angle
    this.degreesPerPixelPitch = -0.5;
    this.degreesPerPixelBearing = 0.2;
    this.setCenter(center || new Point(0, 0));
  }

  get scale() {
    return 2 ** this.zoom;
  }

  get worldSize() {
    return this.scale;
  }

  setZoom(zoom) {
    if (!zoom && zoom !== 0) {
      zoom = this.zoom;
    }
    this.zoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom);
    this.update();
  }

  setCenter(p: Point | [number, number]) {
    this.center = p instanceof Point ? p : new Point(...p);
    this.update();
    this.pixelCenter = this.pointToPixelPoint(this.center);
  }

  get fov() {
    return 0.6435011087932844;
  }

  get bearing() {
    return this.theta * (180 / Math.PI);
  }

  set bearing(b) {
    const theta = b * (Math.PI / 180);
    if (this.theta === theta) {
      return;
    }
    this.theta = theta;
    this.update();
  }

  get pitch() {
    return this.phi * (180 / Math.PI);
  }

  set pitch(p) {
    const phi = Math.min(Math.max(p, 0), 70) * (Math.PI / 180);
    if (this.phi === phi) return;
    this.phi = phi;
    this.update();
  }

  get zoomSpeed() {
    return 0.95 ** 1;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.update();
  }

  pan(thisPoint: [number, number], lastPoint: [number, number]) {
    const panDelta = vec2.sub(vec2.create(), thisPoint, lastPoint);
    // take diff of current pixel mouse and delta
    const mouse = this.mousePosition;
    const newPoint = vec2.sub([0, 0], mouse, panDelta) as [number, number];
    // set center to this new pixel point
    const targetCoord = this.pixelPointToPoint(newPoint);
    this.setPointToPixelPoint(targetCoord, mouse);
    this.update();
  }

  rotate(thisPoint: [number, number], lastPoint: [number, number]) {
    if (disableCameraRotation) {
      return;
    }
    const bearingDelta =
      (thisPoint[0] - lastPoint[0]) * this.degreesPerPixelBearing;
    const pitchDelta =
      (thisPoint[1] - lastPoint[1]) * this.degreesPerPixelPitch;
    this.bearing += bearingDelta;
    this.pitch += pitchDelta;
    this.update();
  }

  onMouseDown(e) {
    const { center, rightButton, leftButton } = e;
    const { x, y } = center;
    this.mouseDown = [x, y];
    this.dragState = rightButton ? 'ROTATE' : leftButton ? 'PAN' : 'NONE';
  }

  onMouseUp(e) {
    const { x, y } = e.center;
    this.mouseUp = [x, y];
    this.dragState = 'NONE';
  }

  onMouseMove(e) {
    e.preventDefault();
    const { x, y } = e.center;
    const thisPoint = [x, y] as [number, number];
    const lastPoint = this.mouseLast || this.mouseDown;
    // set mouse state
    this.mousePosition = thisPoint;
    switch (this.dragState) {
      case 'ROTATE':
        this.rotate(thisPoint, lastPoint);
        break;
      case 'PAN':
        this.pan(thisPoint, lastPoint);
        break;
      default:
    }
    this.mouseLast = [x, y];
  }

  onContextMenu(e) {
    e.preventDefault();
  }

  onMouseWheel(e) {
    e.preventDefault();
    const delta = e.delta;
    const { x, y } = e.center;
    const pixelPoint = [x, y] as [number, number];
    let scale;
    if (delta > 0) {
      scale = this.scale / this.zoomSpeed;
    } else if (delta < 0) {
      scale = this.scale * this.zoomSpeed;
    }
    // use the pixel matrix before zoom is done to find the target
    const targetPoint = this.pixelPointToPoint(pixelPoint);
    this.zoom = Math.log(scale) / Math.LN2;
    this.update();
    // now use the target to update center (this will set the center to the "old" point)
    this.setPointToPixelPoint(targetPoint, pixelPoint);
    // update mouse state
    this.mousePosition = pixelPoint;
  }

  // take a point and set this to a pixel point
  // the map center will be updated
  setPointToPixelPoint(point: Point, pixelPoint: [number, number]) {
    // get the new mouse position and center (run pixelmatrix after changes)
    const a = this.pixelPointToPoint(pixelPoint);
    const b = this.pixelPointToPoint(this.pixelCenter);
    const xDiff = a.x - b.x;
    const yDiff = a.y - b.y;
    const newX = point.x - xDiff;
    const newY = point.y - yDiff;
    this.setCenter(new Point(newX, newY));
  }

  pixelPointToPoint(pixelPoint: [number, number]) {
    const targetZ = 0;
    const coord0 = [...pixelPoint, 0, 1] as vec4;
    const coord1 = [...pixelPoint, 1, 1] as vec4;
    vec4.transformMat4(coord0, coord0, this.invPixelMatrix);
    vec4.transformMat4(coord1, coord1, this.invPixelMatrix);

    const x0 = coord0[0] / coord0[3];
    const x1 = coord1[0] / coord1[3];
    const y0 = coord0[1] / coord0[3];
    const y1 = coord1[1] / coord1[3];
    const z0 = coord0[2] / coord0[3];
    const z1 = coord1[2] / coord1[3];
    const t = z0 === z1 ? 0 : (targetZ - z0) / (z1 - z0);
    const x = (x0 * (1 - t) + x1 * t) / this.worldSize;
    const y = (y0 * (1 - t) + y1 * t) / this.worldSize;
    return new Point(x, y);
  }

  pointToPixelPoint(point: Point): [number, number] {
    const p = [
      point.x * this.worldSize,
      point.y * this.worldSize,
      0,
      1,
    ] as vec4;
    vec4.transformMat4(p, p, this.pixelMatrix);
    return [p[0] / p[3], p[1] / p[3]];
  }

  getBounds() {
    return this.bounds || this.calculateBounds();
  }

  getBbox(): [minX: number, minY: number, maxX: number, maxY: number] {
    const bounds = this.getBounds();
    if (!bounds) {
      return [-1, -1, 1, 1];
    }
    return [bounds.sw.x, bounds.sw.y, bounds.ne.x, bounds.ne.y];
  }

  calculateBounds() {
    const w = this.width;
    const h = this.height;
    if (!w || !h) {
      return null;
    }
    const nw = this.pixelPointToPoint([0, 0]);
    const ne = this.pixelPointToPoint([w, 0]);
    const se = this.pixelPointToPoint([w, h]);
    const sw = this.pixelPointToPoint([0, h]);
    this.bounds = {
      nw,
      ne,
      se,
      sw,
    };
    return this.bounds;
  }

  public getUniforms() {
    return {
      viewMatrix: this.viewMatrix,
      projectionMatrix: this.projMatrix,
      viewProjectionMatrix: this.viewProjectionMatrix,
      projectionOffset: this.projectionOffset,
    };
  }

  update() {
    const w = this.width;
    const h = this.height;
    if (!w || !h) {
      return;
    }
    const { center } = this;
    if (!center) {
      return;
    }
    const { worldSize } = this;
    const x = center.x * worldSize;
    const y = center.y * worldSize;
    const { fov } = this;
    const halfFov = fov / 2;
    const dist = (0.5 / Math.tan(halfFov)) * h;

    let m = mat4.create();
    mat4.perspective(m, fov, w / h, 1, 10000);
    mat4.scale(m, m, [1, -1, 1]);
    mat4.translate(m, m, [0, 0, -dist]);
    mat4.rotateX(m, m, this.phi);
    mat4.rotateZ(m, m, -this.theta);
    mat4.translate(m, m, [-x, -y, 0]);

    this.projMatrix = m;
    this.invProjMatrix = mat4.invert(mat4.create(), this.projMatrix);

    m = mat4.create();
    mat4.scale(m, m, [this.scale, this.scale, this.scale]);
    this.viewMatrix = m;
    this.invViewMatrix = mat4.invert(mat4.create(), this.viewMatrix);

    const vpm = mat4.create();
    mat4.multiply(vpm, vpm, this.projMatrix);
    mat4.multiply(vpm, vpm, this.viewMatrix);
    this.viewProjectionMatrix = vpm;

    this.projectionOffset = vec4.transformMat4(
      vec4.create(),
      [x, y, 0, 1],
      this.viewProjectionMatrix
    );

    m = mat4.create();
    mat4.scale(m, m, [w / 2, -h / 2, 1]);
    mat4.translate(m, m, [1, -1, 0]);
    this.pixelMatrix = mat4.multiply(mat4.create(), m, this.projMatrix);
    this.invPixelMatrix = mat4.invert(mat4.create(), this.pixelMatrix);

    if (!this.invPixelMatrix || !this.invProjMatrix) {
      throw new Error('inv matrix error');
    }

    this.calculateBounds();
  }
}
