import { SaxesParser, SaxesTagNS } from 'saxes';
import { CityJSONV111 } from '@dtcv/cityjson';

// ! This parser is just a brute force parser to get started quickly with some sample models
// ! There are many sophisticated ways to parse data including lexers and schema generated functions
// ! However, it's useful sometimes in a project to do a targeted implementation instead of working with a massive schema

// just a backup plan for ids, there should always be an id in the original file for the relevant objects to parse
let count = 1;
function createId() {
  return `id-${count++}`;
}
// an object to use during dev for examine all available tags
const tags = {};

// todo: figure out how to group CityGML CityObjectMember selection to layers (now it is one layer per CityObjectMember)
export type CityGmlParserOptions = {
  cityObjectMembers: {
    [tagName: string]: boolean;
  };
};

function parseCityGml(
  xml: string,
  options: CityGmlParserOptions,
  cb: (result) => void,
  swapPosHack?: boolean // because someone did a classic mistake to turn lon and lat the other way around
) {
  const parser = new SaxesParser({
    xmlns: true,
    additionalNamespaces: {
      'xmlns:brid': 'http://www.opengis.net/citygml/bridge/2.0',
      'xmlns:transportation':
        'http://www.opengis.net/citygml/transportation/2.0',
      'xmlns:frn': 'http://www.opengis.net/citygml/cityfurniture/2.0',
      'xmlns:wtr': 'http://www.opengis.net/citygml/waterbody/2.0',
      'xmlns:sch': 'http://www.ascc.net/xml/schematron',
      'xmlns:veg': 'http://www.opengis.net/citygml/vegetation/2.0',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      'xmlns:tun': 'http://www.opengis.net/citygml/tunnel/2.0',
      'xmlns:tex': 'http://www.opengis.net/citygml/texturedsurface/2.0',
      'xmlns:gml': 'http://www.opengis.net/gml',
      'xmlns:gen': 'http://www.opengis.net/citygml/generics/2.0',
      'xmlns:dem': 'http://www.opengis.net/citygml/relief/2.0',
      'xmlns:app': 'http://www.opengis.net/citygml/appearance/2.0',
      'xmlns:luse': 'http://www.opengis.net/citygml/landuse/2.0',
      'xmlns:bldg': 'http://www.opengis.net/citygml/building/2.0',
      'xmlns:smil20': 'http://www.w3.org/2001/SMIL20/',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:smil20lang': 'http://www.w3.org/2001/SMIL20/Language',
      'xmlns:pbase': 'http://www.opengis.net/citygml/profiles/base/2.0',
      'xmlns:core': 'http://www.opengis.net/citygml/2.0',
      'xmlns:grp': 'http://www.opengis.net/citygml/cityobjectgroup/2.0',
      'xmlns:trecim': 'PATH3CIM_ade.xsd',
    },
  });

  const result: CityJSONV111 = {
    type: 'CityJSON',
    version: '1.1.1',
    vertices: [],
    metadata: {},
    transform: {
      scale: [1, 1, 1],
      translate: [0, 0, 0],
    },
    CityObjects: {},
  };

  // this can normally be taken from the CityGML file, but is that always the case?
  // todo: how to use geographicalExtent from imported cityjson type?
  const geographicalExtent: [number, number, number, number, number, number] = [
    Infinity,
    Infinity,
    Infinity,
    -Infinity,
    -Infinity,
    -Infinity,
  ];

  // todo: this have to be properly used from CityJson, right now trying to figure out how to add ADE data to the CityObject
  type CityObject = {
    id?: string;
    namespace: string;
    type: string;
    version?: string;
    function?: string;
    geometry: [];
  };

  let currentNode: SaxesTagNS | null = null;
  const openTags = [];

  let currentCityObject;
  let currentCityObjectId;
  let currentId = null;
  let currentVersion = null;
  let currentFunction = null;
  let currentClass = null;
  let currentSurfaceType: string;
  //let currentSurfaceNumber = 0;
  let currentLod: number;
  let currentGeometry;
  let currentPosList;

  const parserConfig = {
    // * cityObjectMembers
    'transportation:Railway': {
      include: options.cityObjectMembers['transportation:Railway'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'transportation',
          type: 'Railway',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'transportation:TrafficArea': {
      include: options.cityObjectMembers['transportation:TrafficArea'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'transportation',
          type: 'TrafficArea',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'transportation:AuxiliaryTrafficArea': {
      include: options.cityObjectMembers['transportation:AuxiliaryTrafficArea'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'transportation',
          type: 'AuxiliaryTrafficArea',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'transportation:TransportationComplex': {
      include:
        options.cityObjectMembers['transportation:TransportationComplex'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'transportation',
          type: 'TransportationComplex',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'veg:PlantCover': {
      include: options.cityObjectMembers['veg:PlantCover'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'vegetation',
          type: 'PlantCover',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'trecim:function': {
      include: true,
      opentag: node => {
        currentFunction = node;
      },
      text: text => {
        if (currentCityObject && currentFunction) {
          currentCityObject.function = text;
        }
      },
      closetag: node => {
        currentFunction = null;
      },
    },
    'trecim:version': {
      include: true,
      opentag: node => {
        currentVersion = node;
      },
      text: text => {
        if (currentCityObject && currentVersion) {
          currentCityObject.version = text;
        }
      },
      closetag: node => {
        currentVersion = null;
      },
    },
    'trecim:id': {
      include: true,
      opentag: node => {
        currentId = node;
      },
      text: text => {
        if (currentCityObject && currentId) {
          currentCityObject.id = text;
        }
      },
      closetag: node => {
        currentId = null;
      },
    },
    'trecim:Facility': {
      include: options.cityObjectMembers['trecim:Facility'],

      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'trecim',
          type: 'Facility',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'trecim:lod1Point': {
      include: true,
      opentag: node => {
        currentLod = 1;
      },
      closetag: node => {
        currentLod = null;
      },
    },
    'luse:LandUse': {
      include: options.cityObjectMembers['luse:LandUse'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'luse',
          type: 'LandUse',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'frn:CityFurniture': {
      include: options.cityObjectMembers['frn:CityFurniture'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'frn',
          type: 'CityFurniture',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    'frn:function': {
      include: true,
      opentag: node => {
        currentFunction = node;
      },
      text: text => {
        if (currentCityObject && currentFunction) {
          currentCityObject.function = text;
        }
      },
      closetag: node => {
        currentFunction = null;
      },
    },
    'frn:lod1Geometry': {
      include: true,
      opentag: node => {
        currentLod = 1;
      },
      closetag: node => {
        currentLod = null;
      },
    },
    'bldg:Building': {
      include: options.cityObjectMembers['bldg:Building'],
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject: CityObject = {
          id,
          namespace: 'bldg',
          type: 'Building',
          geometry: [],
        };

        currentCityObject = cityObject;
        currentCityObjectId = id;

        result.CityObjects[id] = cityObject;
      },
      closetag: node => {
        currentCityObject = null;
      },
    },
    // * semantics
    'transportation:function': {
      include: true,
      opentag: node => {
        currentFunction = node;
      },
      text: text => {
        if (currentCityObject && currentFunction) {
          currentCityObject.function = text;
        }
      },
      closetag: node => {
        currentFunction = null;
      },
    },
    'luse:class': {
      include: true,
      opentag: node => {
        currentClass = node;
      },
      text: text => {
        if (currentCityObject && currentClass) {
          currentCityObject.class = text;
        }
      },
      closetag: node => {
        currentClass = null;
      },
    },
    'luse:function': {
      include: true,
      opentag: node => {
        currentFunction = node;
      },
      text: text => {
        if (currentCityObject && currentFunction) {
          currentCityObject.function = text;
        }
      },
      closetag: node => {
        currentFunction = null;
      },
    },
    'bldg:GroundSurface': {
      include: true,
      opentag: node => {
        currentSurfaceType = 'GroundSurface';
        //currentSurfaceNumber++;
      },
      closetag: node => {
        currentSurfaceType = null;
      },
    },
    'bldg:WallSurface': {
      include: true,
      opentag: node => {
        currentSurfaceType = 'WallSurface';
        //currentSurfaceNumber++;
      },
      closetag: node => {
        currentSurfaceType = null;
      },
    },
    'bldg:RoofSurface': {
      include: true,
      opentag: node => {
        currentSurfaceType = 'RoofSurface';
        //currentSurfaceNumber++;
      },
      closetag: node => {
        currentSurfaceType = null;
      },
    },
    // * lod levels
    'transportation:lod2MultiSurface': {
      include: true,
      opentag: node => {
        currentLod = 2;
      },
      closetag: node => {
        currentLod = null;
      },
    },
    'bldg:lod3MultiSurface': {
      include: true,
      opentag: node => {
        currentLod = 3;
      },
      closetag: node => {
        currentLod = null;
      },
    },
    // * geometry
    // note: if nested, the inner geometry will be used
    'gml:CompositeSurface': {
      include: true,
      opentag: node => {
        if (!currentCityObject) {
          return;
        }
        const id = node.attributes['gml:id']?.value || createId();
        currentGeometry = {
          id,
          type: 'CompositeSurface',
          lod: currentLod,
          boundaries: [],
          semantics: {
            surfaces: [
              {
                type: currentSurfaceType,
                geometryId: id,
                lod: currentLod,
                //surfaceNumber: currentSurfaceNumber,
                cityObjectId: currentCityObjectId,
              },
            ],
            values: [],
          },
        };
      },
      closetag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        currentGeometry.semantics.values = Array(
          currentGeometry.boundaries.length
        ).fill(0);
        currentCityObject.geometry.push(currentGeometry);
        currentGeometry = null;
      },
    },
    'gml:MultiSurface': {
      include: true,
      opentag: node => {
        if (!currentCityObject) {
          return;
        }
        currentGeometry = {
          id: node.attributes['gml:id']?.value || createId(),
          type: 'MultiSurface',
          lod: currentLod,
          boundaries: [],
          semantics: {
            surfaces: [
              {
                type: currentSurfaceType,
              },
            ],
            values: [],
          },
        };
      },
      closetag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        currentGeometry.semantics.values = Array(
          currentGeometry.boundaries.length
        ).fill(0);
        currentCityObject.geometry.push(currentGeometry);
        currentGeometry = null;
      },
    },
    'gml:Polygon': {
      include: true,
      opentag: node => {
        if (!currentCityObject) {
          return;
        }
        currentGeometry = {
          id: node.attributes['gml:id']?.value || createId(),
          type: 'Polygon',
          lod: currentLod,
          boundaries: [],
          semantics: {
            surfaces: [
              {
                type: currentSurfaceType,
              },
            ],
            values: [],
          },
        };
      },
      closetag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        currentGeometry.semantics.values = Array(
          currentGeometry.boundaries.length
        ).fill(0);
        currentCityObject.geometry.push(currentGeometry);
        currentGeometry = null;
      },
    },
    'gml:LineString': {
      include: true,
      opentag: node => {
        if (!currentCityObject) {
          return;
        }
        currentGeometry = {
          id: node.attributes['gml:id']?.value || createId(),
          type: 'LineString',
          lod: currentLod,
          boundaries: [],
          semantics: {
            surfaces: [],
            values: [],
          },
        };
      },
      closetag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        currentGeometry.semantics.values = Array(
          currentGeometry.boundaries.length
        ).fill(0);
        currentCityObject.geometry.push(currentGeometry);
        currentGeometry = null;
      },
    },
    'gml:Point': {
      include: true,
      opentag: node => {
        if (!currentCityObject) {
          return;
        }
        currentGeometry = {
          id: node.attributes['gml:id']?.value || createId(),
          type: 'Point',
          lod: currentLod,
          boundaries: [],
          semantics: {
            surfaces: [],
            values: [],
          },
        };
      },
      closetag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        currentGeometry.semantics.values = Array(
          currentGeometry.boundaries.length
        ).fill(0);
        currentCityObject.geometry.push(currentGeometry);
        currentGeometry = null;
      },
    },
    // * positions are pushed into current active geometry
    'gml:pos': {
      include: true,
      opentag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        currentPosList = [];
      },
      text: text => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        const coords = text.split(' ').map(Number);
        for (let i = 0; i < coords.length; i += 3) {
          const x = coords[i];
          const y = coords[i + 1];
          const z = coords[i + 2];
          if (x < geographicalExtent[0]) {
            geographicalExtent[0] = x;
          }
          if (y < geographicalExtent[1]) {
            geographicalExtent[1] = y;
          }
          if (z < geographicalExtent[2]) {
            geographicalExtent[2] = z;
          }
          if (x > geographicalExtent[3]) {
            geographicalExtent[3] = x;
          }
          if (y > geographicalExtent[4]) {
            geographicalExtent[4] = y;
          }
          if (z > geographicalExtent[5]) {
            geographicalExtent[5] = z;
          }
          currentPosList.push([x, y, z]);
        }
      },
      closetag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        const vertexCount = result.vertices.length;
        const indices = Array(currentPosList.length)
          .fill(null)
          .map((_, i) => vertexCount + i);
        switch (currentGeometry.type) {
          case 'Point':
            currentGeometry.boundaries.push([indices]);
            result.vertices.push(...currentPosList);
            break;
          default:
            break;
        }
        currentPosList = null;
      },
    },
    'gml:posList': {
      include: true,
      opentag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        currentPosList = [];
      },
      text: text => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        const coords = text.split(' ').map(Number);
        for (let i = 0; i < coords.length; i += 3) {
          const x = coords[i];
          const y = coords[i + 1];
          const z = coords[i + 2];
          if (x < geographicalExtent[0]) {
            geographicalExtent[0] = x;
          }
          if (y < geographicalExtent[1]) {
            geographicalExtent[1] = y;
          }
          if (z < geographicalExtent[2]) {
            geographicalExtent[2] = z;
          }
          if (x > geographicalExtent[3]) {
            geographicalExtent[3] = x;
          }
          if (y > geographicalExtent[4]) {
            geographicalExtent[4] = y;
          }
          if (z > geographicalExtent[5]) {
            geographicalExtent[5] = z;
          }
          if (swapPosHack) {
            currentPosList.push([y, x, z]);
          } else {
            currentPosList.push([x, y, z]);
          }
        }
      },
      closetag: node => {
        if (!currentCityObject || !currentGeometry) {
          return;
        }
        removeDuplicatedPoint(currentPosList);
        const vertexCount = result.vertices.length;
        const indices = Array(currentPosList.length)
          .fill(null)
          .map((_, i) => vertexCount + i);
        switch (currentGeometry.type) {
          case 'CompositeSurface':
            currentGeometry.boundaries.push([indices]);
            result.vertices.push(...currentPosList);
            break;
          case 'MultiSurface':
            currentGeometry.boundaries.push([indices]);
            result.vertices.push(...currentPosList);
            break;
          case 'Polygon':
            currentGeometry.boundaries.push([indices]);
            result.vertices.push(...currentPosList);
            break;
          case 'LineString':
            currentGeometry.boundaries.push([indices]);
            result.vertices.push(...currentPosList);
            break;
          default:
            break;
        }
        currentPosList = null;
      },
    },
  };

  parser.on('error', e => {
    console.log(e);
  });
  parser.on('text', (text: string) => {
    text = text.replace(/[\n\r\t]/g, '');
    if (text && currentNode) {
      if (
        parserConfig[currentNode.name] &&
        parserConfig[currentNode.name].text
      ) {
        parserConfig[currentNode.name].text(text);
      }
    }
  });
  parser.on('opentag', (node: SaxesTagNS) => {
    tags[node.name] = (tags[node.name] || 0) + 1;

    if (parserConfig[node.name] && parserConfig[node.name].include) {
      currentNode = node;
      openTags.push(node.name);
      if (parserConfig[node.name].opentag) {
        parserConfig[node.name].opentag(node);
      }
    }
  });
  parser.on('closetag', node => {
    if (parserConfig[node.name] && parserConfig[node.name].include) {
      openTags.pop();
      if (parserConfig[node.name].closetag) {
        parserConfig[node.name].closetag(node);
      }
      currentNode = null;
    }
  });
  parser.on('end', () => {
    result.metadata.geographicalExtent = geographicalExtent;
    //console.log(tags);
    cb(result);
  });
  parser.write(xml).close();
}

function removeDuplicatedPoint(posList: [number[]]) {
  const start = posList[0];
  const end = posList[posList.length - 1];

  if (start[0] === end[0] && start[1] === end[1] && start[2] === end[2]) {
    return posList.splice(-1);
  }

  return posList;
}

export { parseCityGml };
