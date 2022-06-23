import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-task-list';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-calendar';
import { Store, SelectablePropertyKey } from '../store/Store';

@customElement('dte-action-panel')
export class ActionPanel extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 10;
      position: absolute;
      background: #fff;
      opacity: 1;
      bottom: 300px;
      left: 50%;
      top: 100px;
      transform: translate(-50%, -50%);
      height: 80px;
    }
  `;

  @property({ type: Object })
  public store: Store;

  selectIndicator(key: string) {
    this.store.selectedPropertyKey = key as SelectablePropertyKey;
    this.store.updateBuildingColors();
  }

  selectYear(key: string) {
    this.store.selectedYear = key;
    this.store.updateBuildingColors();
  }

  render() {
    return html`<sp-action-group>
      <sp-action-menu size="m">
        <sp-icon-settings slot="icon"
          ><sp-icon-task-list style="padding-top:5px"></sp-icon-task-list
        ></sp-icon-settings>
        <span slot="label">${this.store.getSelectedPropertyLabel()}</span>
        ${this.store.propertyKeyOptions.map(
          setting =>
            html`<sp-menu-item @click=${() => this.selectIndicator(setting.key)}
              >${setting.label}</sp-menu-item
            >`
        )}
      </sp-action-menu>
      <sp-action-menu size="m">
        <sp-icon-settings slot="icon"
          ><sp-icon-calendar ="padding-top:5px"></sp-icon-calendar
        ></sp-icon-settings>
        <span slot="label">${this.store.selectedYear}</span>
        ${this.store.yearOptions.map(
          option =>
            html`<sp-menu-item @click=${() => this.selectYear(option)}
              >${option}</sp-menu-item
            >`
        )}
      </sp-action-menu></sp-action-group
    >`;
  }
}
