import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { Store } from '../store/Store';
import '@spectrum-web-components/theme/theme-lightest.js';
import '@spectrum-web-components/theme/scale-medium.js';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/switch/sp-switch.js';
import './Header';
import './LeftMenu';
import './RightMenu';

@customElement('trecim-app')
class App extends MobxLitElement {
  static styles = css`
    :host {
      overflow: hidden;
      padding: 0;
      margin: 0;
    }
    #show-menu-btn {
      z-index: 13;
      position: absolute;
      background: #fff;
      opacity: 0.7;
      top: 70px;
      cursor: pointer;
      left: 10px;
      border: 1px solid #ddd;
      color: #666;
      padding: 3px;
      border-radius: 3px;
    }
    #show-menu-btn:hover {
      border-color: #aaa;
    }
    #graph-switch {
      position: absolute;
      top: 10px;
      left: 300px;
      z-index: 13;
    }
  `;

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

  showLeftMenu() {
    this.store.setShowLeftMenu(true);
  }

  toggleGraphSwitch() {
    // first set the new state
    this.store.viewer.setActiveView(
      this.store.viewer.viewStore.activeView === 'map' ? 'graph' : 'map'
    );
    // then update according to new state
    const { activeView } = this.store.viewer.viewStore;
    // hide the graph if switching to map
    this.store.viewer.viewStore.setShowGraphView(activeView === 'graph');
    this.store.viewer.setLayerProps('graph-layer', {
      visible: activeView === 'graph',
    });
    this.store.viewer.render();
  }

  render() {
    const header = this.store
      ? html`<trecim-header .store=${this.store}></trecim-header>`
      : html`<div></div>`;
    const leftMenu = this.store?.isLoading
      ? null
      : this.store?.showLeftMenu
      ? html`<trecim-left-menu .store=${this.store}></trecim-left-menu>`
      : html`<div id="show-menu-btn" @click=${this.showLeftMenu}>
          Loaded data
        </div>`;
    const rightMenu = this.store?.viewer?.selectedObject
      ? html`<trecim-right-menu .store=${this.store}></trecim-right-menu>`
      : null;

    const layerSwitch =
      Object.keys(this.store?.entityTypes || {}).length > 0
        ? html`<sp-switch
            id="graph-switch"
            label="Graph"
            ?checked=${this.store.viewer.viewStore.activeView === 'graph'}
            @click=${this.toggleGraphSwitch}
          >
            Map/Graph
          </sp-switch>`
        : null;

    return html` <sp-theme theme="classic" color="lightest" scale="medium">
      ${header} ${leftMenu} ${layerSwitch}
      <div style="overflow:hidden" id="viewport"></div>
      ${rightMenu}
    </sp-theme>`;
  }
}

export { App };
