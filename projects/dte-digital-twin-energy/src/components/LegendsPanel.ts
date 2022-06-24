import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { observable } from 'mobx';
import { customElement, property } from 'lit/decorators.js';
import { Store } from '../store/Store';
import { getColorFromScale, getScaleRanges } from '../lib/colorScales';

const units = {};

@customElement('dte-legends-panel')
export class LegendsPanel extends MobxLitElement {
  // complete mess, but how to style css dynamically in lit element WITHOUT changing the previous set values (in a list) <- it did not work to apply it in-line is style attribute
  // todo: at least iterate through a range to create the colorbox classes
  static styles = css`
    :host {
      z-index: 10;
      position: absolute;
      background: #fff;
      opacity: 1;
      bottom: 300px;
      right: 5px;
      opacity: 0.95;
      width: 200px;
    }

    :host .colorbox-1 {
      padding: 10px;
      background-color: var(--scale-color-1);
    }

    :host .colorbox-2 {
      padding: 10px;
      background-color: var(--scale-color-2);
    }

    :host .colorbox-3 {
      padding: 10px;
      background-color: var(--scale-color-3);
    }

    :host .colorbox-4 {
      padding: 10px;
      background-color: var(--scale-color-4);
    }

    :host .colorbox-5 {
      padding: 10px;
      background-color: var(--scale-color-5);
    }

    :host .colorbox-6 {
      padding: 10px;
      background-color: var(--scale-color-6);
    }

    :host .colorbox-7 {
      padding: 10px;
      background-color: var(--scale-color-7);
    }
  `;

  @property({ type: Object })
  public store: Store;

  render() {
    const selectedProperty = this.store.selectedPropertyKey;
    const isGhg = selectedProperty === 'ghgEmissions';
    const scaleKey = isGhg ? 'buildingGhg' : 'energyDeclaration';

    const scaleRanges = getScaleRanges(scaleKey);
    return html`<div">
      <table>
        <thead>
          <tr>
            <td colspan="2">${this.store.getSelectedPropertyLabel()} (${this.store.getSelectedPropertyUnit()})</td>
          </tr>
        </thead>
        <tbody>
          ${scaleRanges.map((range, i) => {
            this.style.setProperty(
              `--scale-color-${i + 1}`,
              getColorFromScale(range[0] + 1, scaleKey)
            );

            return html`<tr>
              <td class="colorbox-${i + 1}"></td>
              <td>
                ${range[1] === '>'
                  ? `${range[1]} ${range[0]}`
                  : `${range[0]} - ${range[1]}`}
              </td>
            </tr>`;
          })}
        </tbody>
      </table>
    </div>`;
  }
}
