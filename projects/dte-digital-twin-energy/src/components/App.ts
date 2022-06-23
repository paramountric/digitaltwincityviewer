import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import '@spectrum-web-components/theme/theme-lightest.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-group.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/menu/sp-menu-divider.js';
import '@spectrum-web-components/accordion/sp-accordion.js';
import '@spectrum-web-components/accordion/sp-accordion-item.js';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/action-menu/sp-action-menu.js';
import { Store } from '../store/Store';
import './Header';
import './LeftMenu';
import './RightMenu';
import './BottomPanel';
import './LegendsPanel';
import './ActionPanel';

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
      ? html`<dte-bottom-panel
          .timelineData=${this.store.timelineData}
          .showTimeLinePerM2=${this.store.showTimelinePerM2}
        ></dte-bottom-panel>`
      : null;
    const legendsPanel = this.store
      ? html`<dte-legends-panel .store=${this.store}></dte-legends-panel>`
      : null;
    const actionPanel = this.store
      ? html`<dte-action-panel .store=${this.store}></dte-action-panel>`
      : null;

    return html` <sp-theme theme="classic" color="lightest" scale="medium">
      ${header} ${actionPanel} ${leftMenu}
      <div id="viewport"></div>
      ${legendsPanel} ${rightMenu} ${bottomDisplay}
    </sp-theme>`;
  }
}

export { App };
