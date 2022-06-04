import { SaxesParser, SaxesTagPlain } from 'saxes';

type Schema = {
  name: string;
  tagName: string;
  isAbstract: boolean;
  documentation?: string;
  extension?: string;
  elements?: {
    [elementTag: string]: {
      name: string;
      type: string;
      minOccurs: number;
      maxOccurs: number;
    };
  };
  ref?: string;
  refs?: {
    [refName: string]: string;
  };
};

function createNamedNode(node) {
  const { attributes } = node;
  return {
    name: attributes.name,
    type: attributes.type,
    substitutionGroup: attributes.substitutionGroup,
    tagName: node.name,
    isAbstract: attributes.abstract === 'true' ? true : false,
    minOccurs:
      !attributes.minOccurs || attributes.minOccurs === '0'
        ? 0
        : Number(attributes.minOccurs),
    maxOccurs:
      !attributes.maxOccurs || attributes.maxOccurs === 'unbounded'
        ? Infinity
        : Number(attributes.maxOccurs),
  };
}

// note: this is temporary until figure out how to deal with schema/json vs CityGML pragmatic vs ontology-ish
export function parseXsd(xsd: string, callback) {
  const parser = new SaxesParser();
  const result = {
    schemas: {},
  };
  let currentNode: SaxesTagPlain | null = null;
  let currentSchema: Schema | null;

  const parserConfig = {
    'xs:complexType': {
      opentag: node => {
        if (!currentSchema) {
          currentNode = node;
          currentSchema = {
            name: node.attributes.name,
            tagName: node.name,
            isAbstract: node.attributes.abstract === 'true' ? true : false,
            elements: {},
            refs: {},
          };
        }
      },
      closetag: node => {
        if (currentSchema && node.name === currentSchema.tagName) {
          result.schemas[currentSchema.name] = currentSchema;
          currentSchema = null;
          currentNode = null;
        }
      },
      text: text => {
        currentSchema.documentation = text;
      },
    },
    'xs:element': {
      opentag: node => {
        if (currentSchema) {
          console.log(node);
          const { attributes } = node;
          if (attributes.name) {
            currentSchema.elements[attributes.name] = createNamedNode(node);
          }
        } else {
          currentNode = node;
          const { attributes } = node;
          if (attributes.name) {
            currentSchema = createNamedNode(node);
            if (node.isSelfClosing) {
              result.schemas[currentSchema.name] = currentSchema;
              currentSchema = null;
              currentNode = null;
            }
          } else if (attributes.ref) {
            console.log('does this happen?', node);
          }
        }
      },
      closetag: node => {
        if (currentSchema && node.name === currentSchema.tagName) {
          result.schemas[currentSchema.name] = currentSchema;
          currentSchema = null;
          currentNode = null;
        }
      },
      text: text => {
        currentSchema.documentation = text;
      },
    },
    'xs:extension': {
      opentag: node => {
        if (currentSchema) {
          currentSchema.extension = node.attributes.base;
        }
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
  parser.on('opentag', (node: SaxesTagPlain) => {
    if (parserConfig[node.name] && parserConfig[node.name].opentag) {
      parserConfig[node.name].opentag(node);
    }
  });
  parser.on('closetag', node => {
    if (parserConfig[node.name] && parserConfig[node.name].closetag) {
      parserConfig[node.name].closetag(node);
    }
  });
  parser.on('end', () => {
    callback(result);
  });
  parser.write(xsd).close();
}
