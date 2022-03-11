// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { LayerProps } from './Layer';

// provide an API to the viewer with the DataSource
// examples: geojson, cityjson, citymodel -> the data will need to be converted into layers (use the type to determine the layers to create)
// sources/layers in UI menu
export type DataSourceProps = {
  id: string;
  type: string; // create enum
  data?: 'sourceData'; // create different data types that match to the type enum specified
  dataUrl?: string;
  layers?: any;
};

export class DataSource {
  constructor(sourceProps: DataSourceProps) {
    console.log('init source and start processing / loading');
  }
  // loaders?
  // caching?
}
