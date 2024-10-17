// This code is derived from Deck.gl. Copyright MIT, 2020 Urban Computing Foundation
// Here Maplibre is used.
// https://github.com/visgl/deck.gl/tree/master/modules/mapbox/src
import {
  getDeckInstance,
  addLayer,
  removeLayer,
  updateLayer,
  drawLayer,
} from './maplibre-deck-utils';
import type { Map, CustomLayerInterface } from 'maplibre-gl';
import type { Deck, Layer } from '@deck.gl/core/typed';

export type MapboxLayerProps<LayerT extends Layer> = Partial<
  LayerT['props']
> & {
  id: string;
  renderingMode?: '2d' | '3d';
  deck?: Deck;
};

export default class MaplibreLayer<LayerT extends Layer>
  implements CustomLayerInterface
{
  id: string;
  type: 'custom';
  renderingMode: '2d' | '3d';
  map: Map | null;
  deck: Deck | null;
  props: MapboxLayerProps<LayerT>;

  /* eslint-disable no-this-before-super */
  constructor(props: MapboxLayerProps<LayerT>) {
    if (!props.id) {
      throw new Error('Layer must have an unique id');
    }

    this.id = props.id;
    this.type = 'custom';
    this.renderingMode = props.renderingMode || '3d';
    this.map = null;
    this.deck = null;
    this.props = props;
  }

  /* Mapbox custom layer methods */

  onAdd(map: Map, gl: WebGLRenderingContext): void {
    this.map = map;
    this.deck = getDeckInstance({ map, gl, deck: this.props.deck });
    addLayer(this.deck, this);
  }

  onRemove(): void {
    if (this.deck) {
      removeLayer(this.deck, this);
    }
  }

  setProps(props: MapboxLayerProps<LayerT>) {
    // id cannot be changed
    Object.assign(this.props, props, { id: this.id });
    // safe guard in case setProps is called before onAdd
    if (this.deck) {
      updateLayer(this.deck, this);
    }
  }

  render() {
    drawLayer(this.deck!, this.map!, this);
  }
}
