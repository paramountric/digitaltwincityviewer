import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@spectrum-web-components/link/sp-link.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/overlay/overlay-trigger.js';
import '@spectrum-web-components/dialog/sp-dialog-wrapper.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/icons/sp-icons-medium.js';
import '@spectrum-web-components/status-light/sp-status-light.js';
import { Log, Store } from '../store/Store';

@customElement('dtcc-notification-dialog')
class NotificationDialog extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 30;
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
    this.store.showUiComponent('notificationDialog', false);
  }

  setActiveLayer(layerName: string) {
    this.store.setActiveLayer(layerName);
  }

  generateCityModel() {
    this.store.generateCityModel();
  }

  cancelTask() {
    // cancel the task
    this.store.cancelCurrentTask();
  }

  simulate() {
    this.store.simulate();
  }

  render(): TemplateResult {
    if (!this.store) {
      return null;
    }

    return html`<sp-dialog-wrapper
      ?open=${this.store.showUiComponents.notificationDialog}
      dismissable
      underlay
      slot="click-content"
      headline="Notification"
      @cancel=${this.close}
      style="position: relative; z-index: 99"
    >
      <sp-icons-medium></sp-icons-medium>
      <p>${this.store.notificationMessage}</p>
    </sp-dialog-wrapper> `;
  }
}

export { NotificationDialog };
