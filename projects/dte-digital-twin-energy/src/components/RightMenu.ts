import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Store } from '../store/Store';
import './BuildingFeaturePropertiesPanel';
import './BuildingFeatureEnergyPanel';

@customElement('dte-right-menu')
class RightMenu extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      font-size: 12px;
      position: absolute;
      background: #fff;
      opacity: 0.95;
      top: 60px;
      right: 0;
      padding-right: 5px;
      width: 20%;
      overflow: auto;
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

  getFeatureName(object) {
    return (
      object.properties.name ||
      object.properties.address ||
      `Feature ${object.id}`
    );
  }

  handleCloseMenu = () => {
    this.store.viewer.setSelectedObject(null);
  };

  render(): TemplateResult {
    const selectedObject = this.store.viewer.selectedObject;
    if (!selectedObject) {
      return;
    }

    const properties = Object.assign({}, selectedObject.properties || {});

    return html`<div>
      <sp-top-nav>
        <sp-top-nav-item placement="bottom-end"
          >${this.getFeatureName(selectedObject)}</sp-top-nav-item
        >
        <sp-top-nav-item placement="bottom-end" @click=${this.handleCloseMenu}
          >x</sp-top-nav-item
        >
      </sp-top-nav>
      <sp-accordion allow-multiple>
        <sp-accordion-item open label="Properties">
          <dte-building-feature-properties-panel .properties=${properties} />
        </sp-accordion-item>
        <sp-accordion-item open label="Simulation">
          <dte-building-feature-energy-panel .properties=${properties} />
        </sp-accordion-item>
      </sp-accordion>
    </div>`;
  }
}

export { RightMenu };
