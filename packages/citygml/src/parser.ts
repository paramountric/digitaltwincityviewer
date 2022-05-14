import { SaxesParser, SaxesTagNS } from 'saxes';
import { CityJSONV111 } from '@dtcv/cityjson';

// just a backup plan for ids, there should always be an id in the original file for the relevant objects to parse
let count = 1;
function createId() {
  return `id-${count++}`;
}

function parseCityGml(xml: string, cb: (result) => void) {
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

  let currentNode: SaxesTagNS | null = null;
  const openTags = [];

  let currentCityObject;
  let currentFunction = null;
  let currentSurfaceType: string;
  let currentLod: number;
  let currentGeometry;
  let currentPosList;

  const parserConfig = {
    // * cityObjectMembers
    'transportation:TrafficArea': {
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject = {
          type: 'TrafficArea',
          geometry: [],
        };

        currentCityObject = cityObject;

        result.CityObjects[id] = cityObject;
      },
      closeTag: node => {
        currentCityObject = null;
      },
    },
    'transportation:AuxiliaryTrafficArea': {
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject = {
          type: 'AuxiliaryTrafficArea',
          geometry: [],
        };

        currentCityObject = cityObject;

        result.CityObjects[id] = cityObject;
      },
      closeTag: node => {
        currentCityObject = null;
      },
    },
    'trecim:Facility': {
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject = {
          type: 'Facility',
          geometry: [],
        };

        currentCityObject = cityObject;

        result.CityObjects[id] = cityObject;
      },
      closeTag: node => {
        currentCityObject = null;
      },
    },
    'bldg:Building': {
      opentag: node => {
        const id = node.attributes['gml:id']?.value || createId();

        const cityObject = {
          type: 'Building',
          geometry: [],
        };

        currentCityObject = cityObject;

        result.CityObjects[id] = cityObject;
      },
      closeTag: node => {
        currentCityObject = null;
      },
    },
    // * semantics
    'transportation:function': {
      openTag: node => {
        currentFunction = node;
      },
      text: text => {
        if (currentFunction) {
          currentCityObject.function = text;
        }
      },
      closeTag: node => {
        currentFunction = null;
      },
    },
    'bldg:GroundSurface': {
      opentag: node => {
        currentSurfaceType = 'GroundSurface';
      },
      closetag: node => {
        currentSurfaceType = null;
      },
    },
    'bldg:WallSurface': {
      opentag: node => {
        currentSurfaceType = 'WallSurface';
      },
      closetag: node => {
        currentSurfaceType = null;
      },
    },
    'bldg:RoofSurface': {
      opentag: node => {
        currentSurfaceType = 'RoofSurface';
      },
      closetag: node => {
        currentSurfaceType = null;
      },
    },
    // * lod levels
    'transportation:lod2MultiSurface': {
      opentag: node => {
        currentLod = 2;
      },
      closetag: node => {
        currentLod = null;
      },
    },
    'bldg:lod3MultiSurface': {
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
      opentag: node => {
        currentGeometry = {
          id: node.attributes['gml:id']?.value || createId(),
          type: 'CompositeSurface',
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
        if (!currentGeometry) {
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
    // * positions are pushed into current active geometry
    'gml:posList': {
      opentag: node => {
        if (!currentGeometry) {
          return;
        }
        currentPosList = [];
      },
      text: text => {
        if (!currentGeometry) {
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
        if (!currentGeometry) {
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
    if (parserConfig[node.name]) {
      currentNode = node;
      openTags.push(node.name);
      if (parserConfig[node.name].opentag) {
        parserConfig[node.name].opentag(node);
      }
    }
  });
  parser.on('closetag', node => {
    if (parserConfig[node.name]) {
      openTags.pop();
      if (parserConfig[node.name].closetag) {
        parserConfig[node.name].closetag(node);
      }
      currentNode = null;
    }
  });
  parser.on('end', () => {
    result.metadata.geographicalExtent = geographicalExtent;
    console.log('end', result);
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
