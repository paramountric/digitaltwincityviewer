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
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';
import { Store } from '../store/Store';

@customElement('cmfv-file-loader')
class CmfvFileLoader extends MobxLitElement {
  static styles = css``;

  @property({ type: Object })
  public store: Store;

  @property({ type: Object })
  public viewer: Viewer;

  private dialogWrapper: HTMLElement;

  open() {
    this.dialogWrapper = this.renderRoot.querySelector('sp-dialog-wrapper');
    this.dialogWrapper.addEventListener('cancel', this.close.bind(this));
  }

  close() {
    this.dialogWrapper.removeAttribute('open');
    delete this.dialogWrapper;
  }

  async loadExampleFile(e: Event) {
    const fileIndex = (e.target as Element).getAttribute('key');
    await this.store.loadExampleFile(Number(fileIndex));
    const dialogWrapper = this.renderRoot.querySelector('sp-dialog-wrapper');
    this.close();
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
    const dialogContent = this.store.isLoading
      ? html`<sp-progress-circle
          label="A large representation of an unclear amount of work"
          indeterminate
          size="l"
        ></sp-progress-circle>`
      : html`<label for="file-input">
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
          <div>${fileLinks}</div>`;
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
          ${dialogContent}
        </div>
      </sp-dialog-wrapper>
      <sp-top-nav-item slot="trigger" variant="primary" @click="${this.open}">
        Load file
      </sp-top-nav-item>
    </overlay-trigger>`;
  }
}

export { CmfvFileLoader };
