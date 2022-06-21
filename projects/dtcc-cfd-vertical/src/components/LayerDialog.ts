import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@spectrum-web-components/link/sp-link.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import '@spectrum-web-components/overlay/overlay-trigger.js';
import '@spectrum-web-components/dialog/sp-dialog-wrapper.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import { Store } from '../store/Store';

@customElement('dtcc-layer-dialog')
class LayerPanel extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 20;
    }
  `;

  @property({ type: Object })
  public store: Store;

  private dialogWrapper: HTMLElement;

  open() {
    this.dialogWrapper = this.renderRoot.querySelector('sp-dialog-wrapper');
    this.dialogWrapper.addEventListener('cancel', this.close.bind(this));
  }

  close() {
    this.store.showUiComponent('layerDialog', false);
  }

  render(): TemplateResult {
    return html`<sp-dialog-wrapper
        open
        dismissable
        underlay
        slot="click-content"
        headline="Layers"
        mode="fullscreen"
        cancel-label="Cancel"
        @cancel=${this.close}
        style="position: relative; z-index: 99"
      >
        <div
          style="margin:0;left:50%;position:absolute;top:50%;transform:top(-50%) left(-50%)"
        >
          Dialog content
        </div>
      </sp-dialog-wrapper>
      <sp-top-nav-item slot="trigger" variant="primary" @click="${this.open}">
        Layers
      </sp-top-nav-item>`;
  }
}

export { LayerPanel };
