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
// examples: geojson, cityjson, citymodel -> the data will need to be converted into layers (use the type to determint the layers to create)
// sources/layers in UI menu
// note: it should be possible to feed layers directly, maybe source could optionally contain layer specs?
export type DataSourceProps = {
  id: string;
  type: 'box'; // create enum
  data: Box[];
  dataUrl: string;
};

export class DataSource {
  // loaders?
  // caching?
}
