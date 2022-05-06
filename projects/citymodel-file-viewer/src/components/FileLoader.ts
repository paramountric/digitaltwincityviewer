import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import '@spectrum-web-components/link/sp-link.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import '@spectrum-web-components/overlay/overlay-trigger.js';
import '@spectrum-web-components/dialog/sp-dialog-wrapper.js';
import '@spectrum-web-components/button/sp-button.js';
import { Store } from '../store/Store';

@customElement('cmfv-file-loader')
class CmfvFileLoader extends MobxLitElement {
  static styles = css``;

  @property({ type: Object })
  public store: Store;

  @property({ type: Object })
  public viewer: Viewer;

  open() {
    const dialogWrapper = this.renderRoot.querySelector('sp-dialog-wrapper');
    function handleEvent({ type }) {
      console.log(type);
      dialogWrapper.open = false;
      dialogWrapper.removeEventListener('cancel', handleEvent);
    }
    dialogWrapper.addEventListener('cancel', handleEvent);
  }

  loadExampleFile(e: Event) {
    const fileIndex = (e.target as Element).getAttribute('key');
    this.store.loadExampleFile(Number(fileIndex));
  }

  loadFile(e: Event) {
    console.log(e);
  }

  render(): TemplateResult {
    const fileLinks = this.store.exampleFiles.map((file, i) => {
      return html`<div>
        <sp-button
          key=${i}
          quiet
          variant="secondary"
          @click="${this.loadExampleFile}"
          >${file.text}</sp-button
        >
      </div>`;
    });
    return html`<overlay-trigger type="modal" placement="none">
      <sp-dialog-wrapper
        underlay
        slot="click-content"
        headline="Load file"
        mode="fullscreen"
        cancel-label="Cancel"
        style="position: relative"
      >
        <div
          style="margin:0;left:50%;position:absolute;top:50%;transform:top(-50%) left(-50%)"
        >
          <label for="file-input">
            <div>
              <sp-button size="l" quiet variant="secondary"
                >Select file</sp-button
              >
            </div>
          </label>
          <input
            @change=${this.loadFile}
            type="file"
            id="file-input"
            style="display: none"
          />

          <div style="margin-top:50px">or select example:</div>
          <div>${fileLinks}</div>
        </div>
      </sp-dialog-wrapper>
      <sp-top-nav-item
        slot="trigger"
        variant="primary"
        onclick="this.getRootNode().host.open()"
      >
        Load file
      </sp-top-nav-item>
    </overlay-trigger>`;
  }

  click() {
    this.store.increment();
  }
}

export { CmfvFileLoader };
