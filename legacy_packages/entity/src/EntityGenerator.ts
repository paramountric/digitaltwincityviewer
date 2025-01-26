import { random } from 'canvas-sketch-util';
import { Entity } from './Entity.js';

type EntityPropertyConfig = {
  valuePrefix?: string; // prefix for string based property values, added before the numeric counter
  key: string; // propertyKey
  minValue?: number;
  maxValue?: number;
  categorical?: boolean; // convert the number to string
  unitCode?: string; // not used for categories
};

type EntityGeneratorProps = {
  idPrefix: string; // what is added before the numeric counter on the entity
  type: string; // the entity type
  numEntities: number; // how many should be generated
  propertiesConfig?: EntityPropertyConfig[];
  startDate?: string; // iso date string, defaults to now
  endDate?: string;
  randomDate?: boolean; // this will set observedAt to a random date between startDate and endDate
  resetSeeder?: boolean; // if needed to generate batches of entities, the number should be different
};

export class EntityGenerator {
  seed: string | number;
  seeder;
  constructor(seed?) {
    this.seed = seed || `${Math.random()}`;
    this.seeder = random.createRandom(seed);
  }
  getValue(min, max) {
    const val = Math.round(this.seeder.range(min, max));
    return val;
  }
  getNoiseValue(x) {
    const amplitude = 10;
    const val = this.seeder.noise1D(x, 0.2, amplitude); // frequency and amplitude (how quick its fluctuating and how much its fluctuating)
    return val + amplitude; // make it positive
  }
  generateEntities(props: EntityGeneratorProps) {
    if (props.resetSeeder) {
      this.seeder = random.createRandom(this.seed);
    }
    const entities = Array(props.numEntities)
      .fill(null)
      .map((_, i) => {
        const properties = props.propertiesConfig.reduce((acc, pConfig) => {
          let value;
          // if value prefix, override value with incremental
          if (pConfig.valuePrefix) {
            value = `${pConfig.valuePrefix} ${i + 1}`;
          }
          acc[pConfig.key] = {
            type: 'Property',
            value:
              value ||
              this.getValue(pConfig.minValue || 1, pConfig.maxValue || 10),
            unitCode: pConfig.unitCode,
          };
          if (pConfig.categorical) {
            acc[pConfig.key].value = `${acc[pConfig.key].value}`;
          }
          return acc;
        }, {});
        let observedAt = props.startDate
          ? props.startDate
          : new Date().toISOString();
        if (props.randomDate) {
          const start = new Date(observedAt).getSeconds();
          const end = props.endDate
            ? new Date(props.endDate).getSeconds()
            : start + 2600000; // around 30 days
          const second = Math.round(this.seeder.range(start, end));
          observedAt = new Date(second).toISOString();
        }
        const entity = new Entity({
          id: `${props.idPrefix}-${i + 1}`,
          observedAt,
          type: props.type,
          relationships: {},
          properties,
        });
        return entity;
      });
    return entities;
  }
  setRelationships(
    fromEntities,
    toEntities,
    relationKey,
    properties = {},
    observedAt?
  ) {
    fromEntities.forEach(fromEntity => {
      const target =
        toEntities[Math.floor(this.seeder.range(0, toEntities.length))];
      fromEntity.relationships[relationKey] = {
        type: 'Relationship',
        object: target.id,
        properties: Object.assign({}, properties),
        observedAt: observedAt || new Date().toISOString(),
      };
    });
  }
  generateDownstreamSample(numEntities?: number) {
    const fromEntities = this.generateEntities({
      numEntities: numEntities || 10,
      idPrefix: 'from',
      type: 'FromEntity',
      propertiesConfig: [
        {
          minValue: 1,
          maxValue: 10,
          key: 'volume',
          unitCode: 'm3',
        },
      ],
    });
    // another batch with same type going straight to end
    const from2Entities = this.generateEntities({
      numEntities: numEntities || 10,
      idPrefix: 'from',
      type: 'FromEntity',
      propertiesConfig: [
        {
          minValue: 1,
          maxValue: 10,
          key: 'volume',
          unitCode: 'm3',
        },
      ],
      resetSeeder: true,
    });
    const viaEntities = this.generateEntities({
      numEntities: numEntities || 10,
      idPrefix: 'via',
      type: 'ViaEntity',
      propertiesConfig: [
        {
          minValue: 1,
          maxValue: 10,
          key: 'volume',
          unitCode: 'm3',
        },
      ],
      resetSeeder: true,
    });
    const via2Entities = this.generateEntities({
      numEntities: numEntities || 10,
      idPrefix: 'via2',
      type: 'Via2Entity',
      propertiesConfig: [
        {
          minValue: 1,
          maxValue: 10,
          key: 'volume',
          unitCode: 'm3',
        },
      ],
      resetSeeder: true,
    });
    const toEntities = this.generateEntities({
      numEntities: numEntities || 10,
      idPrefix: 'to',
      type: 'ToEntity',
      propertiesConfig: [],
    });
    this.setRelationships(fromEntities, viaEntities, 'downstream');
    this.setRelationships(from2Entities, toEntities, 'downstream');
    this.setRelationships(viaEntities, via2Entities, 'downstream');
    this.setRelationships(via2Entities, toEntities, 'downstream');
    return [...fromEntities, ...viaEntities, ...toEntities];
  }
}
