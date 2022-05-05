import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { Store } from '../store/Store';
import '@spectrum-web-components/styles/all-medium-darkest.css';
import './Header';

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
    return html`<cmfv-header
        .store=${this.store}
        .viewer=${this.viewer}
      ></cmfv-header>
      <div id="viewport"></div>`;
  }

  private incrementCount() {
    this.viewer.store.zoom = this.viewer.store.zoom + 1;
  }
}

export { App };
