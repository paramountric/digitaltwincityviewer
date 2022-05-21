import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Store } from '../store/Store';

@customElement('dte-bottom-display')
class BottomDisplay extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      opacity: 0.7;
      height: 20vh;
      bottom: 0px;
      padding-left: 5px;
      width: 100%;
    }
  `;

  @property({ type: Object })
  public store: Store;

  render(): TemplateResult {
    console.log(this.store.timelineData.total);
    return html`<div>Bottom</div>`;
  }
}

export { BottomDisplay };
