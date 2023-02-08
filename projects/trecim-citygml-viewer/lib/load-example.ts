import {parseProtobuf, parseCityModel} from '@dtcv/citymodel';
import {cities} from '@dtcv/cities';
import {CityGmlParserOptions} from '@dtcv/citygml';
import {forEachCoordinate} from '@dtcv/geojson';
import {parser} from './parser';

const isProd = process.env.NODE_ENV === 'production';

// const malmo = cities.find(c => c.id === 'malmo');
// const sthlm = cities.find(c => c.id === 'stockholm');
// const gothenburg = cities.find(c => c.id === 'gothenburg');

export type DataSet = {
  id: string;
  cityId: string;
  url: string;
  fileType: string;
  pbType: string | null;
  layerType: string;
  layerElevation?: number;
  text: string;
  crs: string;
  parserOptions: CityGmlParserOptions;
};

type DataSets =
  | {
      [key: string]: {
        label: string;
        files: DataSet[];
      };
    }
  | any;

export const cityDatasets: DataSets = {
  malmo: {
    label: 'Malmö',
    files: [
      {
        id: 'malmo-building-surfaces',
        cityId: 'malmo',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/malmo/malmo_3cim_ver_2_20220710.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Gällande byggnader',
        crs: 'EPSG:3008',
        planned: false,
        parserOptions: {
          cityObjectMembers: {
            'bldg:Building': true,
          },
        },
      },
      {
        id: 'malmo-building-planned-surfaces',
        cityId: 'malmo',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/malmo/malmo_3cim_ver_2_20220710.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Planerade byggnader',
        crs: 'EPSG:3008',
        planned: true,
        parserOptions: {
          cityObjectMembers: {
            'bldg:Building': true,
          },
        },
      },
      {
        id: 'malmo-traffic-area-surfaces',
        cityId: 'malmo',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/malmo/malmo_3cim_ver_2_20220710.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Transport',
        crs: 'EPSG:3008',
        parserOptions: {
          cityObjectMembers: {
            'transportation:TrafficArea': true,
            'transportation:AuxiliaryTrafficArea': true,
          },
        },
      },
      {
        id: 'malmo-vegetation',
        cityId: 'malmo',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/malmo/malmo_3cim_ver_2_20220710.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Vegetation',
        crs: 'EPSG:3008',
        parserOptions: {
          cityObjectMembers: {
            'veg:PlantCover': true,
          },
        },
      },
      {
        id: 'malmo-city-furniture',
        cityId: 'malmo',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/malmo/malmo_3cim_ver_2_20220710.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GeoJsonLayer',
        text: 'Markdetaljer',
        crs: 'EPSG:3008',
        parserOptions: {
          cityObjectMembers: {
            'cityfurniture:CityFurniture': true,
          },
        },
      },
      {
        id: 'malmo-utility',
        cityId: 'malmo',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/malmo/malmo_3cim_ver_2_20220710.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GeoJsonLayer',
        layerElevation: 0.5,
        text: 'Ledningsnät',
        crs: 'EPSG:3008',
        parserOptions: {
          cityObjectMembers: {
            'trecim:Utility': true,
          },
        },
      },
    ],
  },
  stockholm: {
    label: 'Stockholm',
    files: [
      {
        id: 'sthlm-building-surfaces',
        cityId: 'stockholm',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Sthlm/Byggnad_3CIM_ver1.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Byggnader',
        crs: 'EPSG:3011',
        parserOptions: {
          cityObjectMembers: {
            'bldg:Building': true,
          },
        },
      },
      {
        id: 'sthlm-vegetation-surfaces',
        cityId: 'stockholm',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Sthlm/3CIM_ver2_vegetation.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Vegetation',
        crs: 'EPSG:3011',
        layerElevation: 25,
        parserOptions: {
          cityObjectMembers: {
            'veg:PlantCover': true,
          },
        },
      },
      {
        id: 'sthlm-transportation-surfaces',
        cityId: 'stockholm',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Sthlm/3CIM_ver2_transport.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Transport',
        crs: 'EPSG:3011',
        parserOptions: {
          cityObjectMembers: {
            'transportation:TrafficArea': true,
            'transportation:AuxiliaryTrafficArea': true,
          },
        },
      },
      {
        id: 'sthlm-city-furniture',
        cityId: 'stockholm',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Sthlm/3CIM_ver2_markdetaljer.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GeoJsonLayer',
        text: 'Markdetaljer',
        crs: 'EPSG:3011',
        parserOptions: {
          cityObjectMembers: {
            'cityfurniture:CityFurniture': true,
          },
        },
      },
      {
        id: 'sthlm-utility',
        cityId: 'stockholm',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Sthlm/3CIM_ver2_ledningsnat.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GeoJsonLayer',
        layerElevation: -2,
        text: 'Ledningsnät',
        crs: 'EPSG:3011',
        parserOptions: {
          cityObjectMembers: {
            'trecim:Utility': true,
          },
        },
      },
    ],
  },
  gothenburg: {
    label: 'Goteborg',
    files: [
      {
        id: 'gothenburg-building-surfaces',
        cityId: 'gothenburg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Gbg_3CIMver1_2022-09-09/Goteborg_3CIMver1_Byggnad.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Byggnad',
        crs: 'EPSG:3007',
        parserOptions: {
          cityObjectMembers: {
            'bldg:Building': true,
          },
        },
      },
      {
        id: 'gothenburg-vegetation-surfaces',
        cityId: 'gothenburg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Gbg_3CIMver1_2022-09-09/Goteborg_3CIMver1_Marktacke.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        text: 'Marktäcke',
        crs: 'EPSG:3007',
        layerElevation: 0,
        parserOptions: {
          cityObjectMembers: {
            'landuse:LandUse': true,
          },
        },
      },
      {
        id: 'gothenburg-transportation-surfaces',
        cityId: 'gothenburg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Gbg_3CIMver1_2022-09-09/Goteborg_3CIMver1_Transportation.gml',
        fileType: 'citygml',
        pbType: null,
        layerElevation: 0.3,
        layerType: 'GroundSurfaceLayer',
        text: 'Transport',
        crs: 'EPSG:3007',
        parserOptions: {
          cityObjectMembers: {
            'transportation:TrafficArea': true,
            'transportation:AuxiliaryTrafficArea': true,
          },
        },
      },
      {
        id: 'gothenburg-waterbody-surfaces',
        cityId: 'gothenburg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Gbg_3CIMver1_2022-09-09/Goteborg_3CIMver1_Vatten.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GroundSurfaceLayer',
        layerElevation: 0.3,
        text: 'Vatten',
        crs: 'EPSG:3007',
        parserOptions: {
          cityObjectMembers: {
            'waterbodies:WaterBody': true,
          },
        },
      },
      {
        id: 'gothenburg-utility-points',
        cityId: 'gothenburg',
        url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/trecim/Gbg_3CIMver1_2022-09-09/Goteborg_3CIMver1_Ledningsnat.gml',
        fileType: 'citygml',
        pbType: null,
        layerType: 'GeoJsonLayer',
        layerElevation: 0.4,
        text: 'Ledningsnät',
        crs: 'EPSG:3007',
        parserOptions: {
          cityObjectMembers: {
            'trecim:Facility': true,
          },
        },
      },
    ],
  },
};

// the fileSetting is the object in files array above
export async function loadExampleData(
  fileSetting,
  onLoadData?: any,
  previousLngLatAlt?: [number, number, number]
) {
  const {id, text, url, fileType} = fileSetting;
  const response = await fetch(url);
  const result: any = {
    id,
    text,
  };
  // now add data depending on type of file
  switch (fileType) {
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
      await parser(
        response,
        fileSetting,
        (layerData, lngLatAlt) => {
          onLoadData(layerData, lngLatAlt);
        },
        previousLngLatAlt
      );
      break;
    default:
      console.warn('example files should be explicit');
  }
  return result;
}
