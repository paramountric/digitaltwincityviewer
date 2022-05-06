import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import { Store } from '../store/Store';

const displayProperties = [
  {
    properties: [
      'height',
      'elevation',
      'groundHeight',
      'shpFileId',
      'type',
      'uuid',
    ],
  },
];

// all properties in the properties object will be shown, labels are taken from here
const propertyLabels = {
  height: 'Height',
  elevation: 'Elevation',
  groundHeight: 'Ground height',
  shpFileId: 'Shapefile ID',
  type: 'Type',
  uuid: 'UUID',
};

// these are the units, but could be done with enum instead
const units = {
  height: 'm',
  elevation: 'm',
  groundHeight: 'm',
};

// if needs to be rounded
const rounding = {
  height: 2,
  elevation: 2,
  groundHeight: 2,
};

@customElement('cmfv-right-menu')
class CmfvRightMenu extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      opacity: 0.7;
      height: 100vh;
      top: 60px;
      right: 0;
      padding-right: 5px;
      width: 200px;
    }
  `;

  @property({ type: Object })
  public store: Store;

  handleCloseMenu = () => {
    this.store.viewer.setSelectedObject(null);
  };

  getFeatureName(object) {
    return `Selected object`;
  }

  formatValue(object, property) {
    let val = object.properties[property];
    // special cases
    // if this property is undefined its must be a building
    if (property === 'heatedFloorAreaCount' && val === undefined) {
      val = 1;
    }
    if (val && (rounding[property] || rounding[property] === 0)) {
      val = val.toFixed(rounding[property]);
    }
    return val;
  }

  render(): TemplateResult {
    const selectedObject = this.store.viewer.selectedObject;
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
        <thead>
          <tr>
            <th colspan="2">Properties</th>
          </tr>
        </thead>
        <tbody>
          ${properties.map(item => {
            const val = this.formatValue(selectedObject, item.property);
            return html`<tr key=${item.property}>
              <td>${item.label}:</td>
              <td>${val || '-'} ${units[item.property] || ''}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
  }
}

export { CmfvRightMenu };
