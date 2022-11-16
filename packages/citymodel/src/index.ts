import { vec3, mat4 } from 'gl-matrix';
// import { generateColor } from '@dtcv/indicators';
import { convert } from '@dtcv/convert';
import * as protobuf from 'protobufjs';

let protoRoot;

async function initPb() {
  protoRoot = await protobuf.load(
    'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/dtcc.proto'
  );
}

initPb();

function parseGround(fileData, crs: string, cityXY: number[]) {
  const groundSurface = fileData.GroundSurface || fileData.groundSurface;
  const origin = fileData.Origin || fileData.origin || { x: 0, y: 0 };
  const vertices = groundSurface ? groundSurface.vertices : fileData.vertices;
  const indices = groundSurface ? groundSurface.faces : fileData.faces;
  if (!vertices) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const projectedVertices = [];
  for (let i = 0; i < vertices.length; i++) {
    const { x = 0, y = 0, z = 0 } = vertices[i];
    const projected = convert(
      x + origin.x,
      y + origin.y,
      crs,
      cityXY || [0, 0]
    );
    projected.push(z);
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
    projectedVertices.push(...projected);
  }

  const bounds = [minX, minY, 0, maxX, maxY, 0];

  const { modelMatrix, center, min, max, width, height } =
    getLayerPosition(bounds);

  const flatIndices = indices.reduce((acc, i) => {
    if (typeof i === 'number') {
      acc.push(i);
    }
    if (i.v0) {
      acc.push(i.v0);
    } else if (i.v1) {
      acc.push(0);
    }
    if (i.v1) {
      acc.push(i.v1);
    }
    if (i.v2) {
      acc.push(i.v2);
    }
    return acc;
  }, []);
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
      indices: flatIndices,
      vertices: projectedVertices,
    },
  };
}

// function transformCoordinate(x, y, transform) {
//   if (!transform) {
//     return [x, y];
//   }
//   const s = transform.scale || [1, 1, 1];
//   const t = transform.translate || [0, 0, 0];
//   return [x * s[0] + t[0], y * s[1] + t[1]];
// }

// function projectExtent(extent, fromProj?) {
//   const projectedExtentMin = projectCoordinate(extent[0], extent[1], fromProj);
//   const projectedExtentMax = projectCoordinate(extent[3], extent[4], fromProj);
//   return [...projectedExtentMin, extent[2], ...projectedExtentMax, extent[5]];
// }

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

  return Array.from(modelMatrix);
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
    center: Array.from(center),
    modelMatrix,
  };
}

// Only for lod 1 so far
function parseBuildings(
  fileData,
  crs: string,
  cityXY?: number[],
  setZCoordinateToZero = false
) {
  const buildings = fileData.Buildings || fileData.buildings;
  // todo: the crs is discussed to be added to CityModel files, so add that when it comes in new examples
  const origin = fileData.Origin || fileData.origin || { x: 0, y: 0 };
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
    const footprint = building.Footprint || building.footPrint;
    const coordinates = [];
    if (footprint.holes) {
      console.log(footprint);
    }
    const polygon = footprint.shell
      ? footprint.shell.vertices
      : footprint.vertices
      ? footprint.vertices
      : footprint;
    for (let j = 0; j < polygon.length; j++) {
      const { x, y } = polygon[j];
      const projected = convert(x + origin.x, y + origin.y, crs, cityXY);

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
      coordinates.push([
        projected[0],
        projected[1],
        setZCoordinateToZero
          ? 0
          : building.GroundHeight || building.groundHeight,
      ]);
    }
    if (coordinates[0]) {
      coordinates.push([...coordinates[0]]);
    }
    const feature = {
      id: null,
      type: 'Feature',
      properties: {
        type: 'building',
        uuid: building.UUID || building.uuid,
        shpFileId: building.SHPFileID,
        elevation: building.Height || building.height,
        groundHeight: building.GroundHeight || building.groundHeight,
        height: building.Height || building.height,
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

function parseSurfaceField(fileData) {
  if (!fileData.surface || !fileData.values) {
    return null;
  }
  const origin = fileData.Origin || fileData.origin || { x: 0, y: 0 };
  const vertices = fileData.surface.vertices;
  const indices = fileData.surface.faces;
  const values = fileData.values;
  if (!vertices) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const projectedVertices = [];
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    const projected = [v.x || 0, v.y || 0, v.z || 0];
    // const transformed = transformCoordinate(vertices[i], vertices[i + 1], {
    //   translate: [origin.x, origin.y],
    // });
    // const projected = projectCoordinate(transformed[0], transformed[1]);
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
    projectedVertices.push(...projected);
  }

  const bounds = [minX, minY, 0, maxX, maxY, 0];

  const { modelMatrix, center, min, max, width, height } =
    getLayerPosition(bounds);

  const colors = [];
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (values[i] < minVal) {
      minVal = values[i];
    }
    if (values[i] > maxVal) {
      maxVal = values[i];
    }
  }
  for (let i = 0; i < values.length; i++) {
    //const color = generateColor(values[i], 4, 2);
    // const color = generateColor(
    //   values[i],
    //   minVal,
    //   maxVal,
    //   'red',
    //   'blue',
    //   'orange'
    // );
    // todo: bring back the generateColor function
    const color = [0.5, 0.5, 0.5];
    colors.push(color[0] / 255, color[1] / 255, color[2] / 255, 0.6);
  }
  //console.log(minVal, maxVal);
  const flatIndices = indices.reduce((acc, i) => {
    if (typeof i === 'number') {
      acc.push(i);
    }
    if (i.v0) {
      acc.push(i.v0);
    } else if (i.v1) {
      acc.push(0);
    }
    if (i.v1) {
      acc.push(i.v1);
    }
    if (i.v2) {
      acc.push(i.v2);
    }
    return acc;
  }, []);
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
      indices: flatIndices,
      vertices: projectedVertices,
      colors,
    },
  };
}

function getPointCloudColor(classification: number) {
  // 19-63 is reserved, 64-255 ia user definable
  const colors = [
    [196, 188, 196], // 0: never classifed
    [196, 188, 196], // 1: unassigned
    [124, 124, 116], // 2: ground
    [58, 68, 57], // 3: low veg
    [58, 68, 57], // 4: medium veg
    [58, 68, 57], // 5: high veg
    [58, 68, 57], // 6: building
    [58, 68, 57], // 7: low point
    [58, 68, 57], // 8: reserved
    [58, 68, 57], // 9: water
    [58, 68, 57], // 10: rail
    [58, 68, 57], // 11: road surface
    [58, 68, 57], // 12: reserved
    [58, 68, 57], // 13: wire - guard (shield)
    [58, 68, 57], // 14: wire - conductor (phase)
    [58, 68, 57], // 15: transmission tower
    [58, 68, 57], // 16: wire - structure connector (insulator)
    [58, 68, 57], // 17: bridge deck
    [58, 68, 57], // 18: high noise
  ];
  return colors[classification] || [63, 191, 63];
}

function parsePointCloud(fileData, crs: string) {
  console.log(fileData);
  const points: any = [];
  const origin = fileData.Origin || fileData.origin || { x: 0, y: 0 };
  console.log(origin);
  //const selection = fileData.points.slice(0, 1000000);
  let i = 0;
  const classes = {};
  for (const p of fileData.points) {
    const classification = fileData.classification[i];
    classes[classification] = true;
    i++;
    if (!p.x || !p.y) {
      continue;
    }
    const projected = convert(p.x + origin.x, p.y + origin.y, crs);
    points.push({
      position: [projected[0], projected[1], p.z],
      color: getPointCloudColor(classification),
      normal: [-1, 0, 0],
    });
  }
  console.log(classes);
  return {
    data: points,
  };
}

// function fixLegacyUpperCase(fileData, fixKeys) {
//   for (const key of fixKeys) {
//     if (!fileData[key]) {
//       continue;
//     }
//     const val = fileData[key];
//     const lowerCase = key.charAt(0).toLowerCase() + key.slice(1);
//     fileData[lowerCase] = val;
//     delete fileData[key];
//   }
// }

function parseCityModel(
  fileData,
  crs: string,
  type?: string | null | undefined, // protobuf connected, but not used in legacy -> when sending in json citymodel
  cityXY?: number[],
  setZCoordinateToZero = false
) {
  const result: {
    buildings?: any;
    ground?: any;
    surfaceField?: any;
    pointCloud?: any;
    modelMatrix: mat4;
  } = {
    // this can be overriden if necessary from the parsers
    modelMatrix: mat4.create(),
  };
  if (type === 'CityModel') {
    const buildings = parseBuildings(
      fileData,
      crs,
      cityXY,
      setZCoordinateToZero
    );
    if (buildings) {
      result.buildings = buildings;
    }
  } else if (type === 'Surface3D') {
    const ground = parseGround(fileData, crs, cityXY);
    if (ground) {
      result.ground = ground;
    }
  } else if (type === 'SurfaceField3D') {
    const surfaceField = parseSurfaceField(fileData);
    if (surfaceField) {
      result.surfaceField = surfaceField;
    }
  } else if (type === 'PointCloud') {
    const pointCloud = parsePointCloud(fileData, crs);
    if (pointCloud) {
      result.pointCloud = pointCloud;
    }
  } else {
    // legacy (update: disabled and should be removed)
    // const buildings = parseBuildings(
    //   fileData,
    //   crs,
    //   cityXY,
    //   setZCoordinateToZero
    // );
    // if (buildings) {
    //   result.buildings = buildings;
    // }
    // const ground = parseGround(fileData);
    // if (ground) {
    //   result.ground = ground;
    // }
  }

  return result;
}

function parseProtobuf(pbData: Uint8Array, pbType: string) {
  if (!protoRoot) {
    console.warn('protobuf has not been loaded properly during init');
    return;
  }
  const typeData = protoRoot.lookupType(pbType);
  const decoded = typeData.decode(pbData);
  const decodedJson = decoded.toJSON();
  return decodedJson;
}

export { parseCityModel, parseProtobuf };
