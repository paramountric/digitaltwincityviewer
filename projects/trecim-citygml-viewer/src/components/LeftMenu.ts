import { MobxLitElement } from '@adobe/lit-mobx';
import { css, html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@spectrum-web-components/sidenav/sp-sidenav.js';
import '@spectrum-web-components/sidenav/sp-sidenav-heading.js';
import '@spectrum-web-components/sidenav/sp-sidenav-item.js';
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import { Store } from '../store/Store';

@customElement('trecim-left-menu')
class LeftMenu extends MobxLitElement {
  static styles = css`
    :host {
      z-index: 3;
      position: absolute;
      background: #fff;
      opacity: 0.9;
      top: 60px;
      left: 10px;
      width: 240px;
      height: ${window.innerHeight - 60}px;
      overflow-x: hidden;
      overflow-y: auto;
    }
  `;

  @property({ type: Object })
  public store: Store;

  handleCloseMenu = () => {
    this.store.setShowLeftMenu(false);
  };

  render(): TemplateResult {
    const loadedData = this.store.getLoadedData();
    console.log(loadedData);
    const typesByContext = Object.values(this.store.entityTypes).reduce(
      (acc, e) => {
        acc[e.relationships.context] = acc[e.relationships.context] || [];
        acc[e.relationships.context].push(e);
        return acc;
      },
      {}
    );
    return html`<div>
      <sp-top-nav>
        <sp-top-nav-item placement="bottom-end">Loaded data</sp-top-nav-item>
        <sp-top-nav-item placement="bottom-end" @click=${this.handleCloseMenu}
          >x</sp-top-nav-item
        >
      </sp-top-nav>
      <sp-side-nav variant="multilevel">
        <sp-sidenav-heading label="City Objects"> </sp-sidenav-heading>
        <sp-sidenav-heading label="Types"
          >${Object.keys(typesByContext).map(contextKey => {
            const sorted = typesByContext[contextKey].sort((a, b) =>
              a.id.localeCompare(b.id)
            );
            return html`<sp-sidenav-item value=${contextKey} label=${contextKey}
              >${sorted.map(
                type => html`<sp-sidenav-item
                  value=${type.id}
                  label=${type.id}
                  @click=${() =>
                    this.store.showEntityType(
                      type.id,
                      !Boolean(this.store.entityTypeFilter.types[type.id])
                    )}
                ></sp-sidenav-item>`
              )}</sp-sidenav-item
            >`;
          })}</sp-sidenav-heading
        >
      </sp-side-nav>
    </div>`;
  }
}

export { LeftMenu };
