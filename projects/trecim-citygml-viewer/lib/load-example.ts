import {parseProtobuf, parseCityModel} from '@dtcv/citymodel';
import {cities} from '@dtcv/cities';
import {convert, getLayerPosition, forEachCoordinate} from '@dtcv/geojson';
import {parser} from './parser';

const isProd = process.env.NODE_ENV === 'production';

// for now a hard coded list of city data, because auth needs to be solved as well as how the data will be distributed
// here the data is just loaded to an AWS bucket

const helsingborg = cities.find(c => c.id === 'helsingborg');
const malmo = cities.find(c => c.id === 'malmo');
const sthlm = cities.find(c => c.id === 'stockholm');
const gothenburg = cities.find(c => c.id === 'gothenburg');

console.log(sthlm);

export const cityDatasets = {
  malmo: {
    cityLabel: 'Malmö 3CIM',
    files: [
      {
        ...malmo,
        id: 'malmo-building-surfaces',
        cityId: 'malmo',
        url: 'http://localhost:9000/files/trecim/malmo/malmo_3cim_ver_2_20220710.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Malmö',
        origin: {x: 0, y: 0},
        lat: malmo.lat - 0.01,
        lng: malmo.lng - 0.04,
        crs: 'EPSG:3008',
      },
    ],
  },
  stockholm: {
    cityLabel: 'Stockholm 3CIM',
    files: [
      {
        ...sthlm,
        id: 'sthlm-building-surfaces',
        cityId: 'stockholm',
        url: 'http://localhost:9000/files/trecim/Sthlm/Byggnad_3CIM_ver1.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Stockholm byggnader',
        origin: {x: 0, y: 0},
        lat: sthlm.lat + 0.01,
        lng: sthlm.lng,
        crs: 'EPSG:3011',
      },
      {
        ...sthlm,
        id: 'sthlm-vegetation-surfaces',
        cityId: 'stockholm',
        url: 'http://localhost:9000/files/trecim/Sthlm/3CIM_ver2_vegetation.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Stockholm vegetation',
        origin: {x: 0, y: 0},
        lat: sthlm.lat + 0.01,
        lng: sthlm.lng,
        crs: 'EPSG:3011',
      },
      {
        ...sthlm,
        id: 'sthlm-transportation-surfaces',
        cityId: 'stockholm',
        url: 'http://localhost:9000/files/trecim/Sthlm/3CIM_ver2_transport.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Stockholm transportation',
        origin: {x: 0, y: 0},
        lat: sthlm.lat + 0.01,
        lng: sthlm.lng,
        crs: 'EPSG:3011',
      },
    ],
  },
  gothenburg: {
    cityLabel: 'Gothenburg 3CIM',
    files: [
      {
        ...gothenburg,
        id: 'gothenburg-building-surfaces',
        cityId: 'gothenburg',
        url: 'http://localhost:9000/files/trecim/Gbg_3CIMver1_2022-09-09/Göteborg_3CIMver1_byggnad.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Göteborg byggnader',
        origin: {x: 0, y: 0},
        lat: gothenburg.lat + 0.01,
        lng: gothenburg.lng,
        crs: 'EPSG:3007',
      },
      {
        ...gothenburg,
        id: 'gothenburg-vegetation-surfaces',
        cityId: 'gothenburg',
        url: 'http://localhost:9000/files/trecim/Gbg_3CIMver1_2022-09-09/Göteborg_3CIMver1_Marktäcke.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Göteborg vegetation',
        origin: {x: 0, y: 0},
        lat: gothenburg.lat + 0.01,
        lng: gothenburg.lng,
        crs: 'EPSG:3007',
      },
      {
        ...gothenburg,
        id: 'gothenburg-transportation-surfaces',
        cityId: 'gothenburg',
        url: 'http://localhost:9000/files/trecim/Gbg_3CIMver1_2022-09-09/Göteborg_3CIMver1_Transportation.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Göteborg transportation',
        origin: {x: 0, y: 0},
        lat: gothenburg.lat + 0.01,
        lng: gothenburg.lng,
        crs: 'EPSG:3007',
      },
    ],
  },
  // Previous examples from the DTCC file viewer app
  // helsingborgResidential: {
  //   cityLabel: 'Helsingborg residential',
  //   files: [
  //     {
  //       ...helsingborg,
  //       id: 'helsingborg-citymodel',
  //       cityId: 'helsingborg',
  //       url: '/helsingborg-citymodel-nov-2022.pb',
  //       fileType: 'protobuf',
  //       pbType: 'CityModel',
  //       layerType: 'CityModelLayer',
  //       text: 'Helsingborg Residential buildings',
  //       origin: {x: 102000, y: 6213004.15744457},
  //       lat: 56.0430155,
  //       lng: 12.7401827,
  //       crs: 'EPSG:3008',
  //     },
  //     {
  //       ...helsingborg,
  //       id: 'helsingborg-groundsurface',
  //       cityId: 'helsingborg',
  //       url: '/helsingborg-groundsurface-nov-2022.pb',
  //       fileType: 'protobuf',
  //       pbType: 'Surface3D',
  //       layerType: 'GroundSurfaceLayer',
  //       text: 'Helsingborg Residential ground surface',
  //       origin: {x: 102000, y: 6213004.15744457},
  //       lat: 56.0430155,
  //       lng: 12.7401827,
  //       crs: 'EPSG:3008',
  //     },
  //     {
  //       ...helsingborg,
  //       id: 'helsingborg-citysurface',
  //       cityId: 'helsingborg',
  //       url: '/helsingborg-citysurface-nov-2022.pb',
  //       fileType: 'protobuf',
  //       pbType: 'Surface3D',
  //       layerType: 'GroundSurfaceLayer',
  //       text: 'Helsingborg Residential city surface',
  //       origin: {x: 102000, y: 6213004.15744457},
  //       lat: 56.0430155,
  //       lng: 12.7401827,
  //       crs: 'EPSG:3008',
  //     },
  //     // {
  //     //   ...helsingborg,
  //     //   id: 'helsingborg-pointcloud',
  //     //   cityId: 'helsingborg',
  //     //   url: '/helsingborg-pointcloud-nov-2022.pb',
  //     //   fileType: 'protobuf',
  //     //   pbType: 'PointCloud',
  //     //   layerType: 'PointCloudLayer',
  //     //   text: 'Helsingborg Residential point cloud',
  //     //   origin: {x: 102000, y: 6213004.15744457},
  //     //   crs: 'EPSG:3008',
  //     // },
  //     {
  //       ...helsingborg,
  //       id: 'helsingborg-osm',
  //       cityId: 'helsingborg',
  //       url: '/helsingborg-osm-nov-2022.geojson',
  //       fileType: 'geojson',
  //       pbType: null,
  //       layerType: 'GeoJsonLayer',
  //       text: 'Helsingborg Residential OSM',
  //       origin: {x: 0, y: 0},
  //       lat: 56.0430155,
  //       lng: 12.7401827,
  //       crs: 'EPSG:4326',
  //     },
  //   ],
  // },
  // helsingborgHarbour: {
  //   cityLabel: 'Helsingborg residential',
  //   files: [
  //     {
  //       ...helsingborg,
  //       id: 'helsingborg-harbour-citymodel',
  //       cityId: 'helsingborg',
  //       url: '/helsingborg-harbour-citymodel-nov-2022.pb',
  //       fileType: 'protobuf',
  //       pbType: 'CityModel',
  //       layerType: 'CityModelLayer',
  //       text: 'Helsingborg Harbour buildings',
  //       origin: {x: 99127.32489934558, y: 6212834.209326515},
  //       lat: 56.0441543,
  //       lng: 12.6967404,
  //       crs: 'EPSG:3008',
  //     },
  //     {
  //       ...helsingborg,
  //       id: 'helsingborg-harbour-groundsurface',
  //       cityId: 'helsingborg',
  //       url: '/helsingborg-harbour-groundsurface-nov-2022.pb',
  //       fileType: 'protobuf',
  //       pbType: 'Surface3D',
  //       layerType: 'GroundSurfaceLayer',
  //       text: 'Helsingborg Harbour ground surface',
  //       origin: {x: 99127.32489934558, y: 6212834.209326515},
  //       lat: 56.0441543,
  //       lng: 12.6967404,
  //       crs: 'EPSG:3008',
  //     },
  //     {
  //       ...helsingborg,
  //       id: 'helsingborg-harbour-osm',
  //       cityId: 'helsingborg',
  //       url: '/helsingborg-harbour-osm-nov-2022.geojson',
  //       fileType: 'geojson',
  //       pbType: null,
  //       layerType: 'GeoJsonLayer',
  //       text: 'Helsingborg Harbour OSM',
  //       origin: {x: 0, y: 0},
  //       lat: 56.0441543,
  //       lng: 12.6967404,
  //       crs: 'EPSG:4326',
  //     },
  //   ],
  // },
};

// the fileSetting is the object in files array above
export async function loadExampleData(fileSetting, onLoadData?: any) {
  const {
    id,
    text,
    url,
    fileType,
    pbType,
    crs,
    x,
    y,
    lng,
    lat,
    origin,
    extraOrigin,
  } = fileSetting;
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
          console.log(result);
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
    case 'citygml':
      await parser(response, fileSetting, layerData => {
        onLoadData(layerData);
      });
      break;
    default:
      console.warn('example files should be explicit');
  }
  return result;
}