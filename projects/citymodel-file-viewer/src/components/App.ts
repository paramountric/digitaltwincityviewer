import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { Store } from '../store/Store';
import '@spectrum-web-components/theme/theme-lightest.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/sp-theme.js';
import './Header';
import './LeftMenu';

@customElement('cmfv-app')
class App extends MobxLitElement {
  store = new Store();
  @state()
  viewer: Viewer;
  @state()
  isUpdated = false;

  @query('#viewport')
  _viewport;

  constructor() {
    super();
    this.store = new Store();
  }

  firstUpdated(): void {
    if (!this.viewer) {
      this._viewport.style.height = '100%';
      this._viewport.style.width = '100%';
      this._viewport.style.position = 'absolute';
      this.viewer = new Viewer({
        container: this._viewport,
      });
    }
  }

  render() {
    return html`<sp-theme theme="classic" color="lightest" scale="medium"
      ><cmfv-header .store=${this.store} .viewer=${this.viewer}></cmfv-header>
      <cmfv-left-menu
        .store=${this.store}
        .viewer=${this.viewer}
      ></cmfv-left-menu>
      <div id="viewport"></div
    ></sp-theme>`;
  }

  private incrementCount() {
    this.viewer.store.zoom = this.viewer.store.zoom + 1;
  }
}

export { App };
