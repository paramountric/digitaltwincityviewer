// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

// A test box
type Box = {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
};

// provide an API to the viewer with the DataSource
// examples: geojson, cityjson, citymodel -> the data will need to be converted into layers
// sources/layers in UI menu
export type DataSourceProps = {
  data: Box[];
  dataUrl: string;
};

export class DataSource {
  // loaders?
  // caching?
}
