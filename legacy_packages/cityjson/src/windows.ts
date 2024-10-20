import { CityJSONV111 } from './CityJSONV111.js';
import { prepareBoundary, triangulate } from './boundary.js';
import { getLayerPosition, LayerMatrixOptions, LayerProps } from './layer.js';

// wip: just a very quick test to see if colors works
// the colors can be set more granular in boundaries and semantics
function getColor(surface) {
  const colors = {
    RoofSurface: [1, 0, 0],
    WallSurface: [1, 1, 1],
    GroundSurface: [0.5, 0.5, 0.5],
    Window: [0.5, 0.5, 1],
    Door: [1, 1, 0.5],
  };
  if (!surface) {
    return [0, 0.5, 0];
  }

  return colors[surface.type] || [0, 0.5, 0];
}

// https://github.com/visgl/deck.gl/blob/8.7-release/modules/core/src/lib/layer.js
function encodePickingColor(i, target = []) {
  target[0] = (i + 1) & 255;
  target[1] = ((i + 1) >> 8) & 255;
  target[2] = (((i + 1) >> 8) >> 8) & 255;
  return target;
}

function meshFromPolygons(
  cityJson,
  cityObject,
  geometry,
  vertexCount,
  layerProps: LayerProps
) {
  let currentSurfaceType;
  let pickingColor = encodePickingColor(0);
  let boundaryIndex = 0;
  let meshVertexCount = 0;
  for (const boundary of geometry.boundaries) {
    const color = getColor(geometry.semantics?.surfaces[boundaryIndex]);
    const semantics =
      geometry.semantics.surfaces[geometry.semantics.values[boundaryIndex]];
    if (!currentSurfaceType) {
      currentSurfaceType = semantics.type;
    } else if (currentSurfaceType !== semantics.type) {
      layerProps.data.objects.push({
        cityObjectId: cityObject.id as string,
        id: geometry.id,
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
    layerProps.data.indices.push(
      ...indices.map(i => i + vertexCount + meshVertexCount)
    );
    layerProps.data.vertices.push(...unprojected);
    const numVertices = projected.length / 3;
    for (let i = 0; i < numVertices; i++) {
      layerProps.data.colors.push(...color, 1);
      layerProps.data.customPickingColors.push(...pickingColor);
    }
    meshVertexCount += numVertices;
  }
  return meshVertexCount;
}

function meshFromSolids(
  cityJson,
  cityObject,
  geometry,
  vertexCount,
  layerProps: LayerProps
) {
  let currentSurfaceType;
  let pickingColor = encodePickingColor(0);
  let boundaryIndex = 0;
  let innerBoundaryIndex = 0;
  let meshVertexCount = 0;
  for (const boundary of geometry.boundaries) {
    for (const innerBoundary of boundary) {
      const semanticSurfaceIndex =
        geometry.semantics.values[boundaryIndex][innerBoundaryIndex];
      const semantics = geometry.semantics.surfaces[semanticSurfaceIndex];
      innerBoundaryIndex++;
      const color = getColor(semantics);

      // add the object data to the layerProps
      // note that since the surfaces are sometimes splitted into random segments, this will at least merge surfaces by the same type if adjacent in the structure
      // obviously this is not a proper solution, but for now the test data files should be read as they are constructed (pointer has been made in email)
      if (!currentSurfaceType) {
        currentSurfaceType = semantics.type;
      } else if (currentSurfaceType !== semantics.type) {
        layerProps.data.objects.push({
          cityObjectId: cityObject.id as string,
          id: geometry.id,
          type: semantics.type,
          properties: semantics,
        });
        pickingColor = encodePickingColor(layerProps.data.objects.length);
        currentSurfaceType = semantics.type;
      }
      const { projected, unprojected } = prepareBoundary(
        innerBoundary,
        cityJson.vertices,
        true, // flatten
        false, // close polygon
        undefined // transform
      );
      const { indices } = triangulate(projected);
      layerProps.data.indices.push(
        ...indices.map(i => i + vertexCount + meshVertexCount)
      );
      layerProps.data.vertices.push(...unprojected);
      const numVertices = projected.length / 3;
      for (let i = 0; i < numVertices; i++) {
        layerProps.data.colors.push(...color, 1);
        layerProps.data.customPickingColors.push(...pickingColor);
      }
      meshVertexCount += numVertices;
    }
    boundaryIndex++;
  }
  return meshVertexCount;
}

export function buildingsLayerWindowsLod3Data(
  cityJson: CityJSONV111,
  options: LayerMatrixOptions
) {
  let vertexCount = 0;

  // find a way to reuse layer position between layer
  // yet there needs to a way to modify layer individually
  const { modelMatrix, center, min, max, width, height } = getLayerPosition(
    cityJson.metadata.geographicalExtent,
    options
  );

  const layerProps: LayerProps = {
    data: {
      vertices: [],
      indices: [],
      colors: [],
      customPickingColors: [],
      objects: [],
    },
    modelMatrix,
    center,
    min,
    max,
    width,
    height,
    autoHighlight: true,
    highlightColor: [100, 150, 250, 128],
  };

  const cityObjects = Object.values(cityJson.CityObjects).filter(
    obj => obj.type === 'Building'
  );

  for (const cityObject of cityObjects) {
    const geometries = (cityObject.geometry as any) || [];
    for (const geometry of geometries) {
      if (geometry.type === 'Polygon') {
        console.log('polyugon', geometry);
        vertexCount += meshFromPolygons(
          cityJson,
          cityObject,
          geometry,
          vertexCount,
          layerProps
        );
      } else if (geometry.type === 'Solid') {
        vertexCount += meshFromSolids(
          cityJson,
          cityObject,
          geometry,
          vertexCount,
          layerProps
        );
      } else {
        console.log(geometry);
      }
    }
  }
  console.log('buildings data', layerProps);
  return layerProps;
}
