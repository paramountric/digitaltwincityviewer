import { vec3, mat4 } from 'gl-matrix';
import proj4 from 'proj4';

proj4.defs(
  'EPSG:3008',
  '+proj=tmerc +lat_0=0 +lon_0=13.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
  'EPSG:3006',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

function parseGround(fileData) {
  const {
    GroundSurface: groundSurface,
    Origin: origin,
    Faces,
    Vertices,
  } = fileData;
  const vertices = groundSurface ? groundSurface.vertices : Vertices;
  const indices = groundSurface ? groundSurface.faces : Faces;
  if (!vertices) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const projectedVertices = [];
  for (let i = 0; i < vertices.length; i += 3) {
    const transformed = transformCoordinate(vertices[i], vertices[i + 1], {
      translate: [origin.x, origin.y],
    });
    const projected = projectCoordinate(transformed[0], transformed[1]);
    if (projected[0] < minX) {
      minX = projected[0];
    }
    if (projected[1] < minY) {
      minY = projected[1];
    }
    if (projected[0] > maxX) {
      maxX = projected[0];
    }
    if (projected[1] > maxY) {
      maxY = projected[1];
    }
    // todo: adjust for altitude in espg:3857
    projectedVertices.push(projected[0], projected[1], vertices[i + 2]);
  }

  const bounds = [minX, minY, 0, maxX, maxY, 0];

  console.log('bounds', bounds);

  const { modelMatrix, center, min, max, width, height } =
    getLayerPosition(bounds);
  return {
    origin,
    bounds,
    modelMatrix,
    center,
    min,
    max,
    width,
    height,
    data: {
      indices,
      vertices: projectedVertices,
    },
  };
}

function transformCoordinate(x, y, transform) {
  if (!transform) {
    return [x, y];
  }
  const s = transform.scale || [1, 1, 1];
  const t = transform.translate || [0, 0, 0];
  return [x * s[0] + t[0], y * s[1] + t[1]];
}

function projectCoordinate(x, y, fromProj = 'EPSG:3006') {
  return proj4(fromProj, 'EPSG:3857', [x, y]);
}

function projectExtent(extent, fromProj?) {
  const projectedExtentMin = projectCoordinate(extent[0], extent[1], fromProj);
  const projectedExtentMax = projectCoordinate(extent[3], extent[4], fromProj);
  return [...projectedExtentMin, extent[2], ...projectedExtentMax, extent[5]];
}

function getModelMatrix(bounds) {
  const min = bounds[0];
  const max = bounds[1];

  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const offset = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );
  const position = vec3.negate(vec3.create(), offset);

  const modelMatrix = mat4.fromTranslation(mat4.create(), position);

  return modelMatrix;
}

function getLayerPosition(extent) {
  const min = [extent[0], extent[1], extent[2]] as vec3;
  const max = [extent[3], extent[4], extent[5]] as vec3;
  const modelMatrix = getModelMatrix([min, max]);
  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const center = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );

  return {
    min,
    max,
    width: size[0],
    height: size[1],
    center,
    modelMatrix,
  };
}

// Only for lod 1 so far
function parseBuildings(fileData) {
  const { Buildings: buildings, Origin: origin } = fileData;
  if (!buildings) {
    return null;
  }
  const features = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];
    const footprint = building.Footprint;
    const coordinates = [];
    for (let j = 0; j < footprint.length; j++) {
      const { x, y } = footprint[j];
      const transformed = transformCoordinate(x, y, {
        translate: [origin.x, origin.y],
      });
      const projected = projectCoordinate(transformed[0], transformed[1]);
      if (projected[0] < minX) {
        minX = projected[0];
      }
      if (projected[1] < minY) {
        minY = projected[1];
      }
      if (projected[0] > maxX) {
        maxX = projected[0];
      }
      if (projected[1] > maxY) {
        maxY = projected[1];
      }
      coordinates.push([projected[0], projected[1], building.GroundHeight]);
    }
    coordinates.push([...coordinates[0]]);
    const feature = {
      id: null,
      type: 'Feature',
      properties: {
        type: 'building',
        uuid: building.UUID,
        shpFileId: building.SHPFileID,
        elevation: building.Height,
        groundHeight: building.GroundHeight,
        height: building.Height,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
    };
    if (building.id) {
      feature.id = building.id;
    }
    if (building.attributes) {
      Object.assign(feature.properties, building.attributes);
    }
    features.push(feature);
  }
  const bounds = [minX, minY, 0, maxX, maxY, 0];

  const { modelMatrix, center, min, max, width, height } =
    getLayerPosition(bounds);

  return {
    data: features,
    modelMatrix,
    origin,
    center,
    min,
    max,
    width,
    height,
  };
}

function parseCityModel(fileData) {
  const result: {
    buildings?: any;
    ground?: any;
  } = {};
  const buildings = parseBuildings(fileData);
  if (buildings) {
    result.buildings = buildings;
  }
  const ground = parseGround(fileData);
  if (ground) {
    result.ground = ground;
  }
  return result;
}

export { parseCityModel };
