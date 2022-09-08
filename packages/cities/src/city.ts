// The viewer will have a mandatory reference city id baked into the project app
export type City = {
  id: string;
  // for now this is webmercator
  x: number;
  y: number;
  lng: number;
  lat: number;
  name: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  distanceScale: {
    unitsPerMeter: number[]; // [x, y, z]
    metersPerUnit: number[]; // [x, y, z]
    unitsPerDegree: number[]; // [x, y, z]
    degreesPerUnit: number[]; // [x, y, z]
  };
  startZoom: number; // one pixel is one meter
};
