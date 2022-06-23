import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Store } from '../store/Store';
import './BuildingFeatureEnergyPanel';

@customElement('dte-right-menu')
class RightMenu extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      opacity: 0.7;
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

  render(): TemplateResult {
    const selectedObject = this.store.viewer.selectedObject;
    if (!selectedObject) {
      return;
    }

    const properties = Object.assign({}, selectedObject.properties || {});

    return html`<div>
    <sp-top-nav>
      <sp-top-nav-item placement="bottom-end">Selected Object</sp-top-nav-item>
      <sp-top-nav-item placement="bottom-end" @click=${this.handleCloseMenu}>x</sp-top-nav-item>
    </sp-top-nav>
    <sp-accordion>
    <sp-accordion-item open label="Properties">
    <dte-building-feature-energy-panel .properties=${properties} />
    </sp-accordion>
    </div>`;
  }
}

export { RightMenu };
