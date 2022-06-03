import { SaxesParser, SaxesTagPlain } from 'saxes';

type Schema = {
  name: string;
  tagName: string;
  isAbstract: boolean;
  documentation?: string;
  properties?: {
    [propertyKey: string]: string | boolean | number;
  };
};

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
        if (!currentSchema) {
          console.log(node);
          currentNode = node;
          currentSchema = {
            name: node.attributes.name,
            tagName: node.name,
            isAbstract: node.attributes.abstract === 'true' ? true : false,
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
