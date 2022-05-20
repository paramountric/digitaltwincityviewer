import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import '@spectrum-web-components/accordion/sp-accordion.js';
import '@spectrum-web-components/accordion/sp-accordion-item.js';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import { Store } from '../store/Store';

// structure is for later grouping in the panel
const displayProperties = [
  {
    // todo: move non-energy properties to another panel
    properties: [
      // 'heatedFloorAreaCount',
      // 'area',
      // 'heatedFloorAreaSum',
      // 'heatedFloorArea',
      // 'height',
    ],
  },
  {
    properties: [
      'deliveredEnergy2020',
      'deliveredEnergy2030',
      'deliveredEnergy2050',
      'primaryEnergy2020',
      'primaryEnergy2030',
      'primaryEnergy2050',
      'finalEnergy2020',
      'finalEnergy2030',
      'finalEnergy2050',
      'ghgEmissions2020',
      'ghgEmissions2030',
      'ghgEmissions2050',
      'heatDemand2020',
      'heatDemand2030',
      'heatDemand2050',
    ],
  },
];

// all properties in the attribute object will be shown, labels are taken from here
const propertyLabels = {
  deliveredEnergy2020: 'Delivered energy 2020',
  deliveredEnergy2030: 'Delivered energy 2030',
  deliveredEnergy2050: 'Delivered energy 2050',
  primaryEnergy2020: 'Primary energy 2020',
  primaryEnergy2030: 'Primary energy 2030',
  primaryEnergy2050: 'Primary energy 2050',
  finalEnergy2020: 'Final energy 2020',
  finalEnergy2030: 'Final energy 2030',
  finalEnergy2050: 'Final energy 2050',
  ghgEmissions2020: 'GHG emissions 2020',
  ghgEmissions2030: 'GHG emissions 2030',
  ghgEmissions2050: 'GHG emissions 2050',
  heatDemand2020: 'Heat demand 2020',
  heatDemand2030: 'Heat demand 2030',
  heatDemand2050: 'Heat demand 2050',

  // todo: fill up with more related values
  // deliveredEnergyBuildingAreaNorm: 'Delivered energy/m²',
  // finalEnergy: 'Final energy',
  // finalEnergyBuildingAreaNorm: 'Final energy/m²',
  // ghgEmissions: 'GHG emissions',
  // ghgEmissionsBuildingAreaNorm: 'GHG emissions/m²',
  // height: 'Building height',
  // area: 'Area',
  // heatedFloorArea: 'Heated floor area',
  // heatedFloorAreaSum: 'Heated floor area total',
  // heatedFloorAreaCount: 'Number of buildings',
  // primaryEnergy: 'Primary energy',
  // primaryEnergyBuildingAreaNorm: 'Primary energy/m²',
};

// these are the units, but could be done with enum instead
const units = {
  height: 'm',
  deliveredEnergy: 'kWh',
  deliveredEnergy2020: 'kWh',
  deliveredEnergyBuildingAreaNorm: 'kWh',
  finalEnergy: 'kWh',
  finalEnergyBuildingAreaNorm: 'kWh',
  area: 'm²',
  heatedFloorArea: 'm²',
  heatedFloorAreaSum: 'm²',
  primaryEnergy: 'kWh',
  primaryEnergyBuildingAreaNorm: 'kWh',
  ghgEmissions: 'kgCO2-eq.',
  ghgEmissionsBuildingAreaNorm: 'kgCO2-eq.',
};

// if needs to be rounded
const rounding = {
  height: 1,
  deliveredEnergy: 0,
  deliveredEnergyBuildingAreaNorm: 1,
  finalEnergy: 0,
  finalEnergyBuildingAreaNorm: 1,
  ghgEmissions: 0,
  ghgEmissionsBuildingAreaNorm: 1,
  heatedFloorArea: 0,
  heatedFloorAreaSum: 0,
  primaryEnergy: 0,
  primaryEnergyBuildingAreaNorm: 1,
};

@customElement('dte-building-feature-energy-panel')
export class BuildingFeatureEnergyPanel extends MobxLitElement {
  static styles = css`
    :host span:first-child {
      font-weight: bolder;
    }
  `;
  @property({ type: Object })
  public properties;

  getFeatureName(object) {
    return (
      object.properties.name ||
      object.properties.address ||
      `Feature ${object.id}`
    );
  }

  formatValue(properties, propertyKey) {
    let val = properties[propertyKey];
    if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
      val = val.toFixed(rounding[propertyKey]);
    }
    return val;
  }

  render() {
    if (!this.properties) {
      return null;
    }
    console.log(this.properties);
    const properties = displayProperties.reduce((memo, setting) => {
      const items = setting.properties.map(key => {
        return {
          property: key,
          label: propertyLabels[key],
          unit: units[key],
          decimals: rounding[key],
        };
      });
      memo.push(...items);
      return memo;
    }, []);
    return html`<div>
      ${properties.map(item => {
        const val = this.formatValue(this.properties, item.property);
        return html`<div>
          <span>${item.label || 'fixme'}:</span>
          <span>${val || '-'} ${units[item.property] || ''}</span>
        </div>`;
      })}
    </div>`;
  }
}
