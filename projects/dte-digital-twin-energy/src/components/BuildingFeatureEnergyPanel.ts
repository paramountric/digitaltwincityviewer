import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Store } from '../store/Store';

// structure is for later grouping in the panel
const displayProperties = [
  {
    // todo: move non-energy properties to another panel
    properties: ['uuid', 'type', 'address', 'height', 'heatedFloorArea'],
  },
  {
    properties: [],
  },
];

// all properties in the attribute object will be shown, labels are taken from here
const propertyLabels = {
  address: 'Address',
  uuid: 'UUID',
  type: 'Type',
  heatedFloorArea: 'Heated floor area',
  height: 'Height',
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
  // primaryEnergy: 'Primary energy',
  // primaryEnergyBuildingAreaNorm: 'Primary energy/m²',
};

// these are the units, but could be done with enum instead
const units = {
  deliveredEnergy: 'kWh',
  deliveredEnergy2020: 'kWh',
  deliveredEnergy2030: 'kWh',
  deliveredEnergy2050: 'kWh',
  primaryEnergy: 'kWh',
  primaryEnergy2020: 'kWh',
  primaryEnergy2030: 'kWh',
  primaryEnergy2050: 'kWh',
  finalEnergy: 'kWh',
  finalEnergy2020: 'kWh',
  finalEnergy2030: 'kWh',
  finalEnergy2050: 'kWh',
  ghgEmissions: 'kgCO2-eq.',
  ghgEmissions2020: 'kgCO2-eq.',
  ghgEmissions2030: 'kgCO2-eq.',
  ghgEmissions2050: 'kgCO2-eq.',
  heatDemand: 'kWh',
  heatDemand2020: 'kWh',
  heatDemand2030: 'kWh',
  heatDemand2050: 'kWh',
  // todo: these should be moved to a more central location
  height: 'm',
  // deliveredEnergyBuildingAreaNorm: 'kWh',
  // finalEnergyBuildingAreaNorm: 'kWh',
  // area: 'm²',
  heatedFloorArea: 'm²',
  // heatedFloorAreaSum: 'm²',
  // primaryEnergyBuildingAreaNorm: 'kWh',
  // ghgEmissionsBuildingAreaNorm: 'kgCO2-eq.',
};

// if needs to be rounded
const rounding = {
  height: 1,
  heatedFloorArea: 0,
  deliveredEnergy: 0,
  deliveredEnergy2020: 0,
  deliveredEnergy2030: 0,
  deliveredEnergy2050: 0,
  primaryEnergy: 0,
  primaryEnergy2020: 0,
  primaryEnergy2030: 0,
  primaryEnergy2050: 0,
  finalEnergy: 0,
  finalEnergy2020: 0,
  finalEnergy2030: 0,
  finalEnergy2050: 0,
  ghgEmissions: 0,
  ghgEmissions2020: 0,
  ghgEmissions2030: 0,
  ghgEmissions2050: 0,
  heatDemand: 0,
  heatDemand2020: 0,
  heatDemand2030: 0,
  heatDemand2050: 0,
};

@customElement('dte-building-feature-energy-panel')
export class BuildingFeatureEnergyPanel extends MobxLitElement {
  static styles = css`
    :host td:first-child {
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
      <table>
        <tbody>
          ${properties.map(item => {
            const val = this.formatValue(this.properties, item.property);
            return html`<tr>
              <td>${item.label || 'fixme'}:</td>
              <td>${val || '-'} ${units[item.property] || ''}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
  }
}
