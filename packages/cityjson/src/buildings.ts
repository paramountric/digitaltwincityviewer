import { CityJSONV111 } from './CityJSONV111';
import { prepareBoundary, triangulate } from './boundary';
import { getModelMatrix, projectCoordinate } from './layer';

// wip: just a very quick test to see if colors works
// the colors can be set more granular in boundaries and semantics
function getColor(geometry) {
  const colors = {
    RoofSurface: [1, 0, 0],
    WallSurface: [1, 1, 1],
    GroundSurface: [0.5, 0.5, 0.5],
  };
  const surface = geometry.semantics.surfaces.find(s => s.type);
  return surface ? colors[surface.type] : [0, 0.5, 0];
}

// https://github.com/visgl/deck.gl/blob/8.7-release/modules/core/src/lib/layer.js
function encodePickingColor(i, target = []) {
  target[0] = (i + 1) & 255;
  target[1] = ((i + 1) >> 8) & 255;
  target[2] = (((i + 1) >> 8) >> 8) & 255;
  return target;
}

export function buildingsLayerSurfacesLod3Data(
  cityJson: CityJSONV111,
  addZ?: number
) {
  let vertexCount = 0;

  const layerProps = {
    data: {
      vertices: [],
      indices: [],
      colors: [],
      customPickingColors: [],
      objects: [],
    },
    modelMatrix: getModelMatrix(cityJson.metadata.geographicalExtent, addZ),
    autoHighlight: true,
    highlightColor: [100, 150, 250, 128],
  };

  const cityObjects = Object.values(cityJson.CityObjects).filter(
    obj => obj.type === 'Building'
  );
  let currentSurfaceType;
  let pickingColor = encodePickingColor(0);
  for (const cityObject of cityObjects) {
    const geometries = (cityObject.geometry as any) || [];
    for (const geometry of geometries) {
      const color = getColor(geometry);
      let boundaryIndex = 0;
      for (const boundary of geometry.boundaries) {
        const semantics =
          geometry.semantics.surfaces[geometry.semantics.values[boundaryIndex]];
        if (!currentSurfaceType) {
          currentSurfaceType = semantics.type;
        } else if (currentSurfaceType !== semantics.type) {
          layerProps.data.objects.push({
            type: semantics.type,
            properties: semantics,
          });
          pickingColor = encodePickingColor(layerProps.data.objects.length);
          currentSurfaceType = semantics.type;
        }
        boundaryIndex++;
        const { projected, unprojected } = prepareBoundary(
          boundary,
          cityJson.vertices,
          true, // flatten
          false, // close polygon
          undefined // transform
        );
        const { indices } = triangulate(projected);
        layerProps.data.indices.push(...indices.map(i => i + vertexCount));
        layerProps.data.vertices.push(...unprojected);
        const numVertices = projected.length / 3;
        for (let i = 0; i < numVertices; i++) {
          layerProps.data.colors.push(...color, 1);
          layerProps.data.customPickingColors.push(...pickingColor);
        }
        vertexCount += numVertices;
      }
    }
  }
  return layerProps;
}
