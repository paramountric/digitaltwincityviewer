import { vec3, mat4 } from 'gl-matrix';

function parseGround(fileData) {
  const { GroundSurface: groundSurface } = fileData;
  if (!groundSurface) {
    return null;
  }
  const { Faces: indices, Vertices: vertices } = groundSurface;

  return {
    indices,
    vertices,
  };
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

// Only for lod 1 so far
function parseBuildings(fileData) {
  const { Buildings: buildings } = fileData;
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
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
      coordinates.push([x, y, building.GroundHeight]);
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
  // bounds
  const bounds = [
    [minX, minY, 0],
    [maxX, maxY, 0],
  ];
  return {
    buildings: features,
    modelMatrix: getModelMatrix(bounds),
    ground: null,
  };
}

function parseCityModel(fileData) {
  const data = parseBuildings(fileData);
  const ground = parseGround(fileData);
  if (ground) {
    data.ground = ground;
  }
  return data;
}

export { parseCityModel };
