import { expose } from 'threads/worker';
import { Observable } from 'threads/observable';

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
    features.push(feature);
  }
  // bounds
  const waterLevel = 1;
  const bounds = [
    [maxX, minY, waterLevel],
    [maxX, maxY, waterLevel],
    [minX, maxY, waterLevel],
    [minX, minY, waterLevel],
  ];
  const center = [(maxX - minX) / 2, (maxY - minY) / 2];
  return {
    buildings: features,
    bounds,
    center,
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

expose({
  parseFile: file => {
    return new Observable(observer => {
      const fileName = file.name.split('.');
      if (fileName[fileName.length - 1] === 'json') {
        const reader = new FileReader();
        reader.onload = () => {
          observer.next('load');
          if (typeof reader.result === 'string') {
            const fileData = JSON.parse(reader.result);
            if (fileData.Buildings) {
              observer.next(parseCityModel(fileData));
              observer.complete();
            }
          }
        };
        // reader.onloadstart();
        reader.onprogress = p => {
          observer.next('progress');
        };
        reader.readAsText(file);
      }
    });
  },
  loadFile: fileName => {
    const uri = `https://dtcc-js-assets.s3.eu-north-1.amazonaws.com/${fileName}`;
    // return new Observable(async observer => {
    //   observer.next('load file');
    //   try {
    //     const response = await fetch(uri, {
    //       method: 'GET',
    //       mode: 'cors',
    //     });
    //     if (response.status !== 200) {
    //       throw new Error(`${response.status}`);
    //     }
    //     const fileData = await response.json();
    //     if (fileData.Buildings) {
    //       const cityModel = parseCityModel(fileData);
    //       observer.next(cityModel);
    //     }
    //   } catch (e) {
    //     observer.next(e);
    //   }
    // });
  },
});
