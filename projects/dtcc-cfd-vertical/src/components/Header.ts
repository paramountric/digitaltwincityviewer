import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import { Store } from '../store/Store';

const logo = require('../assets/dtcc-logo.png');

@customElement('dtcc-header')
class DtccHeader extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      width: 100%;
    }
    #logo {
      max-height: 50px;
    }
  `;
  @property()
  isUpdated: boolean;

  @property({ type: Object })
  public store: Store;

  render(): TemplateResult {
    return html`<sp-top-nav>
      <img id="logo" src="${logo}" alt="DTCC Logo" />
    </sp-top-nav>`;
  }
}

export { DtccHeader };
