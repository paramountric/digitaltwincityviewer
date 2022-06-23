import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Store } from '../store/Store';

const displayProperties = [
  {
    properties: ['uuid', 'type', 'address', 'height', 'heatedFloorArea'],
  },
  {
    properties: [],
  },
];

const propertyLabels = {
  address: 'Address',
  uuid: 'UUID',
  type: 'Type',
  heatedFloorArea: 'Heated floor area',
  height: 'Height',
};

const units = {
  height: 'm',
  heatedFloorArea: 'm²',
};

// if needs to be rounded
const rounding = {
  height: 1,
  heatedFloorArea: 0,
};

@customElement('dte-building-feature-properties-panel')
export class BuildingFeaturePropertiesPanel extends MobxLitElement {
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
