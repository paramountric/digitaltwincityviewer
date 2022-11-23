import {parseProtobuf, parseCityModel} from '@dtcv/citymodel';
import {cities} from '@dtcv/cities';
import {convert, getLayerPosition, forEachCoordinate} from '@dtcv/geojson';

const isProd = process.env.NODE_ENV === 'production';

// for now a hard coded list of city data, because auth needs to be solved as well as how the data will be distributed
// here the data is just loaded to an AWS bucket

const helsingborg = cities.find(c => c.id === 'helsingborg');

export const cityDatasets = {
  helsingborgResidential: {
    cityLabel: 'Helsingborg residential',
    files: [
      {
        ...helsingborg,
        id: 'helsingborg-citymodel',
        cityId: 'helsingborg',
        url: '/helsingborg-citymodel-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'CityModel',
        layerType: 'CityModelLayer',
        text: 'Helsingborg Residential buildings',
        origin: {x: 102000, y: 6213004.15744457},
        lat: 56.0430155,
        lng: 12.7401827,
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-groundsurface',
        cityId: 'helsingborg',
        url: '/helsingborg-groundsurface-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'Surface3D',
        layerType: 'GroundSurfaceLayer',
        text: 'Helsingborg Residential ground surface',
        origin: {x: 102000, y: 6213004.15744457},
        lat: 56.0430155,
        lng: 12.7401827,
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-citysurface',
        cityId: 'helsingborg',
        url: '/helsingborg-citysurface-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'Surface3D',
        layerType: 'GroundSurfaceLayer',
        text: 'Helsingborg Residential city surface',
        origin: {x: 102000, y: 6213004.15744457},
        lat: 56.0430155,
        lng: 12.7401827,
        crs: 'EPSG:3008',
      },
      // {
      //   ...helsingborg,
      //   id: 'helsingborg-pointcloud',
      //   cityId: 'helsingborg',
      //   url: '/helsingborg-pointcloud-nov-2022.pb',
      //   fileType: 'protobuf',
      //   pbType: 'PointCloud',
      //   layerType: 'PointCloudLayer',
      //   text: 'Helsingborg Residential point cloud',
      //   origin: {x: 102000, y: 6213004.15744457},
      //   crs: 'EPSG:3008',
      // },
      {
        ...helsingborg,
        id: 'helsingborg-osm',
        cityId: 'helsingborg',
        url: '/helsingborg-osm-nov-2022.geojson',
        fileType: 'geojson',
        pbType: null,
        layerType: 'GeoJsonLayer',
        text: 'Helsingborg Residential OSM',
        origin: {x: 0, y: 0},
        lat: 56.0430155,
        lng: 12.7401827,
        crs: 'EPSG:4326',
      },
    ],
  },
  helsingborgHarbour: {
    cityLabel: 'Helsingborg residential',
    files: [
      {
        ...helsingborg,
        id: 'helsingborg-harbour-citymodel',
        cityId: 'helsingborg',
        url: '/helsingborg-harbour-citymodel-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'CityModel',
        layerType: 'CityModelLayer',
        text: 'Helsingborg Harbour buildings',
        origin: {x: 99127.32489934558, y: 6212834.209326515},
        lat: 56.0441543,
        lng: 12.6967404,
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-harbour-groundsurface',
        cityId: 'helsingborg',
        url: '/helsingborg-harbour-groundsurface-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'Surface3D',
        layerType: 'GroundSurfaceLayer',
        text: 'Helsingborg Harbour ground surface',
        origin: {x: 99127.32489934558, y: 6212834.209326515},
        lat: 56.0441543,
        lng: 12.6967404,
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-harbour-osm',
        cityId: 'helsingborg',
        url: '/helsingborg-harbour-osm-nov-2022.geojson',
        fileType: 'geojson',
        pbType: null,
        layerType: 'GeoJsonLayer',
        text: 'Helsingborg Harbour OSM',
        origin: {x: 0, y: 0},
        lat: 56.0441543,
        lng: 12.6967404,
        crs: 'EPSG:4326',
      },
    ],
  },
};

// todo: find different properties to determine what type this data is, for parsing
function findJsonType(json) {
  return 'streamlines';
}

// todo: move this to a module (cityModel?)
function parseStreamlines(json) {
  console.log('parse', json);
  const streamLines = json.map(streamLine => {
    return {
      name: streamLine.Name,
      points: streamLine.Points.map(p => [p.x / 100, p.y / 100, p.z / 100]),
      velocity: streamLine.Points.map(p => [p.vx, p.vz, p.vy]),
      pressure: streamLine.Points.map(p => p.p),
    };
  });
  console.log('streamlines', streamLines);
  return streamLines;
}

// the fileSetting is the object in files array above
export async function loadExampleData(fileSetting) {
  const {
    id,
    text,
    url,
    fileType,
    fileExtension,
    pbType,
    crs,
    x,
    y,
    lng,
    lat,
    origin,
    extraOrigin,
  } = fileSetting;
  const response = await fetch(url, {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
  const result: any = {
    id,
    text,
  };
  // now add data depending on type of file
  switch (fileExtension) {
    case 'pb':
      const pbData = new Uint8Array(await response.arrayBuffer());
      const pbJson = parseProtobuf(pbData, pbType);
      pbJson.origin = origin;
      if (extraOrigin) {
        pbJson.origin.x += extraOrigin.x;
        pbJson.origin.y += extraOrigin.y;
      }
      //console.log('protobuf', pbJson);
      const layerData = parseCityModel(pbJson, crs, pbType);
      // , [
      //   fileSetting.x,
      //   fileSetting.y,
      // ]);

      switch (pbType) {
        case 'CityModel':
          result.data = layerData.buildings.data;
          //result.coordinateOrigin = [lng, lat];
          // this makes it works perfectly, but how should other layers realate?
          result.modelMatrix = Array.from(layerData.modelMatrix);
          result.pickable = true;
          result.autoHighlight = true;
          break;
        case 'Surface3D':
          result.data = layerData.ground.data;
          //result.coordinateOrigin = [lng, lat];
          //result.modelMatrix = layerData.ground.modelMatrix;
          break;
        case 'PointCloud':
          result.data = layerData.pointCloud.data;
          result.opacity = 1;
          result.getPosition = '@@=position';
          result.getColor = '@@=color';
          result.getNormal = '@@=normal';
          result.pointSize = 1;
          result.material = {
            ambient: 1.0,
          };
          //result.coordinateOrigin = [lng, lat];
          //result.modelMatrix = layerData.ground.modelMatrix;
          break;
        default:
          result.data = [];
      }
      break;
    case 'geojson':
      const geojson = await response.json();
      //const processed = convert(json, crs, [x, y]);
      // this should not be used since it centers the layer relatively
      //const position = getLayerPosition(processed.features);
      const features = geojson.features
        .map(f => {
          const {properties} = f;
          if (
            f.geometry.type !== 'Polygon' ||
            properties.boundary === 'administrative' ||
            properties.highway === 'platform' ||
            properties.leisure === 'pitch' ||
            properties.leisure === 'playground' ||
            properties.building ||
            properties.power
          ) {
            return null;
          }
          if (properties.amenity === 'parking') {
            properties.color = [150, 150, 150, 100];
            forEachCoordinate({
              featureCollection: {
                features: [f],
              },
              setZ: -0.5,
            });
          } else if (properties.natural === 'water') {
            properties.color = [100, 150, 250, 100];
            forEachCoordinate({
              featureCollection: {
                features: [f],
              },
              setZ: 0.1,
            });
          } else if (properties.building) {
            properties.height = properties.height || 10;
            properties.color = [255, 255, 255, 255];
          } else if (properties.leisure === 'common') {
            properties.color = [250, 150, 100, 100];
            forEachCoordinate({
              featureCollection: {
                features: [f],
              },
              setZ: 0.3,
            });
          } else if (properties.leisure === 'park') {
            properties.color = [100, 250, 150, 100];
            forEachCoordinate({
              featureCollection: {
                features: [f],
              },
              setZ: -0.7,
            });
          } else if (properties.landuse === 'residential') {
            forEachCoordinate({
              featureCollection: {
                features: [f],
              },
              setZ: -1,
            });
            properties.color = [250, 250, 250, 100];
          } else {
            console.log(properties);
          }

          return f;
        })
        .filter(Boolean);

      result.data = geojson;
      result.data.features = features;
      result.opacity = 1;
      result.autoHighlight = false;
      result.highlightColor = [100, 150, 250, 255];
      result.extruded = true;
      result.wireframe = true;
      result.pickable = false;
      result.isClickable = false;
      // result.coordinateSystem = '@@#COORDINATE_SYSTEM.METER_OFFSETS';
      // result.coordinateOrigin = [lng, lat];
      result.getElevation = '@@=properties.height || 0';
      result.getPolygon = '@@=geometry.coordinates';
      result.getFillColor = '@@=properties.color || [250, 250, 250, 30]';
      result.getLineColor = [150, 150, 150];
      break;
    case 'json':
      const json = await response.json();
      const jsonType = findJsonType(json);
      switch (jsonType) {
        case 'streamlines':
          result.data = parseStreamlines(json);
          result.getPath = d => d.points;
          result.getColor = [Math.random() * 255, 128, 128];
          result.getWidth = 15;
          result.billboard = true;
          result.coordinateSystem = '@@#COORDINATE_SYSTEM.METER_OFFSETS';
          result.layerType = 'PathLayer';
          break;
        default:
          console.warn('no json type was found');
      }
      break;
    default:
      console.warn('example files should be explicit');
  }
  return result;
}
