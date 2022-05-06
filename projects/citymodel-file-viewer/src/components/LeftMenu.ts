import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import { Store } from '../store/Store';

@customElement('cmfv-left-menu')
class CmfvLeftMenu extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      opacity: 0.7;
      height: 100vh;
      top: 60px;
      padding-left: 5px;
      width: 200px;
    }
  `;
  @property()
  isUpdated: boolean;

  public store: Store;

  @property({ type: Object })
  public viewer: Viewer;

  render(): TemplateResult {
    return html`<div>Sidebar</div>`;
  }

  click() {
    this.store.increment();
  }
}

export { CmfvLeftMenu };
