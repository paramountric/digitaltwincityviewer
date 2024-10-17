import {
  ScatterplotLayer,
  GeoJsonLayer,
  BitmapLayer,
} from '@deck.gl/layers/typed';
import { PickingInfo, Color } from '@deck.gl/core/typed';
import {
  MVTLayer,
  TerrainLayer,
  Tile3DLayer,
  TileLayer,
} from '@deck.gl/geo-layers/typed';
import { Layout } from '../layout';
import { _MVTLayerProps } from '@deck.gl/geo-layers/typed/mvt-layer/mvt-layer';
import { Feature } from '../..';

interface IMapLayer {
  features: Feature[];
  layout: Layout;
}

export function getMapLayers({ features, layout }: IMapLayer) {
  const mapLayers = [];

  const geoJsonLayers = getGeoJsonLayers(layout, features);

  switch (layout.baseMap) {
    case 'none':
      mapLayers.push(...geoJsonLayers);
      return mapLayers;
      break;
    case 'mvt':
      const mvtLayer = createBaseMapMvtLayer({
        layout,
      });
      if (mvtLayer) {
        mapLayers.push(mvtLayer);
      }
      break;
    //   case 'tiles3d':
    //     const tile3dLayers = createTile3dLayers(layout, viewId);
    //     mapLayers.push(...tile3dLayers);
    //     break;
    default:
      break;
  }

  mapLayers.push(...geoJsonLayers);

  return mapLayers;
}

// function createTile3dLayers(layout: Layout, viewId: string) {
//   const tile3dLayers = [];

//   if (process.env.NEXT_PUBLIC_MVT_URL) {
//     this.mvtLayerConfig = {
//       basemapMvt: {
//         id: 'basemapMvt',
//         data: process.env.NEXT_PUBLIC_MVT_URL,
//       },
//     };
//   }
//   if (
//     process.env.NEXT_PUBLIC_TILE_3D_URL &&
//     process.env.NEXT_PUBLIC_TILE_3D_API_KEY
//   ) {
//     this.tile3dLayerConfig = {
//       basemap3d: {
//         id: 'basemap3d',
//         data: process.env.NEXT_PUBLIC_TILE_3D_URL,
//         loadOptions: {
//           fetch: {
//             headers: {
//               'X-GOOG-API-KEY': process.env.NEXT_PUBLIC_TILE_3D_API_KEY,
//             },
//           },
//         },
//       },
//     };
//   }

//   const creditsElement = document.getElementById('credits');
//   if (layout.tile3dLayerConfig) {
//     Object.keys(layout.tile3dLayerConfig).forEach(tile3dLayerConfigKey => {
//       const tile3dLayerConfig = layout.tile3dLayerConfig[tile3dLayerConfigKey];
//       console.log('tile3dLayerConfig', tile3dLayerConfig);
//       tile3dLayers.push(
//         new Tile3DLayer({
//           ...{
//             id: layout.getLayerId(tile3dLayerConfigKey, viewId),
//             data: tile3dLayerConfig.data,
//             loadOptions: tile3dLayerConfig.loadOptions,
//           },
//           operation: 'terrain+draw',
//           onTilesetLoad: tileset3d => {
//             // console.log('tileset3d', tileset3d);
//             if (creditsElement) {
//               tileset3d.options.onTraversalComplete = selectedTiles => {
//                 const credits = new Set();
//                 selectedTiles.forEach(tile => {
//                   const { copyright } = tile.content.gltf.asset;
//                   copyright.split(';').forEach(credits.add, credits);
//                   creditsElement.innerHTML = [...credits].join('; ');
//                 });
//                 return selectedTiles;
//               };
//             }
//           },
//           // onTileLoad: tileHeader => {
//           //   console.log('tileHeader', tileHeader);
//           // },
//           // onTileError: (tileHeader, error) => {
//           //   console.log('tileHeader', tileHeader);
//           //   console.log('error', error);
//           // },
//         })
//       );
//     });
//   }

//   return tile3dLayers;
// }

function createBaseMapMvtLayer({ layout }) {
  const baseMapMvtUrl = process.env.NEXT_PUBLIC_MVT_URL;

  if (!baseMapMvtUrl) {
    console.warn('No base map mvt url found');
    return null;
  }

  const layerId = layout.getLayerId('basemap-mvt-layer');
  return new MVTLayer({
    id: layerId,
    data: baseMapMvtUrl,
    textOutlineColor: [255, 255, 255, 255],
    textOutlineWidth: 1,
    getTextBackgroundColor: [255, 255, 255, 255],
    getElevation: (layer: any) => {
      // todo: figure out how to extrude layers, for example buildings -> convert layers to node types and set extrusion the the style?
      return 1;
      // const elevation = layout.getNodeExtrusion(node) || 1;
      // return elevation;
    },
    // pointType: 'circle+text',
    extruded: false, //layout.isTilted(),
    textFontFamily: 'Verdana',
    opacity: 1,
    getFillColor: (layer: any) => {
      return [0, 0, 0, 255];
    },
    getLineWidth: 1,
    getText: (layer: any) => {
      return layer.properties.name || '';
      // const text = layout.getMapLayerText(layer);
      // return text;
    },
    getTextColor: [0, 0, 0, 255],
    getTextSize: 16,
    getLineColor: (layer: any) => {
      return [255, 255, 255, 255];
    },
    // extensions: parentNode.appearance?.showMapElevation
    //   ? [new TerrainExtension()]
    //   : [],
  }); // _MVTLayerProps)
}

// create a list of mvt layers here from the users

//   function createMvtLayers({
//     layout,
//   }: IMapLayer) {
//     const mvtLayers = [];

//     let mvtLayerConfig = {};

//     if (layout.mvtLayerConfig) {
//       Object.keys(layout.mvtLayerConfig).forEach(mvtLayerConfigKey => {
//         const mvtLayerConfig = layout.mvtLayerConfig[mvtLayerConfigKey];
//         const layerId = layout.getLayerId(mvtLayerConfigKey, viewId);
//         mvtLayers.push(
//           new MVTLayer({
//             ...mvtLayerConfig,
//             ...{
//               id: layerId,
//               textOutlineColor: [255, 255, 255, 255],
//               textOutlineWidth: 1,
//               getTextBackgroundColor: [255, 255, 255, 255],
//               getElevation: (layer: any) => {
//                 // todo: figure out how to extrude layers, for example buildings -> convert layers to node types and set extrusion the the style?
//                 return 1;
//                 // const elevation = layout.getNodeExtrusion(node) || 1;
//                 // return elevation;
//               },
//               pointType: 'circle+text',
//               extruded: false, //layout.isTilted(),
//               textFontFamily: 'Verdana',
//               opacity: 1,
//               getFillColor: (layer: any) => {
//                 if (
//                   mvtLayerConfigKey === 'basemapMvt' &&
//                   layer.properties?.name
//                 ) {
//                   // console.log(layer.properties);
//                 }
//                 const feature: NodeProps = {
//                   key: layer.properties.layerName,
//                   type: layer.properties.type,
//                   namespace: layout.parentNodeProps.namespace,
//                   properties: layer.properties,
//                 };
//                 // console.log('type', feature.type);
//                 return layout.getNodeFillColor(feature, null, feature.type);
//               },
//               getLineWidth: 1,
//               getText: (layer: any) => {
//                 return layer.properties.name || null;
//                 // const text = layout.getMapLayerText(layer);
//                 // return text;
//               },
//               getTextColor: [0, 0, 0, 255],
//               getTextSize: 16,
//               getLineColor: (layer: any) => {
//                 const strokeColor = mvtLayerConfig[layer.type] || [
//                   0, 0, 255, 255,
//                 ];
//                 return strokeColor as Color;
//               },
//               // extensions: parentNode.appearance?.showMapElevation
//               //   ? [new TerrainExtension()]
//               //   : [],
//             },
//           } as any) // _MVTLayerProps)
//         );
//       });
//     }
//     return mvtLayers;
//   }

function getGeoJsonLayers(layout: Layout, features: Feature[]) {
  const geoJsonLayers: GeoJsonLayer[] = [];

  const updateTriggers = {};

  // if no specific layers are specified, return all features
  if (features.length > 0) {
    geoJsonLayers.push(
      new GeoJsonLayer({
        id: layout.getLayerId('default-geojson-layer'),
        data: features,
        pickable: true,
        pointType: 'circle',
        lineWidthScale: 1,
        lineWidthMinPixels: 2,
        lineWidthMaxPixels: 4,

        getFillColor: (node: any) => {
          return [0, 0, 0, 255];
        },
        getLineColor: (node: any) => {
          return [255, 255, 255, 255];
        },
        getLineWidth: 2,
        getElevation: (node: any) => {
          return 1;
        },
        lineWidthUnits: 'pixels',
        // dataComparator: (a: any, b: any) => {
        //   console.log('compare', a, b);
        //   return true;
        // },
        // onHover: (info: any) => {
        //   // if (disableInteraction) {
        //   //   return;
        //   // }
        //   if (!info || !info.object) {
        //     interactionManager.onNodeLeave();
        //     return;
        //   }
        //   if (info.object instanceof Node) {
        //     interactionManager.onNodeEnter(info.object);
        //   }
        // },
        // onDragStart: (info: any) => {
        //   // if (disableInteraction) {
        //   //   return;
        //   // }
        //   const { coordinate, object } = info;
        //   if (coordinate && object && object instanceof Node) {
        //     interactionManager.onNodeDragStart(coordinate, object);
        //   }
        // },
        // onDrag: (info: PickingInfo) => {
        //   // if (disableInteraction) {
        //   //   return;
        //   // }
        //   interactionManager.onNodeDrag(info.coordinate as [number, number], [
        //     info.x,
        //     info.y,
        //   ]);
        // },
        // onDragEnd: () => {
        //   // if (disableInteraction) {
        //   //   return;
        //   // }
        //   interactionManager.onNodeDragEnd();
        // },
        // onClick: (info: any) => {
        //   // if (disableInteraction) {
        //   //   return;
        //   // }
        //   const { coordinate, object } = info;
        //   if (coordinate && object && object instanceof Node) {
        //     interactionManager.onNodeClick(object);
        //   }
        // },
        extruded: layout.isTilted(),
        stroked: !layout.isTilted(),
        filled: true, // set this with opacity on nodes, since nodes will need to be filled in some way mostly
        updateTriggers,
        getPointRadius: 100,
        //   terrainDrawMode: 'drape',
        //   extensions: layout.showBaseMapTerrain ? [new TerrainExtension()] : [],
      })
    );
  }
  return geoJsonLayers;
}
