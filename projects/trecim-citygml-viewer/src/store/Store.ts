import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';
import {
  parseXsd,
  parseCityGml,
  CityGmlParserOptions,
  Schema,
} from '@dtcv/citygml';
import {
  buildingsLayerSurfacesLod3Data,
  transportationLayerTrafficAreaLod2Data,
  transportationLayerAuxiliaryTrafficAreaLod2Data,
  landuseSurfaceLod1Data,
  furnitureLod1Data,
  facilityLod1Data,
  projectVertices,
  projectExtent,
} from '@dtcv/cityjson';
import {
  getLayerPosition,
  getBounds,
  coordinatesToMeters,
} from '@dtcv/geojson';

// Notes on this code: The point of this code is to see how to generate context and schema for this particular project
// The code for loading context and schemas will later be removed into a specific generic module for generating this
// In short: the context and schemas will be published somewhere else and the app will have a link to the schemas

// todo: this is json-ld -> @types/jsonld
// The type key is essential, the value is normally a string or an object with linked data refs
type Context = {
  [typeKey: string]: any;
};

// This is a special entity for trying to add JTD to the app (from the parsed xsd). Very experimental.
// Also, it's a bit like a metadata layer on top of entities where entities have types, and types have types (abstractions, etc)
// Note: reason for the schema is that it complements linked data with validation and other data model features that is missing (?) in linked data
type EntityType = {
  id: string;
  type: string; // this links to other types or is "EntityType" (not sure about multiple types)
  properties: {
    [pKey: string]: {
      key: string;
      value?: string;
      type: string;
    }; // wrap the descriptive key/value of the type as properties
  };
  relationships: {
    [rKey: string]: string; // this must link to other type keys
  };
};

// this is a bit tricky, it's the json version of xsd specifications
type ParsedSchema = {
  name: string;
  type?: string;
  extension?: string;
  restriction?: string;
  pattern?: string;
  enumeration?: {
    type: string;
    values: string[];
  };
  tagName: string;
  isAbstract?: boolean;
  refs?: any;
  ref?: string;
  elements?: {
    [elementKey: string]: any;
  };
};

const DEFAULT_CONTEXT = 'trecim';

export class Store {
  public isLoading = false;
  public loadingMessage = '';
  public loadingProgress = 0;
  public showLeftMenu = false;
  public viewer: Viewer;
  // this should be loaded into the app dynamically
  public contexts: {
    [contextKey: string]: Context;
  } = {};
  public entityTypes: {
    [entityKey: string]: EntityType;
  } = {};
  public entityTypeFilter: {
    types: {
      [typeKey: string]: boolean;
    };
  };
  // the instances will have an element name (tag name) and this is not the same as type
  // so this mapping needs to take instances and find the relevant types (data does not contain the types, only the schema)
  public elementToTypeMapping: {
    [elementKey: string]: string;
  };
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.contexts[DEFAULT_CONTEXT] = {
      type: '@type',
      id: '@id',
    };
    this.entityTypes = {};
    this.entityTypeFilter = {
      types: {},
    };
    this.elementToTypeMapping = {};
    makeObservable(this, {
      setIsLoading: action,
      showLeftMenu: observable,
      setShowLeftMenu: action,
      loadingMessage: observable,
      isLoading: observable,
      loadingProgress: observable,
      entityTypeFilter: observable,
      showEntityType: action,
    });

    this.loadProjectFiles();
  }

  public updateEntityGraph() {
    const filteredEntityTypes = Object.values(this.entityTypes).filter(
      entityType => {
        if (this.entityTypeFilter.types[entityType.id]) {
          return true;
        }
      }
    );
    // this is just prototype code!
    const nodes = [];
    const edges = [];
    const nodeMap = {};
    for (const entityType of filteredEntityTypes) {
      nodes.push({
        id: entityType.id,
        name: entityType.id,
      });
      nodeMap[entityType.id] = true;
      edges.push({
        id: entityType.id, //+ 'hasType' + entityType.type,
        name: 'hasType',
        source: entityType.id,
        target: entityType.type,
      });
      for (const property of Object.values(entityType.properties)) {
        const propertyKey = `${property.key}${entityType.type}`;
        nodes.push({
          id: propertyKey,
          name: property.key,
        });
        nodeMap[propertyKey] = true;
        edges.push({
          id: entityType.id + 'hasProperty' + propertyKey,
          name: 'hasProperty',
          source: entityType.id,
          target: propertyKey,
        });
        // edges.push({
        //   id: propertyKey + 'hasType' + property.type,
        //   name: 'hasType',
        //   source: propertyKey,
        //   target: property.type,
        // });
      }
      for (const relationshipKey of Object.keys(entityType.relationships)) {
        edges.push({
          id:
            entityType.id +
            relationshipKey +
            entityType.relationships[relationshipKey],
          name: relationshipKey,
          source: entityType.id,
          target: entityType.relationships[relationshipKey],
        });
      }
    }

    for (const edge of edges) {
      if (!nodeMap[edge.source]) {
        nodes.push({
          id: edge.source,
          name: edge.source,
        });
        nodeMap[edge.source] = true;
      }
      if (!nodeMap[edge.target]) {
        nodes.push({
          id: edge.target,
          name: edge.target,
        });
        nodeMap[edge.target] = true;
      }
    }

    this.viewer.updateLayer({
      layerId: 'graph-layer',
      props: {
        nodes,
        edges,
      },
      state: {
        url: 'no-url',
      },
    });
    this.viewer.render();
  }

  // todo: promisify! also, prebuild the schema files and load from package
  private async loadProjectFiles() {
    // start by loading the schema for this project -> the 3CIM ADE
    this.setIsLoading(true, 'Loading ADE extension');
    const extension: any = await this.loadCityModelSchema(
      'http://localhost:9000/files/citygml/3CIM/3CIM_ade_ver1.xsd'
    );
    this.addToContext(extension, DEFAULT_CONTEXT);

    this.setIsLoading(true, 'Loading core schema');
    const core = await this.loadCityModelSchema(
      'http://localhost:9000/files/xsd/citygml2/core.xsd'
    );
    this.addToContext(core, 'core');

    this.setIsLoading(true, 'Loading building schema');
    const building = await this.loadCityModelSchema(
      'http://localhost:9000/files/xsd/citygml2/building.xsd'
    );
    this.addToContext(building, 'building');

    this.setIsLoading(true, 'Loading city model');
    await this.loadCityModel(
      'http://localhost:9000/files/citygml/3CIM/testdata_3CIM_ver1_malmo_20220205_XSD.gml'
    );

    await this.loadContextMap(
      'http://localhost:9000/files/geojson/osm-malmo.json'
    );
  }

  public async loadCityModelSchema(url: string): Promise<any> {
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    return parseXsd(await response.text());
  }

  public async loadCityModel(url: string) {
    this.setIsLoading(true, 'Loading test data');
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    const options: CityGmlParserOptions = {
      cityObjectMembers: {
        'bldg:Building': true,
        'transportation:TrafficArea': true,
        'transportation:AuxiliaryTrafficArea': true,
        'transportation:TransportationComplex': false, // how to do with this?
        'luse:LandUse': true,
        'frn:CityFurniture': true,
        'trecim:Facility': true,
      },
    };
    parseCityGml(await response.text(), options, cityGmlResult => {
      console.log(cityGmlResult);
      cityGmlResult.vertices = projectVertices(
        cityGmlResult.vertices,
        'EPSG:3008'
      );
      cityGmlResult.metadata.geographicalExtent = projectExtent(
        cityGmlResult.metadata.geographicalExtent
      );

      // these settings are for playing around with the z level of the layers, the viewer needs to be flexible here so that developers can configure the layers z slightly depending on project
      const buildingsZ = 22;
      const transportationZ = 30;
      const transportationAuxZ = 31;
      const landuseZ = 30;
      const furnitureZ = 31;
      const facilityZ = 31;

      if (options.cityObjectMembers['bldg:Building']) {
        this.viewer.updateLayer({
          layerId: 'buildings-layer-surfaces-lod-3',
          props: buildingsLayerSurfacesLod3Data(cityGmlResult, {
            addZ: buildingsZ,
            refLat: 55.6,
          }),
          state: {
            url,
          },
        });
      }
      if (options.cityObjectMembers['transportation:TrafficArea']) {
        this.viewer.updateLayer({
          layerId: 'transportation-layer-traffic-area-lod-2',
          props: transportationLayerTrafficAreaLod2Data(cityGmlResult, {
            addZ: transportationZ,
          }),
          state: {
            url,
          },
        });
      }
      if (options.cityObjectMembers['transportation:AuxiliaryTrafficArea']) {
        this.viewer.updateLayer({
          layerId: 'transportation-layer-auxiliary-traffic-area-lod-2',
          props: transportationLayerAuxiliaryTrafficAreaLod2Data(
            cityGmlResult,
            { addZ: transportationAuxZ }
          ),
          state: {
            url,
          },
        });
      }
      if (options.cityObjectMembers['luse:LandUse']) {
        this.viewer.updateLayer({
          layerId: 'landuse-layer-surface-lod-1',
          props: landuseSurfaceLod1Data(cityGmlResult, { addZ: landuseZ }),
          state: {
            url,
          },
        });
      }
      if (options.cityObjectMembers['frn:CityFurniture']) {
        const furnitureData = furnitureLod1Data(cityGmlResult, {
          addZ: furnitureZ,
        });
        this.viewer.updateLayer({
          layerId: 'city-furniture-general-layer-lod-1',
          props: Object.assign({}, furnitureData, {
            data: furnitureData.data.filter(d => d.type !== 'Polygon'),
          }),
          state: {
            url,
          },
        });
        this.viewer.updateLayer({
          layerId: 'city-furniture-polygon-layer-lod-1',
          props: Object.assign({}, furnitureData, {
            data: furnitureData.data.filter(d => d.type === 'Polygon'),
          }),
          state: {
            url,
          },
        });
      }
      if (options.cityObjectMembers['trecim:Facility']) {
        this.viewer.updateLayer({
          layerId: 'citygml-ade-lod-1',
          props: facilityLod1Data(cityGmlResult, { addZ: facilityZ }),
          state: {
            url,
          },
        });
      }

      this.viewer.render();
      this.setIsLoading(false);
    });
  }

  async loadContextMap(url) {
    this.setIsLoading(true, 'Loading context map');
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    const geojson = await response.json();
    const { features } = geojson;
    coordinatesToMeters(features);
    const { min, max, center, width, height, modelMatrix } =
      getLayerPosition(features);
    this.viewer.updateLayer({
      layerId: 'import-geojson',
      props: {
        data: features,
        modelMatrix,
        min,
        max,
        center,
        width,
        height,
      },
      state: {
        url,
      },
    });
    this.viewer.render();
    this.setIsLoading(false);
  }

  public setIsLoading(isLoading: boolean, loadingMessage?: string) {
    this.loadingMessage = loadingMessage || '';
    this.isLoading = isLoading;
  }

  public setLoadingProgress(percentage: number) {
    this.loadingProgress = percentage;
  }

  public setShowLeftMenu(show: boolean) {
    this.showLeftMenu = show;
  }

  public showEntityType(typeKey: string, show: boolean) {
    this.entityTypeFilter.types[typeKey] = show;
    this.updateEntityGraph();
    console.log(this);
  }

  public showPropertyType(propertyKey: string, type: string) {
    const entityType = this.entityTypes[type];
    console.log(entityType);
  }

  public reset() {
    this.viewer.setSelectedObject(null);
    this.viewer.unload();
  }

  public render() {
    this.viewer.render();
  }

  addFileData(json: any, url: string) {
    // todo: move the code from after parser into this function
  }

  getType(element) {
    if (!element.type) {
      return 'EntityType';
    }
    const typeSplit = element.type.split(':');
    const type =
      typeSplit.length > 0 && typeSplit[0] === DEFAULT_CONTEXT
        ? typeSplit.slice(1).join(':')
        : element.type;
    return type;
  }

  addToContext(parsedSchema: any, namespace) {
    const context = this.contexts[namespace] || {
      type: '@type',
    };
    context['@type'] =
      parsedSchema.context.xmlns || parsedSchema.context.targetNamespace;
    Object.assign(context, parsedSchema.context);
    this.contexts[namespace] = context;
    console.log(parsedSchema);
    const prefix = namespace !== DEFAULT_CONTEXT ? `${namespace}:` : '';
    const schemas: ParsedSchema[] = Object.values(parsedSchema.schemas);
    for (const schema of schemas) {
      if (schema.type) {
        const type = this.getType(schema);
        // this.entityTypes[`${prefix}${schema.name}`] = {
        //   id: schema.name,
        //   type,
        //   properties: {},
        //   relationships: {
        //     context: namespace,
        //   },
        // };
        this.elementToTypeMapping[schema.name] = type;
      } else if (
        schema.tagName === 'xsd:complexType' ||
        schema.tagName === 'xs:complexType'
      ) {
        const complexType: EntityType = {
          id: schema.name,
          type: this.getType(schema),
          properties: {},
          relationships: {
            context: namespace,
          },
        };
        for (const element of Object.values(schema.elements)) {
          const propertyKey: string = element.name;
          const elementType = this.getType(element);

          complexType.properties[element.name] = {
            key: propertyKey,
            type: elementType,
          };
        }
        if (schema.extension) {
          complexType.relationships.extendedBy = schema.extension;
        }

        this.entityTypes[`${prefix}${schema.name}`] = complexType;
      } else if (
        schema.tagName === 'xsd:simpleType' ||
        schema.tagName === 'xs:simpleType'
      ) {
        const simpleType: EntityType = {
          id: schema.name,
          type: this.getType(schema),
          properties: {},
          relationships: {
            context: namespace,
          },
        };
        if (schema.enumeration && schema.enumeration.values.length > 0) {
          schema.type = 'EntityTypeEnumeration';
          const enumerationType = schema.enumeration.type;
          for (const enumeration of schema.enumeration.values) {
            simpleType.properties[enumeration] = {
              key: enumeration,
              type: enumerationType,
            };
          }
        } else if (schema.restriction) {
          simpleType.type = schema.restriction;
          if (schema.pattern) {
            const pattern = schema.pattern;
            simpleType.properties.pattern = {
              key: 'pattern',
              type: 'xsd:string',
              value: pattern,
            };
          }
        }
        this.entityTypes[`${prefix}${schema.name}`] = simpleType;
      }
    }
    console.log(this);
  }

  getLayerData(layerId) {
    return this.viewer.getLayerData(layerId);
  }

  getLoadedData() {
    return {
      BuildingSurfaces: this.getLayerData('buildings-layer-surfaces-lod3'),
    };
  }
}
