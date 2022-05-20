import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Viewer } from '@dtcv/viewer';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import '@spectrum-web-components/progress-bar/sp-progress-bar.js';
import './FileLoader';
import { Store } from '../store/Store';

const logo = require('../assets/logo.png');

@customElement('trecim-header')
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
    #loader {
      width: var(--spectrum-global-dimension-size-3000);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
    }
  `;
  @property()
  isUpdated: boolean;

  @property({ type: Object })
  public store: Store;

  render(): TemplateResult {
    return html`<sp-top-nav>
        <img id="logo" src="${logo}" alt="DTCV Logo" />
        <div id="app-name">3CIM</div>
        <sp-top-nav-item
          ><trecim-file-loader .store=${this.store}></trecim-file-loader
        ></sp-top-nav-item>
      </sp-top-nav>
      ${this.store.isLoading
        ? html`<div id="loader">
            <sp-progress-bar
              aria-label="Loading"
              size="s"
              label=${this.store.loadingMessage}
              progress=${ifDefined(this.store.loadingProgress)}
              indeterminate=${ifDefined(
                this.store.loadingProgress ? undefined : true
              )}
            ></sp-progress-bar>
          </div>`
        : null}`;
  }
}

export { Header };
