import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-show-one-layer.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-add-circle';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import { Store } from '../store/Store';

@customElement('dtcc-left-menu')
class LeftMenu extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      top: 60px;
      padding-left: 5px;
      width: 200px;
    }
  `;

  @property({ type: Object })
  public store: Store;

  openLayerDialog(layerName) {
    this.store.showUiComponent('layerDialog', true);
    if (layerName) {
      this.store.setActiveLayer(layerName);
    }
  }

  render(): TemplateResult {
    return html`<sp-menu selectable>
      ${this.store.layers.map(layer => {
        return html`<sp-menu-item
          @click=${() => this.openLayerDialog(layer.name)}
          ><sp-icon-show-one-layer slot="icon"></sp-icon-show-one-layer
          >${layer.name}${layer.isLoading
            ? html`<kbd slot="value"
                ><sp-progress-circle
                  label="Loading"
                  indeterminate
                  size="s"
                ></sp-progress-circle
              ></kbd>`
            : null}</sp-menu-item
        >`;
      })}
      <sp-menu-item @click=${this.openLayerDialog}
        ><sp-icon-add-circle slot="icon"></sp-icon-add-circle>Add
        layer</sp-menu-item
      >
    </sp-menu>`;
  }
}

export { LeftMenu };
