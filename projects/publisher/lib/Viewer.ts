import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const data = [
  {
    name: 'Colma (COLM)',
    code: 'CM',
    address: '365 D Street, Colma CA 94014',
    exits: 4214,
    coordinates: [-122.466233, 37.684638],
  },
];

export class Viewer {
  deck: Deck;
  constructor(ref) {
    this.deck = new Deck({
      //canvas: ref,
      initialViewState: {
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
      },
      controller: true,
      layers: [
        new ScatterplotLayer({
          id: 'test',
          data,
          pickable: true,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 6,
          radiusMinPixels: 1,
          radiusMaxPixels: 100,
          lineWidthMinPixels: 1,
          getPosition: d => d.coordinates,
          getRadius: d => Math.sqrt(d.exits),
          getFillColor: d => [255, 140, 0],
          getLineColor: d => [0, 0, 0],
        }),
      ],
    });
  }
}
