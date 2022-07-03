import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@spectrum-web-components/link/sp-link.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/tabs/sp-tabs.js';
import '@spectrum-web-components/tabs/sp-tab.js';
import '@spectrum-web-components/tabs/sp-tab-panel.js';
import '@spectrum-web-components/overlay/overlay-trigger.js';
import '@spectrum-web-components/dialog/sp-dialog-wrapper.js';
import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import '@spectrum-web-components/progress-bar/sp-progress-bar.js';
import '@spectrum-web-components/icons/sp-icons-medium.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-show-one-layer.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-show-all-layers.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-merge-layers.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-rect-select.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-add-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-settings.js';
import '@spectrum-web-components/status-light/sp-status-light.js';
import { Store } from '../store/Store';

@customElement('dtcc-layer-dialog')
class LayerPanel extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 20;
    }

    #progress-header {
      width: 250px;
      text-align: center;
    }

    #status-bar {
      width: 500px;
      text-align: center;
    }

    #status-list {
      border-radius: 3px;
      margin: 20px;
      padding: 20px;
      width: 500px;
      height: 400px;
      font-family: monospace;
      background: #333;
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

  setActiveLayer(layerName: string) {
    this.store.setActiveLayer(layerName);
  }

  selectArea() {
    console.log('sel');
    this.store.selectArea();
  }

  simulate() {
    this.store.simulate();
  }

  render(): TemplateResult {
    if (!this.store) {
      return null;
    }
    const layerList = html`<sp-menu selectable>
      ${this.store.layers.map(layer => {
        return html`<sp-menu-item
          @click=${() => this.setActiveLayer(layer.name)}
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
    </sp-menu>`;
    // for testing the loading functionality
    const { status, task, progress } =
      this.store.layers.find(l => l.name === 'Buildings') || {};

    const statusBar = task
      ? html`<sp-progress-bar
          size="l"
          label=${status}
          progress=${progress}
        ></sp-progress-bar>`
      : null;

    const progressHeader = task
      ? html`<sp-menu-item
          >${task}<kbd slot="value"
            ><sp-progress-circle
              indeterminate
              size="s"
            ></sp-progress-circle></kbd
        ></sp-menu-item>`
      : null;

    const getStatusVariant = statusCode => {
      if (statusCode === 1) {
        return 'positive';
      }
      if (statusCode === -1) {
        return 'negative';
      }
      return 'neutral';
    };
    const statusList = task
      ? this.store.progressList.map(
          p =>
            html`<sp-status-light
              style="color:#fff"
              size="m"
              variant=${getStatusVariant(p.statusCode)}
              >${p.status}</sp-status-light
            >`
        )
      : null;

    console.log(status, task, progress);

    return html`<sp-dialog-wrapper
        ?open=${this.store.showUiComponents.layerDialog}
        dismissable
        underlay
        slot="click-content"
        headline="Layers"
        mode="fullscreen"
        cancel-label="Cancel"
        @cancel=${this.close}
        style="position: relative; z-index: 99"
      >
        <sp-icons-medium></sp-icons-medium>
        <sp-tabs
          selected=${this.store.activeLayerDialogTab || 'layers'}
          size="l"
        >
          <sp-tab label="Select area" value="select-area"
            ><sp-icon-rect-select slot="icon"></sp-icon-rect-select
          ></sp-tab>
          <sp-tab label="Layers" value="layers"
            ><sp-icon-show-all-layers slot="icon"></sp-icon-show-all-layers
          ></sp-tab>

          <sp-tab label="Simulation layer" value="add-layer"
            ><sp-icon-merge-layers slot="icon"></sp-icon-merge-layers
          ></sp-tab>
          <sp-tab label="Settings" value="settings"
            ><sp-icon-settings slot="icon"></sp-icon-settings
          ></sp-tab>
          <sp-tab-panel style="flex-direction: column" value="select-area">
            <div style="width: 250px">
              <sp-button quiet variant="secondary" @click=${this.selectArea}>
                Run task
              </sp-button>
            </div>
            <div style="margin: auto">
              <div id="progress-header">${progressHeader}</div>
              ${task ? html`<div id="status-list">${statusList}</div>` : null}
              <div id="status-bar">${statusBar}</div>
            </div>
          </sp-tab-panel>
          <sp-tab-panel value="layers">${layerList}</sp-tab-panel>
          <sp-tab-panel value="add-layer"
            >Todo: some input fields to add layer. Show catalogues with lists to
            pick layers. Load metadata, check if layer is in bounds. Search
            function.</sp-tab-panel
          >
          <sp-tab-panel value="settings"
            >Add general layer settings here</sp-tab-panel
          >
        </sp-tabs>
      </sp-dialog-wrapper>
      <sp-top-nav-item slot="trigger" variant="primary" @click="${this.open}">
        Layers
      </sp-top-nav-item>`;
  }
}

export { LayerPanel };
