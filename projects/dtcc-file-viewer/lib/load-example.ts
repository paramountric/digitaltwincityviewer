import {parseProtobuf, parseCityModel} from '@dtcv/citymodel';
import {cities} from '@dtcv/cities';
import {convert, getLayerPosition, forEachCoordinate} from '@dtcv/geojson';

// for now a hard coded list of city data, because auth needs to be solved as well as how the data will be distributed
// here the data is just loaded to an AWS bucket

const helsingborg = cities.find(c => c.id === 'helsingborg');

export const cityDatasets = {
  helsingborg: {
    cityLabel: 'Helsingborg residential',
    files: [
      {
        ...helsingborg,
        id: 'helsingborg-citymodel',
        cityId: 'helsingborg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-citymodel-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'CityModel',
        layerType: 'CityModelLayer',
        text: 'Helsingborg Residential buildings',
        origin: {x: 102000, y: 6213004.15744457},
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-groundsurface',
        cityId: 'helsingborg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-groundsurface-june-2022.pb',
        fileType: 'protobuf',
        pbType: 'Surface3D',
        layerType: 'GroundSurfaceLayer',
        text: 'Helsingborg Residential ground surface',
        origin: {x: 102000, y: 6213004.15744457},
        crs: 'EPSG:3008',
      },
      {
        ...helsingborg,
        id: 'helsingborg-citysurface',
        cityId: 'helsingborg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-citysurface-nov-2022.pb',
        fileType: 'protobuf',
        pbType: 'Surface3D',
        layerType: 'GroundSurfaceLayer',
        text: 'Helsingborg Residential city surface',
        origin: {x: 102000, y: 6213004.15744457},
        crs: 'EPSG:3008',
      },
      // {
      //   ...helsingborg,
      //   id: 'helsingborg-pointcloud',
      //   cityId: 'helsingborg',
      //   url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-pointcloud-nov-2022.pb',
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
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-osm-nov-2022.geojson',
        fileType: 'geojson',
        pbType: null,
        layerType: 'GeoJsonLayer',
        text: 'Helsingborg Residential OpenStreetMap',
        origin: {x: 0, y: 0},
        crs: 'EPSG:4326',
      },
    ],
  },
};

// the fileSetting is the object in files array above
export async function loadExampleData(fileSetting) {
  const {id, text, url, fileType, pbType, crs, x, y, lng, lat, origin} =
    fileSetting;
  const response = await fetch(url);
  const result: any = {
    id,
    text,
  };
  // now add data depending on type of file
  switch (fileType) {
    case 'protobuf':
      const pbData = new Uint8Array(await response.arrayBuffer());
      const pbJson = parseProtobuf(pbData, pbType);
      console.log(pbJson);
      pbJson.origin = origin;
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
      const json = await response.json();
      //const processed = convert(json, crs, [x, y]);
      // this should not be used since it centers the layer relatively
      //const position = getLayerPosition(processed.features);
      const features = json.features
        .map(f => {
          const {properties} = f;
          if (
            f.geometry.type !== 'Polygon' ||
            properties.boundary === 'administrative' ||
            properties.highway === 'platform' ||
            properties.leisure === 'pitch' ||
            properties.leisure === 'playground' ||
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

      result.data = json;
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
    default:
      console.warn('example files should be explicit');
  }
  return result;
}
