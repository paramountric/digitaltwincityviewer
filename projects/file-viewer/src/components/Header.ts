import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import './FileLoader';
import { Store } from '../store/Store';

const logo = require('../assets/logo.png');

@customElement('fv-header')
class Header extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      width: 100%;
    }
    #app-name {
      font-weight: bolder;
      color: #666;
      font-size: 18px;
      margin-left: 10px;
    }
    #logo {
      max-height: 50px;
      margin-left: 20px;
    }
  `;
  @property()
  isUpdated: boolean;

  @property({ type: Object })
  public store: Store;

  render(): TemplateResult {
    return html`<sp-top-nav>
      <img id="logo" src="${logo}" alt="DTCV Logo" />
      <div id="app-name">Files</div>
      <sp-top-nav-item
        ><fv-file-loader .store=${this.store}></fv-file-loader
      ></sp-top-nav-item>
    </sp-top-nav>`;
  }
}

export { Header };
