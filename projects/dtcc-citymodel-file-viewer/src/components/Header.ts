import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import './FileLoader';
import { Store } from '../store/Store';

const logo = require('../assets/dtcc-logo.png');

@customElement('cmfv-header')
class CmfvHeader extends MobxLitElement {
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
      <sp-top-nav-item
        ><cmfv-file-loader .store=${this.store}></cmfv-file-loader
      ></sp-top-nav-item>
    </sp-top-nav>`;
  }
}

export { CmfvHeader };
