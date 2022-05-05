import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import { Store } from '../store/Store';

const logo = require('../assets/dtcc-logo.png');

@customElement('cmfv-header')
class CmfvHeader extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
    }
    #logo {
      max-height: 50px;
    }
  `;
  @property()
  isUpdated: boolean;

  public store: Store;

  @property({ type: Object })
  public viewer: Viewer;

  render(): TemplateResult {
    return html`<sp-top-nav>
      <img id="logo" src="${logo}" alt="DTCC Logo" />
      <sp-top-nav-item href="#">City Model File Viewer</sp-top-nav-item>
      <sp-top-nav-item href="#page-1">Load file</sp-top-nav-item>
    </sp-top-nav>`;
  }

  click() {
    this.store.increment();
  }
}

export { CmfvHeader };
