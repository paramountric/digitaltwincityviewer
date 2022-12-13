import {LayerConfig} from '../hooks/use-layers';
import {parseCityGml, CityGmlParserOptions} from '@dtcv/citygml';
import {
  buildingsLayerSurfacesLod3Data,
  buildingsLayerWindowsLod3Data,
  transportationLayerTrafficAreaLod2Data,
  transportationLayerAuxiliaryTrafficAreaLod2Data,
  landuseSurfaceLod1Data,
  furnitureLod1Data,
  facilityLod1Data,
  vegetationSurfaceLod1Data,
  projectVertices,
  projectExtent,
} from '@dtcv/cityjson';
import {LayerState} from '../hooks/use-layers';

// todo: refactor out the callback using promises
// the preferred way is to return layer data without using callback
export async function parser(
  apiResponse: any,
  layerConfig: LayerConfig,
  callback?: (layerData: any) => any
) {
  const {fileType, id, crs, layerType} = layerConfig;
  switch (fileType) {
    case 'citygml':
      const options: CityGmlParserOptions = {
        cityObjectMembers: {
          'bldg:Building': true,
          'transportation:TrafficArea': true,
          'transportation:AuxiliaryTrafficArea': true,
          // 'transportation:TransportationComplex': false, // how to do with this?
          // 'luse:LandUse': true,
          // 'frn:CityFurniture': true,
          // 'trecim:Facility': true,
          'veg:PlantCover': true,
        },
      };
      const rawCityGml = await apiResponse.text();

      parseCityGml(
        rawCityGml,
        options,
        cityJson => {
          // the vertices must be projected, this can be moved to the parser module, since this will likely always be the case for the web viewer
          cityJson.vertices = projectVertices(
            cityJson.vertices,
            crs,
            'EPSG:4326'
          );
          cityJson.metadata.geographicalExtent = projectExtent(
            cityJson.metadata.geographicalExtent
          );

          console.log(cityJson);

          // the logic of preparing the props has been moved around
          // when trying to generalise it and put it in viewer component, it's too tricky to do customizations
          // to initialise layer instances on application level is also tedious
          // todo: try to find a sweet spot for help functionality, and still allow using custom layers
          const buildingsZ = -10;
          const transportationZ = 30;
          const transportationAuxZ = 31;
          const landuseZ = 30;
          const furnitureZ = 31;
          const facilityZ = 31;

          const layers = [];

          // BUILDINGS
          const buildingProps = buildingsLayerSurfacesLod3Data(cityJson, {
            addZ: buildingsZ,
          }) as LayerState;

          buildingProps['@@type'] = layerType;
          buildingProps.id = `${id}-buildings`;
          delete buildingProps.modelMatrix;
          // buildingProps.mesh = {
          //   attributes: {
          //     positions: buildingProps.data.vertices,
          //     COLOR_0: {size: 4, value: buildingProps.data.colors},
          //   },
          //   indices: {size: 1, value: buildingProps.data.indices},
          // };
          buildingProps.autoHighlight = true;
          buildingProps.highlightColor = [100, 150, 250, 255];
          buildingProps._instanced = false;
          buildingProps._useMeshColors = true;
          buildingProps.wireframe = false;
          buildingProps.pickable = true;
          buildingProps.visible = true;

          if (buildingProps.data.vertices.length > 0) {
            layers.push(buildingProps);
          }

          // VEGETATION
          const vegetationProps = vegetationSurfaceLod1Data(cityJson, {
            addZ: buildingsZ,
          }) as LayerState;

          vegetationProps['@@type'] = layerType;
          vegetationProps.id = `${id}-vegetation`;
          delete vegetationProps.modelMatrix;
          vegetationProps.autoHighlight = true;
          vegetationProps.highlightColor = [100, 150, 250, 255];
          vegetationProps._instanced = false;
          vegetationProps._useMeshColors = true;
          vegetationProps.wireframe = false;
          vegetationProps.pickable = true;
          vegetationProps.visible = true;

          if (vegetationProps.data.vertices.length > 0) {
            layers.push(vegetationProps);
          }

          // TRAFFIC AREA
          const transportationTrafficAreaProps =
            transportationLayerTrafficAreaLod2Data(cityJson, {
              addZ: buildingsZ,
            }) as LayerState;

          transportationTrafficAreaProps['@@type'] = layerType;
          transportationTrafficAreaProps.id = `${id}-traffic-area`;
          delete transportationTrafficAreaProps.modelMatrix;
          transportationTrafficAreaProps.autoHighlight = true;
          transportationTrafficAreaProps.highlightColor = [100, 150, 250, 255];
          transportationTrafficAreaProps._instanced = false;
          transportationTrafficAreaProps._useMeshColors = true;
          transportationTrafficAreaProps.wireframe = false;
          transportationTrafficAreaProps.pickable = true;
          transportationTrafficAreaProps.visible = true;

          if (transportationTrafficAreaProps.data.vertices.length > 0) {
            layers.push(transportationTrafficAreaProps);
          }

          // TRAFFIC AREA
          const transportationTrafficAuxiliaryAreaProps =
            transportationLayerTrafficAreaLod2Data(cityJson, {
              addZ: buildingsZ,
            }) as LayerState;

          transportationTrafficAuxiliaryAreaProps['@@type'] = layerType;
          transportationTrafficAuxiliaryAreaProps.id = `${id}-auxiliary-traffic-area`;
          delete transportationTrafficAuxiliaryAreaProps.modelMatrix;
          transportationTrafficAuxiliaryAreaProps.autoHighlight = true;
          transportationTrafficAuxiliaryAreaProps.highlightColor = [
            100, 150, 250, 255,
          ];
          transportationTrafficAuxiliaryAreaProps._instanced = false;
          transportationTrafficAuxiliaryAreaProps._useMeshColors = true;
          transportationTrafficAuxiliaryAreaProps.wireframe = false;
          transportationTrafficAuxiliaryAreaProps.pickable = true;
          transportationTrafficAuxiliaryAreaProps.visible = true;

          if (
            transportationTrafficAuxiliaryAreaProps.data.vertices.length > 0
          ) {
            layers.push(transportationTrafficAuxiliaryAreaProps);
          }

          console.log(layers);

          if (callback) {
            callback(layers);
          }
        },
        id === 'sthlm-building-surfaces'
      );
      break;
    default:
      console.warn('File type not supported by parser');
  }
}
