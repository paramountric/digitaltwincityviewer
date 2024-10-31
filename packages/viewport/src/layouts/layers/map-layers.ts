'use client';

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
import { DEFAULT_BACKGROUND_COLOR } from '../../constants';
import { CollisionFilterExtension } from '@deck.gl/extensions';

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
      const mvtGeometryLayer = createBaseMapMvtGeometryLayer({
        layout,
      });
      if (mvtGeometryLayer) {
        mapLayers.push(mvtGeometryLayer);
      }
      const mvtTextLayer = createBaseMapMvtTextLayer({
        layout,
      });
      if (mvtTextLayer) {
        mapLayers.push(mvtTextLayer);
      }
      break;
    case 'tile3d':
      const tile3dLayer = createTile3dLayer(layout);
      if (tile3dLayer) {
        mapLayers.push(tile3dLayer);
      }
      break;
    default:
      break;
  }

  mapLayers.push(...geoJsonLayers);

  return mapLayers;
}

function createBaseMapMvtTextLayer({ layout }) {
  const baseMapMvtUrl = process.env.NEXT_PUBLIC_MVT_URL;

  if (!baseMapMvtUrl) {
    console.warn('No base map mvt url found');
    return null;
  }

  const layerId = layout.getLayerId('basemap-mvt-text-layer');
  return new MVTLayer({
    id: layerId,
    data: baseMapMvtUrl,
    pointType: 'text',
    extruded: false, //layout.isTilted(),
    opacity: 1,
    stroked: false,
    filled: false,
    getLineWidth: 0,

    // TEXT /** GeoJsonLayer properties forwarded to `TextLayer` if `pointType` is `'text'` */
    getText: (layer: any) => {
      const typeFilter = ['town', 'city', 'neighbourhood', 'Forest'];
      const { name, type } = layer.properties;
      if (typeFilter.includes(type)) {
        return name;
      }
      return null;
      // const text = layout.getMapLayerText(layer);
    },
    getTextColor: [255, 255, 255, 255],
    // getTextAngle: (layer: any) => {
    //   console.log('layer', layer);
    //   return 0;
    // },
    getTextSize: (layer: any) => {
      const { type } = layer.properties;
      switch (type) {
        case 'city':
          return 16;
        case 'town':
          return 14;
        case 'neighbourhood':
          return 12;
        case 'Forest':
          return 10;
        default:
          return 0; // Don't render text for other types
      }
    },
    // getTextAnchor: 'center',
    // getTextAlignmentBaseline: 'center',
    // getTextPixelOffset: [0, 0],
    getTextBackgroundColor: [0, 0, 0, 255],
    // getTextBorderColor: [0, 0, 0, 255],
    // getTextBorderWidth: 0,
    // textSizeUnits: 'pixels',
    // textSizeScale: 1,
    // textSizeMinPixels: 0,
    // textSizeMaxPixels: Number.MAX_SAFE_INTEGER,
    textCharacterSet:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÆØÅæøåÄÖäöÉéÜüß',
    textFontFamily: 'Noto Sans, sans-serif',
    // textFontWeight: 'normal',
    // textLineHeight: 1,
    // textMaxWidth: 100,
    // textWordBreak: 'break-word', // TODO
    textBackground: true,
    // textBackgroundPadding: [0, 0, 0, 0],
    // textOutlineColor: [layout.getBackgroundColor() || DEFAULT_BACKGROUND_COLOR],
    // textOutlineWidth: 1,
    textBillboard: false,
    // textFontSettings: {
    //   sdf: true,
    // },

    // EXTENSIONS
    extensions: [new CollisionFilterExtension()],
    // extensions: parentNode.appearance?.showMapElevation
    //   ? [new TerrainExtension()]
    //   : [],
  }); // _MVTLayerProps)
}

function createBaseMapMvtGeometryLayer({ layout }) {
  const baseMapMvtUrl = process.env.NEXT_PUBLIC_MVT_URL;

  // This is due to problems with loading state
  setTimeout(() => {
    const creditsElement = document.getElementById('credits');
    if (creditsElement) {
      creditsElement.innerHTML = `<span>© <a href="https://www.mapbox.com/about/maps" target="_blank" rel="noopener noreferrer">Mapbox</a> © <a href="https://www.openstreetmap.org/about/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></span>`;
    }
  }, 1000);

  if (!baseMapMvtUrl) {
    console.warn('No base map mvt url found');
    return null;
  }

  const layerId = layout.getLayerId('basemap-mvt-geometry-layer');
  return new MVTLayer({
    id: layerId,
    data: baseMapMvtUrl,
    getElevation: (layer: any) => {
      // todo: figure out how to extrude layers, for example buildings -> convert layers to node types and set extrusion the the style?
      const { type, height } = layer.properties;
      if (type === 'building') {
        return height || 3;
      }
      return 0;
      // const elevation = layout.getNodeExtrusion(node) || 1;
      // return elevation;
    },
    pointType: '',
    stroked: true,
    filled: true,
    extruded: true, //layout.isTilted(),
    opacity: 1,
    getFillColor: (layer: any) => {
      const { type } = layer.properties;
      if (type === 'building') {
        return [255, 255, 255, 16];
      }
      return [0, 0, 0, 255];
    },
    getLineWidth: (layer: any) => {
      const { type } = layer.properties;
      if (type === 'building') {
        return 1;
      }
      return 0;
    },

    getLineColor: (layer: any) => {
      return [255, 255, 255, 255];
    },
  }); // _MVTLayerProps)
}

function createTile3dLayer(layout: Layout) {
  const tile3dUrl = process.env.NEXT_PUBLIC_TILE_3D_URL;
  const tile3dApiKey = process.env.NEXT_PUBLIC_TILE_3D_API_KEY;

  if (!tile3dUrl || !tile3dApiKey) {
    console.warn('No tile3d url or api key found');
    return null;
  }

  const tile3dLayerConfig = {
    id: layout.getLayerId('basemap-3d-tiles-layer'),
    data: process.env.NEXT_PUBLIC_TILE_3D_URL,
    loadOptions: {
      fetch: {
        headers: {
          'X-GOOG-API-KEY': process.env.NEXT_PUBLIC_TILE_3D_API_KEY,
        },
      },
    },
  };

  const creditsElement = document.getElementById('credits');
  const tile3dLayer = new Tile3DLayer({
    ...{
      id: tile3dLayerConfig.id,
      data: tile3dLayerConfig.data,
      loadOptions: tile3dLayerConfig.loadOptions,
    },
    operation: 'terrain+draw',
    onTilesetLoad: tileset3d => {
      // console.log('tileset3d', tileset3d);
      if (creditsElement) {
        tileset3d.options.onTraversalComplete = selectedTiles => {
          const credits = new Set();
          selectedTiles.forEach(tile => {
            const { copyright } = tile.content.gltf.asset;
            copyright.split(';').forEach(credits.add, credits);
            creditsElement.innerHTML = [...credits].join('; ');
          });
          return selectedTiles;
        };
      }
    },
    // onTileLoad: tileHeader => {
    //   console.log('tileHeader', tileHeader);
    // },
    // onTileError: (tileHeader, error) => {
    //   console.log('tileHeader', tileHeader);
    //   console.log('error', error);
    // },
  });

  return tile3dLayer;
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
