import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Viewer } from '@dtcv/viewer';
import { cities } from '@dtcv/cities';
import { Store } from '../store/Store';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@customElement('cmfv-file-loader')
class CmfvFileLoader extends MobxLitElement {
  static styles = css``;
  private exampleFiles = [
    // {
    //   url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/Helsingborg2021.json',
    //   fileType: 'json',
    //   text: 'Helsingborg',
    // },
    {
      url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-citymodel-june-2022.pb',
      fileType: 'protobuf',
      pbType: 'CityModel',
      text: 'Helsingborg',
      cityId: 'helsingborg',
    },
    {
      url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/helsingborg-groundsurface-june-2022.pb',
      fileType: 'protobuf',
      pbType: 'Surface3D',
      text: 'Helsingborg ground surface',
      cityId: 'helsingborg',
    },
  ];

  @property({ type: Object })
  public store: Store;

  private dialogWrapper: HTMLElement;

  open() {
    this.dialogWrapper = this.renderRoot.querySelector('sp-dialog-wrapper');
    this.dialogWrapper.addEventListener('cancel', this.close.bind(this));
  }

  close() {
    if (this.dialogWrapper) {
      this.dialogWrapper.removeAttribute('open');
      delete this.dialogWrapper;
    }
  }

  async loadExampleFile(e: Event) {
    const fileIndex = (e.target as Element).getAttribute('key');
    const { url, fileType, pbType, cityId } = this.exampleFiles[fileIndex];
    const city = cities.find((c: any) => c.id === cityId);
    if (!city || !city.x) {
      throw new Error('City must be selected on app level');
    }
    console.log('selected city: ', city);
    this.store.setCity(city);
    this.store.setIsLoading(true);
    const response = await fetch(url);
    switch (fileType) {
      case 'protobuf':
        const pbData = new Uint8Array(await response.arrayBuffer());
        this.store.addPbData(pbData, pbType, city);
        break;
      case 'json':
        const json = await response.json();
      //this.store.addFileData(json, url);
      default:
        console.warn('example files should be explicit');
    }
    this.store.setIsLoading(false);
    this.store.render();
    this.close();
  }

  loadFile(e?: HTMLInputEvent) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      // const json = JSON.parse(reader.result as string);
      // this.store.addFileData(json, file.name);
    };
    reader.onloadstart = p => {
      this.store.reset();
      this.store.setIsLoading(true);
    };
    reader.onloadend = p => {
      this.store.setIsLoading(false);
      this.store.setIsLoading(false);
      this.store.render();
      this.close();
    };
    reader.readAsText(file);
  }

  render(): TemplateResult {
    const fileLinks = this.exampleFiles.map((file, i) => {
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
