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
import './RightMenu';
import './BottomDisplay';

@customElement('dte-app')
class App extends MobxLitElement {
  @state()
  store: Store;

  @query('#viewport')
  _viewport;

  constructor() {
    super();
  }

  firstUpdated(): void {
    if (!this.store) {
      this._viewport.style.height = '100%';
      this._viewport.style.width = '100%';
      this._viewport.style.position = 'absolute';
      const viewer = new Viewer({
        container: this._viewport,
      });
      this.store = new Store(viewer);
    }
  }

  render() {
    const header = this.store
      ? html`<dte-header .store=${this.store}></dte-header>`
      : html`<div></div>`;
    const leftMenu = this.store?.showLeftMenu
      ? html`<dte-left-menu .store=${this.store}></dte-left-menu>`
      : '';
    const rightMenu = this.store?.viewer?.selectedObject
      ? html`<dte-right-menu .store=${this.store}></dte-right-menu>`
      : null;
    const bottomDisplay = this.store
      ? html`<dte-bottom-display .store=${this.store}></dte-bottom-display>`
      : null;

    return html` <sp-theme theme="classic" color="lightest" scale="medium">
      ${header} ${leftMenu}
      <div id="viewport"></div>
      ${rightMenu} ${bottomDisplay}
    </sp-theme>`;
  }
}

export { App };
