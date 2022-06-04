import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import '@spectrum-web-components/accordion/sp-accordion.js';
import '@spectrum-web-components/accordion/sp-accordion-item.js';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import { Store } from '../store/Store';

const displayProperties = [
  {
    properties: ['cityObjectId', 'geometryId', 'lod', 'type'],
  },
];

// all properties in the properties object will be shown, labels are taken from here
const propertyLabels = {
  geometryId: 'Geometry ID',
  type: 'Type',
  lod: 'Level of Detail',
  cityObjectId: 'City Object ID',
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

@customElement('trecim-right-menu')
class RightMenu extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      opacity: 1;
      top: 60px;
      right: 0;
      padding-right: 5px;
      width: 20%;
    }
    :host sp-accordion {
      display: flex;
      flex-direction: row;
      /* flex-grow: 2; */
      justify-content: space-between;
      overflow: hidden;
    }
    :host sp-top-nav {
      padding-left: 10px;
    }
    :host span:first-child {
      font-weight: bolder;
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
    if (!selectedObject) {
      return;
    }
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
    <sp-top-nav>
      <sp-top-nav-item placement="bottom-end">Selected Object</sp-top-nav-item>
      <sp-top-nav-item placement="bottom-end" @click=${
        this.handleCloseMenu
      }>x</sp-top-nav-item>
    </sp-top-nav>
    <sp-accordion>
    <sp-accordion-item open label="Properties">
          ${properties.map(item => {
            const val = this.formatValue(selectedObject, item.property);
            return html`<div key=${item.property}>
              <span>${item.label}:</span>
              <span>${val || '-'} ${units[item.property] || ''}</span>
            </div>`;
          })}
    </sp-accordion>
    </div>`;
  }
}

export { RightMenu };
