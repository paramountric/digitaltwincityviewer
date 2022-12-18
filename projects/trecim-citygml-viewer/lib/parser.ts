import {LayerConfig} from '../hooks/use-layers';
import {parseCityGml, CityGmlParserOptions} from '@dtcv/citygml';
import {
  buildingsLayerSurfacesLod3Data,
  buildingsLayerWindowsLod3Data,
  transportationLayerTrafficAreaLod2Data,
  transportationLayerAuxiliaryTrafficAreaLod2Data,
  landuseSurfaceLod1Data,
  waterBodySurfaceLod1Data,
  furnitureLod1Data,
  facilityLod1Data,
  utilityLod1Data,
  vegetationSurfaceLod1Data,
  projectVertices,
  projectExtent,
} from '@dtcv/cityjson';
import {projectCoordinate} from '@dtcv/projection';
import {LayerState} from '../hooks/use-layers';

// todo: refactor out the callback using promises
// the preferred way is to return layer data without using callback
export async function parser(
  apiResponse: any,
  layerConfig: LayerConfig,
  callback?: (
    layerData: any,
    offsetLngLatAlt: [number, number, number] // passed on for next layer in the same dataset
  ) => any,
  previousOffsetLngLatAlt?: [number, number, number] // if a layer is already loaded, the previous center must be used if same dataset
) {
  const {
    fileType,
    id,
    crs: fromCrs,
    layerType,
    parserOptions,
    planned,
  } = layerConfig;
  switch (fileType) {
    case 'citygml':
      const rawCityGml = await apiResponse.text();

      parseCityGml(
        rawCityGml,
        parserOptions,
        cityJson => {
          console.log(cityJson);

          // reuse lnglat from previously loaded layer (from the same dataset)
          let offsetLngLatAlt = previousOffsetLngLatAlt;

          // first time of each dataset the relative center needs to be calculated and projected
          if (!offsetLngLatAlt) {
            // calculate center from extent
            const [minX, minY, minZ, maxX, maxY, maxZ] =
              cityJson.metadata.geographicalExtent;
            const centerX = minX + (maxX - minX) * 0.5;
            const centerY = minY + (maxY - minY) * 0.5;
            const [pLng, pLat] = projectCoordinate(
              centerX,
              centerY,
              fromCrs,
              'EPSG:4326'
            );

            // project center for layer position and coordinate offset
            offsetLngLatAlt = [pLng, pLat, minZ];
          }

          // coordinateOrigin
          const [lng, lat] = offsetLngLatAlt;

          // translate coordinates to meter offset
          const [x, y] = projectCoordinate(lng, lat, 'EPSG:4326', 'EPSG:3857');

          // the vertices must be projected, this can be moved to the parser module, since this will likely always be the case for the web viewer
          cityJson.vertices = projectVertices({
            vertices: cityJson.vertices,
            fromCrs,
            toCrs: 'EPSG:3857',
            center: [x, y, 0],
          });

          cityJson.metadata.geographicalExtent = projectExtent(
            cityJson.metadata.geographicalExtent,
            fromCrs,
            'EPSG:3857'
          );

          const layers = [];

          const {cityObjectMembers} = parserOptions;

          if (cityObjectMembers['bldg:Building']) {
            // BUILDINGS
            const buildingProps = buildingsLayerSurfacesLod3Data(
              cityJson,
              {
                refLat: lat,
              },
              planned || false
            ) as LayerState;

            buildingProps['@@type'] = layerType;
            buildingProps.groupId = id;
            buildingProps.id = `${id}-bldg:Building`;
            delete buildingProps.modelMatrix;
            // buildingProps.mesh = {
            //   attributes: {
            //     positions: buildingProps.data.vertices,
            //     COLOR_0: {size: 4, value: buildingProps.data.colors},
            //   },
            //   indices: {size: 1, value: buildingProps.data.indices},
            // };
            buildingProps.coordinateSystem = 2;
            buildingProps.coordinateOrigin = [lng, lat, 0];

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
          }

          if (cityObjectMembers['veg:PlantCover']) {
            // VEGETATION
            const vegetationProps = vegetationSurfaceLod1Data(cityJson, {
              refLat: lat,
            }) as LayerState;

            vegetationProps['@@type'] = layerType;
            vegetationProps.groupId = id;
            vegetationProps.id = `${id}-veg:PlantCover`;
            delete vegetationProps.modelMatrix;

            vegetationProps.coordinateSystem = 2;
            vegetationProps.coordinateOrigin = [lng, lat, 0];
            vegetationProps.autoHighlight = true;
            vegetationProps.highlightColor = [100, 150, 250, 255];
            vegetationProps._instanced = false;
            vegetationProps._useMeshColors = true;
            vegetationProps.wireframe = false;
            vegetationProps.pickable = true;
            vegetationProps.visible = true;
            vegetationProps.parameters = {
              depthTest: true,
            };

            if (vegetationProps.data.vertices.length > 0) {
              layers.push(vegetationProps);
            }
          }

          if (cityObjectMembers['landuse:LandUse']) {
            // LANDUSE (3CIM ver 1)
            const landuseProps = landuseSurfaceLod1Data(cityJson, {
              refLat: lat,
            }) as LayerState;

            landuseProps['@@type'] = layerType;
            landuseProps.groupId = id;
            landuseProps.id = `${id}-landuse:LandUse`;
            delete landuseProps.modelMatrix;

            landuseProps.coordinateSystem = 2;
            landuseProps.coordinateOrigin = [lng, lat, 0];
            landuseProps.autoHighlight = true;
            landuseProps.highlightColor = [100, 150, 250, 255];
            landuseProps._instanced = false;
            landuseProps._useMeshColors = true;
            landuseProps.wireframe = false;
            landuseProps.pickable = true;
            landuseProps.visible = true;

            if (landuseProps.data.vertices.length > 0) {
              layers.push(landuseProps);
            }
          }

          if (cityObjectMembers['luse:LandUse']) {
            // LANDUSE (3CIM ver 1)
            const landuseProps = landuseSurfaceLod1Data(cityJson, {
              refLat: lat,
            }) as LayerState;

            landuseProps['@@type'] = layerType;
            landuseProps.groupId = id;
            landuseProps.id = `${id}-luse:LandUse`;
            delete landuseProps.modelMatrix;

            landuseProps.coordinateSystem = 2;
            landuseProps.coordinateOrigin = [lng, lat, 0];
            landuseProps.autoHighlight = true;
            landuseProps.highlightColor = [100, 150, 250, 255];
            landuseProps._instanced = false;
            landuseProps._useMeshColors = true;
            landuseProps.wireframe = false;
            landuseProps.pickable = true;
            landuseProps.visible = true;

            if (landuseProps.data.vertices.length > 0) {
              layers.push(landuseProps);
            }
          }

          if (cityObjectMembers['waterbodies:WaterBody']) {
            // WATER (3CIM ver 1)
            const waterBodyProps = waterBodySurfaceLod1Data(cityJson, {
              refLat: lat,
            }) as LayerState;

            waterBodyProps['@@type'] = layerType;
            waterBodyProps.groupId = id;
            waterBodyProps.id = `${id}-waterbodies:WaterBody`;
            delete waterBodyProps.modelMatrix;

            waterBodyProps.coordinateSystem = 2;
            waterBodyProps.coordinateOrigin = [lng, lat, 0];
            waterBodyProps.autoHighlight = true;
            waterBodyProps.highlightColor = [100, 150, 250, 255];
            waterBodyProps._instanced = false;
            waterBodyProps._useMeshColors = true;
            waterBodyProps.wireframe = false;
            waterBodyProps.pickable = true;
            waterBodyProps.visible = true;

            if (waterBodyProps.data.vertices.length > 0) {
              layers.push(waterBodyProps);
            }
          }

          if (cityObjectMembers['transportation:TrafficArea']) {
            // TRAFFIC AREA
            const transportationTrafficAreaProps =
              transportationLayerTrafficAreaLod2Data(cityJson, {
                refLat: lat,
              }) as LayerState;

            transportationTrafficAreaProps['@@type'] = layerType;
            transportationTrafficAreaProps.groupId = id;
            transportationTrafficAreaProps.id = `${id}-transportation:TrafficArea`;
            delete transportationTrafficAreaProps.modelMatrix;

            transportationTrafficAreaProps.coordinateSystem = 2;
            transportationTrafficAreaProps.coordinateOrigin = [lng, lat, 0];
            transportationTrafficAreaProps.autoHighlight = true;
            transportationTrafficAreaProps.highlightColor = [
              100, 150, 250, 255,
            ];
            transportationTrafficAreaProps._instanced = false;
            transportationTrafficAreaProps._useMeshColors = true;
            transportationTrafficAreaProps.wireframe = false;
            transportationTrafficAreaProps.pickable = true;
            transportationTrafficAreaProps.visible = true;
            transportationTrafficAreaProps.parameters = {
              depthTest: true,
            };

            if (transportationTrafficAreaProps.data.vertices.length > 0) {
              layers.push(transportationTrafficAreaProps);
            }
          }

          if (cityObjectMembers['transportation:AuxiliaryTrafficArea']) {
            // AUX TRAFFIC AREA
            const transportationTrafficAuxiliaryAreaProps =
              transportationLayerTrafficAreaLod2Data(cityJson, {
                refLat: lat,
              }) as LayerState;

            transportationTrafficAuxiliaryAreaProps['@@type'] = layerType;
            transportationTrafficAuxiliaryAreaProps.groupId = id;
            transportationTrafficAuxiliaryAreaProps.id = `${id}-transportation:AuxiliaryTrafficArea`;
            delete transportationTrafficAuxiliaryAreaProps.modelMatrix;

            transportationTrafficAuxiliaryAreaProps.coordinateSystem = 2;
            transportationTrafficAuxiliaryAreaProps.coordinateOrigin = [
              lng,
              lat,
              0,
            ];
            transportationTrafficAuxiliaryAreaProps.autoHighlight = true;
            transportationTrafficAuxiliaryAreaProps.highlightColor = [
              100, 150, 250, 255,
            ];
            transportationTrafficAuxiliaryAreaProps._instanced = false;
            transportationTrafficAuxiliaryAreaProps._useMeshColors = true;
            transportationTrafficAuxiliaryAreaProps.wireframe = false;
            transportationTrafficAuxiliaryAreaProps.pickable = true;
            transportationTrafficAuxiliaryAreaProps.visible = true;
            transportationTrafficAuxiliaryAreaProps.parameters = {
              depthTest: true,
            };

            if (
              transportationTrafficAuxiliaryAreaProps.data.vertices.length > 0
            ) {
              layers.push(transportationTrafficAuxiliaryAreaProps);
            }
          }

          if (cityObjectMembers['trecim:Facility']) {
            // FACILITY (trecim ver 1)
            const facilityProps = facilityLod1Data(cityJson, {
              refLat: lat,
            }) as LayerState;

            console.log(facilityProps);

            facilityProps['@@type'] = layerType;
            facilityProps.groupId = id;
            facilityProps.id = `${id}-trecim:Facility`;
            delete facilityProps.modelMatrix;

            facilityProps.coordinateSystem = 2;
            facilityProps.coordinateOrigin = [lng, lat, 0];
            facilityProps.autoHighlight = true;
            facilityProps.highlightColor = [100, 150, 250, 255];
            facilityProps._instanced = false;
            facilityProps._useMeshColors = true;
            facilityProps.wireframe = false;
            facilityProps.pickable = true;
            facilityProps.visible = true;
            facilityProps.parameters = {
              depthTest: true,
            };
            facilityProps.stroked = true;
            facilityProps.filled = true;
            facilityProps.extruded = false;
            facilityProps.pointType = 'circle';
            facilityProps.lineWidthScale = 1;
            facilityProps.lineWidthMinPixels = 2;
            facilityProps.getFillColor = d =>
              d.properties.color
                ? [
                    d.properties.color[0],
                    d.properties.color[1],
                    d.properties.color[2],
                    100,
                  ]
                : [255, 215, 0, 100];
            facilityProps.getLineColor = d =>
              d.properties.color
                ? [
                    d.properties.color[0],
                    d.properties.color[1],
                    d.properties.color[2],
                    255,
                  ]
                : [255, 215, 0, 255];
            facilityProps.getPointRadius = 5;
            facilityProps.getLineWidth = 1;

            layers.push(facilityProps);
          }

          if (cityObjectMembers['trecim:Utility']) {
            // UTILITY (trecim ver 2)
            const utilityProps = utilityLod1Data(cityJson, {
              refLat: lat,
            }) as LayerState;

            console.log(utilityProps);

            utilityProps['@@type'] = layerType;
            utilityProps.groupId = id;
            utilityProps.id = `${id}-trecim:Utility`;
            delete utilityProps.modelMatrix;

            utilityProps.coordinateSystem = 2;
            utilityProps.coordinateOrigin = [lng, lat, 0];
            utilityProps.autoHighlight = true;
            utilityProps.highlightColor = [100, 150, 250, 255];
            utilityProps._instanced = false;
            utilityProps._useMeshColors = true;
            utilityProps.wireframe = false;
            utilityProps.pickable = true;
            utilityProps.visible = true;
            utilityProps.parameters = {
              depthTest: true,
            };
            utilityProps.stroked = true;
            utilityProps.filled = true;
            utilityProps.extruded = false;
            utilityProps.pointType = 'circle';
            utilityProps.lineWidthScale = 1;
            utilityProps.lineWidthMinPixels = 2;
            utilityProps.getFillColor = d =>
              d.properties.color
                ? [
                    d.properties.color[0],
                    d.properties.color[1],
                    d.properties.color[2],
                    100,
                  ]
                : [255, 215, 0, 100];
            utilityProps.getLineColor = d =>
              d.properties.color
                ? [
                    d.properties.color[0],
                    d.properties.color[1],
                    d.properties.color[2],
                    255,
                  ]
                : [255, 215, 0, 255];
            utilityProps.getPointRadius = 5;
            utilityProps.getLineWidth = 1;

            layers.push(utilityProps);
          }

          if (cityObjectMembers['cityfurniture:CityFurniture']) {
            // FACILITY (trecim ver 1)
            const cityFurnitureProps = furnitureLod1Data(cityJson, {
              refLat: lat,
            }) as LayerState;

            console.log(cityFurnitureProps);

            cityFurnitureProps['@@type'] = layerType;
            cityFurnitureProps.groupId = id;
            cityFurnitureProps.id = `${id}-cityfurniture:CityFurniture`;
            delete cityFurnitureProps.modelMatrix;

            cityFurnitureProps.coordinateSystem = 2;
            cityFurnitureProps.coordinateOrigin = [lng, lat, 0];
            cityFurnitureProps.autoHighlight = true;
            cityFurnitureProps.highlightColor = [100, 150, 250, 255];
            cityFurnitureProps._instanced = false;
            cityFurnitureProps._useMeshColors = true;
            cityFurnitureProps.wireframe = false;
            cityFurnitureProps.pickable = true;
            cityFurnitureProps.visible = true;
            cityFurnitureProps.parameters = {
              depthTest: true,
            };
            cityFurnitureProps.stroked = true;
            cityFurnitureProps.filled = true;
            cityFurnitureProps.extruded = false;
            cityFurnitureProps.pointType = 'circle';
            cityFurnitureProps.lineWidthScale = 1;
            cityFurnitureProps.lineWidthMinPixels = 2;
            cityFurnitureProps.getFillColor = d =>
              d.properties.color
                ? [
                    d.properties.color[0],
                    d.properties.color[1],
                    d.properties.color[2],
                    100,
                  ]
                : [255, 215, 0, 100];
            cityFurnitureProps.getLineColor = d =>
              d.properties.color
                ? [
                    d.properties.color[0],
                    d.properties.color[1],
                    d.properties.color[2],
                    255,
                  ]
                : [255, 215, 0, 255];
            cityFurnitureProps.getPointRadius = 5;
            cityFurnitureProps.getLineWidth = 1;

            layers.push(cityFurnitureProps);
          }

          console.log(layers);

          if (callback) {
            callback(layers, offsetLngLatAlt);
          }
        },
        id === 'sthlm-building-surfaces'
      );
      break;
    default:
      console.warn('File type not supported by parser');
  }
}
