const MAX_LAT = 85.051129;

export class Point {
  x: number;
  y: number;
  z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get lng() {
    return this.x * 360 - 180;
  }

  set lng(lng) {
    this.x = (180 + lng) / 360;
  }

  get lat() {
    const y2 = 180 - this.y * 360;
    return (360 / Math.PI) * Math.atan(Math.exp(y2 * (Math.PI / 180))) - 90;
  }

  set lat(lat) {
    const validLat = Math.min(MAX_LAT, Math.max(-MAX_LAT, lat));
    this.y =
      (180 -
        (180 / Math.PI) *
          Math.log(Math.tan(Math.PI / 4 + validLat * (Math.PI / 360)))) /
      360;
  }

  get lngLat() {
    return {
      lat: this.lat,
      lng: this.lng,
    };
  }

  set lngLat(lngLat) {
    this.lat = lngLat.lat;
    this.lng = lngLat.lng;
  }

  clone() {
    return new Point(this.x, this.y, this.z);
  }

  add(p) {
    this.x += p.x;
    this.y += p.y;
    this.z += p.z || 0;
    return this;
  }

  sub(p) {
    this.x -= p.x;
    this.y -= p.y;
    this.z -= p.z || 0;
    return this;
  }

  div(p) {
    this.x /= p.x || 1;
    this.y /= p.y || 1;
    this.z /= p.z || 1;
    return this;
  }
}
