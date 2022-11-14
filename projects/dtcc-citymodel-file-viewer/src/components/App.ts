import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { Store } from '../store/Store';
import '@spectrum-web-components/theme/theme-lightest.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/link/sp-link.js';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import '@spectrum-web-components/overlay/overlay-trigger.js';
import '@spectrum-web-components/dialog/sp-dialog-wrapper.js';
//import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/accordion/sp-accordion.js';
import '@spectrum-web-components/accordion/sp-accordion-item.js';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-show-one-layer.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-add-circle';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-visibility';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-visibility-off';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import './Header';
import './LeftMenu';
import './RightMenu';

@customElement('cmfv-app')
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
      const viewer = new Viewer(
        {
          container: this._viewport,
        },
        {
          longitude: 0,
          latitude: 0,
          zoom: 14,
          minZoom: 10,
          maxZoom: 18,
          pitch: 60,
        }
      );
      this.store = new Store(viewer);
    }
  }

  render() {
    const header = this.store
      ? html`<cmfv-header .store=${this.store}></cmfv-header>`
      : html`<div></div>`;
    const leftMenu = this.store?.showUiComponents.leftMenu
      ? html`<cmfv-left-menu .store=${this.store}></cmfv-left-menu>`
      : '';
    const rightMenu = this.store?.viewer?.selectedObject
      ? html`<cmfv-right-menu .store=${this.store}></cmfv-right-menu>`
      : null;

    return html` <sp-theme theme="classic" color="lightest" scale="medium">
      ${header} ${leftMenu}
      <div id="viewport"></div>
      ${rightMenu}
    </sp-theme>`;
  }
}

export { App };
