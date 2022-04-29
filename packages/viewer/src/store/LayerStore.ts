// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { LayerProps, COORDINATE_SYSTEM } from '@deck.gl/core';
import {
  ScatterplotLayer,
  SolidPolygonLayer,
  GeoJsonLayer,
} from '@deck.gl/layers';
import GL from '@luma.gl/constants';
import { RootStore } from '../RootStore';
import { cityModelToGeoJson } from '../utils/converter';

// todo: try out a layer state observable to rerender the layer when something change
// this gives a viewstate, uistate, authstate and one for each layer props (at least)
const layerGroupCatalog: LayerGroupState[] = [
  {
    title: 'Ground',
    description: 'Ground layer',
    layers: [
      // {
      //   type: SimpleMeshLayer,
      //   props: {
      //     id: 'ground-mesh-layer',
      //     data: `https://dtcc-js-assets.s3.eu-north-1.amazonaws.com/${fileName}`,
      //     wireframe: false,
      //     coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //     parameters: {
      //       depthTest: true,
      //     },
      //   },
      // },
      {
        type: SolidPolygonLayer,
        data: [],
        url: 'http://localhost:9000/files/citymodel/Helsingborg2021.json',
        isLoaded: false,
        isLoading: false,
        props: {
          id: 'city-model',
          opacity: 0.7,
          autoHighlight: true,
          //material: 'material',
          //data: converted.buildings, //.slice(0, 1000),
          onClick: d => {
            //this.setSelectedObject(d.object);
          },
          // onDataLoad: (value, context) => {
          //   console.log(value, context, this);
          //   const converted = cityModelToGeoJson(value);
          //   context.layer.data = converted.buildings;
          //   return converted.buildings;
          //   // const layerProps = this.layerGroups[0]?.layers[0]?.props;
          //   // console.log(converted);
          //   // // layerProps.data = converted.buildings.filter(
          //   // //   f => f.geometry.type === 'Polygon' && f.properties.building
          //   // // );
          //   // layerProps.data = converted.buildings;
          //   // this.updateLayers();
          //   // return {};
          // },
          // onHover: (info) => {
          //   console.log(info);
          // },
          highlightColor: [100, 150, 250, 128],
          extruded: false,
          wireframe: true,
          pickable: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPolygon: d => d.geometry.coordinates,
          getFillColor: [200, 200, 220, 200],
          getLineColor: [100, 100, 100],
          getElevation: d => {
            return d.properties.height;
          },
          parameters: {
            depthMask: true,
            depthTest: true,
            blend: true,
            blendFunc: [
              GL.SRC_ALPHA,
              GL.ONE_MINUS_SRC_ALPHA,
              GL.ONE,
              GL.ONE_MINUS_SRC_ALPHA,
            ],
            polygonOffsetFill: true,
            depthFunc: GL.LEQUAL,
            blendEquation: GL.FUNC_ADD,
          },
          // id: 'city-model',
          // // opacity: 0.7,
          // // autoHighlight: true,
          // // material: 'material',
          // // data: [] <- note that data is a cached outside of the layer
          // onClick: d => {
          //   //this.setSelectedObject(d.object);
          // },
          // // onHover: (info) => {
          // //   console.log(info);
          // // },
          // highlightColor: [100, 150, 250, 128],
          // extruded: true,
          // wireframe: true,
          // pickable: true,
          // coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          // getPolygon: d => d.geometry.coordinates,
          // getFillColor: [200, 200, 220, 200],
          // getLineColor: [100, 100, 100],
          // getElevation: d => {
          //   return d.properties.height;
          // },
        },
      },
      // {
      //   type: GeoJsonLayer,
      //   props: {
      //     id: 'city-model',
      //     data: 'http://localhost:9000/files/geojson/osm-malmo.json',
      //     opacity: 0.7,
      //     autoHighlight: true,
      //     material: 'material',
      //     onClick: d => {
      //       //this.setSelectedObject(d.object);
      //     },
      //     // onHover: (info) => {
      //     //   console.log(info);
      //     // },
      //     highlightColor: [100, 150, 250, 128],
      //     extruded: true,
      //     wireframe: true,
      //     filled: true,
      //     pickable: true,
      //     //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //     getPolygon: d => d.geometry.coordinates,
      //     getFillColor: [200, 200, 220, 200],
      //     getLineColor: [100, 100, 100],
      //     getElevation: d => {
      //       return d.properties.height || 10;
      //     },
      //   },
      // },
      // {
      //   type: SolidPolygonLayer,
      //   props: {
      //     id: 'city-model',
      //     data: 'http://localhost:9000/files/geojson/osm-malmo.json',
      //     opacity: 0.7,
      //     autoHighlight: true,
      //     material: 'material',
      //     onClick: d => {
      //       //this.setSelectedObject(d.object);
      //     },
      //     // onHover: (info) => {
      //     //   console.log(info);
      //     // },
      //     highlightColor: [100, 150, 250, 128],
      //     extruded: true,
      //     wireframe: true,
      //     filled: true,
      //     pickable: true,
      //     //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //     getPolygon: d => d.geometry.coordinates,
      //     getFillColor: [200, 200, 220, 200],
      //     getLineColor: [100, 100, 100],
      //     getElevation: d => {
      //       return d.properties.height || 10;
      //     },
      //   },
      // },
      // {
      //   type: TileLayer,
      //   props: {
      //     id: 'building-tiles',
      //     data: [],
      //   },
      // },
      // {
      //   type: Tile3DLayer,
      //   props: {
      //     id: 'tile-3d-layer',
      //     //data: 'http://localhost:9000/files/gltf/1.0/TilesetWithTreeBillboards/tileset.json',
      //     //data: 'http://localhost:9000/files/gltf/1.0/TilesetWithDiscreteLOD/tileset.json',
      //     data: 'http://localhost:9000/files/gltf/1.0/TilesetWithRequestVolume/tileset.json',
      //     //getPosition: [0, 0, 0],
      //     // override scenegraph subLayer prop
      //     // _subLayerProps: {
      //     //   scenegraph: { _lighting: 'flat' },
      //     // },
      //   },
      // },
      // {
      //   type: ScatterplotLayer,
      //   props: {
      //     id: 'test-layer',
      //     data: [
      //       {
      //         coordinates: [-75.61209429047926, 40.04253061601606],
      //       },
      //     ],
      //     pickable: true,
      //     opacity: 0.8,
      //     stroked: true,
      //     filled: true,
      //     radiusScale: 6,
      //     radiusMinPixels: 1,
      //     radiusMaxPixels: 100,
      //     lineWidthMinPixels: 1,
      //     getPosition: d => d.coordinates,
      //     getRadius: d => 10,
      //     getFillColor: d => [255, 140, 0],
      //     getLineColor: d => [0, 0, 0],
      //     //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //   },
      // },
    ],
  },
];

type LayerGroupState = {
  title: string;
  description: string;
  layers: Layer[];
};

class Layer {
  type: any;
  url?: string;
  isLoaded: boolean;
  isLoading: boolean;
  data: any; // data will be loaded separtely and used as props.data in LayerProps when loaded (the built in layer loader was disabled due to some tricky need for customization)
  props: LayerProps;
}

export class LayerStore {
  layerGroups: LayerGroupState[];
  rootStore: RootStore;
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.layerGroups = layerGroupCatalog;
    //this.updateLayers();
    //this.loadLayers();
    // reaction(
    //   () => this.layerGroups,
    //   newGroups => {
    //     console.log(newGroups);
    //   }
    // );
  }
  // loadLayers() {
  //   const layers = this.getLayers();
  //   console.log(layers);
  //   for (const layer of layers) {
  //     if (!layer.isLoaded) {
  //       layer.instance = new layer.type(layer.props);
  //       console.log(layer.instance);
  //       layer.instance.props.fetch(
  //         `https://dtcc-js-assets.s3.eu-north-1.amazonaws.com/${fileName}`
  //       );
  //     }
  //   }
  // }
  // async onDataLoad(value, context) {
  //   console.log(value, context, this);
  //   const converted = cityModelToGeoJson(value);
  //   const layerProps = this.layerGroups[0]?.layers[0]?.props;
  //   console.log(converted);
  //   // layerProps.data = converted.buildings.filter(
  //   //   f => f.geometry.type === 'Polygon' && f.properties.building
  //   // );
  //   layerProps.data = converted.buildings;
  //   this.updateLayers();
  //   return {};
  // }
  getLayers() {
    return this.layerGroups.reduce((acc, group) => {
      return [...acc, ...group.layers];
    }, []);
  }
  getLayersInstances() {
    const layers = this.getLayers();
    return layers.reduce((acc, layer) => {
      if (layer.isLoading) {
        return acc;
      } else if (!layer.isLoaded) {
        console.log('load: ', layer.url);
        this.loadLayer(layer);
        return acc;
      }
      return [...acc, new layer.type(layer.props)];
    }, []);
  }
  setLayerProps(layerId, props = {}, layerSettings = {}) {
    // todo: look into immutability
    const layerGroup = this.layerGroups.find(layerGroup =>
      layerGroup.layers.find(layer => layer.props.id === layerId)
    );
    const layer = layerGroup.layers.find(layer => layer.props.id === layerId);
    Object.assign(layer, layerSettings);
    layer.props = Object.assign(layer.props, props);
    console.log('update layerProps', layer);
  }
  renderLayers() {
    this.rootStore.render();
  }

  async loadLayer(layer: Layer) {
    if (!layer.url) {
      console.warn('No data url has been given for this layer');
      return;
    }
    this.setLayerProps(layer.props.id, null, { isLoading: true });
    const cityModel = await fetch(layer.url);
    const json = await cityModel.json();
    const converted = cityModelToGeoJson(json);

    this.setLayerProps(
      layer.props.id,
      { data: converted.buildings },
      { isLoaded: true, isLoading: false }
    );
    this.renderLayers();
    // layers: [
    //   new SolidPolygonLayer({
    //     id: 'city-model',
    //     opacity: 0.7,
    //     autoHighlight: true,
    //     //material: 'material',
    //     data: converted.buildings, //.slice(0, 1000),
    //     onClick: d => {
    //       //this.setSelectedObject(d.object);
    //     },
    //     // onDataLoad: (value, context) => {
    //     //   console.log(value, context, this);
    //     //   const converted = cityModelToGeoJson(value);
    //     //   context.layer.data = converted.buildings;
    //     //   return converted.buildings;
    //     //   // const layerProps = this.layerGroups[0]?.layers[0]?.props;
    //     //   // console.log(converted);
    //     //   // // layerProps.data = converted.buildings.filter(
    //     //   // //   f => f.geometry.type === 'Polygon' && f.properties.building
    //     //   // // );
    //     //   // layerProps.data = converted.buildings;
    //     //   // this.updateLayers();
    //     //   // return {};
    //     // },
    //     // onHover: (info) => {
    //     //   console.log(info);
    //     // },
    //     highlightColor: [100, 150, 250, 128],
    //     extruded: false,
    //     wireframe: true,
    //     pickable: false,
    //     coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    //     getPolygon: d => d.geometry.coordinates,
    //     getFillColor: [200, 200, 220, 200],
    //     getLineColor: [100, 100, 100],
    //     getElevation: d => {
    //       return d.properties.height;
    //     },
    //     parameters: {
    //       depthMask: true,
    //       depthTest: true,
    //       blend: true,
    //       blendFunc: [
    //         gl.SRC_ALPHA,
    //         gl.ONE_MINUS_SRC_ALPHA,
    //         gl.ONE,
    //         gl.ONE_MINUS_SRC_ALPHA,
    //       ],
    //       polygonOffsetFill: true,
    //       depthFunc: gl.LEQUAL,
    //       blendEquation: gl.FUNC_ADD,
    //     },
    //   }),
    // ],
  }
}
