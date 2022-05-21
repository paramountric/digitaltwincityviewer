import { Deck, MapViewState, MapView } from '@deck.gl/core';
import { action, makeObservable, observable, computed } from 'mobx';
import { Viewer, ViewerProps } from '../Viewer';

const defaultViewStateProps = {
  longitude: 0,
  latitude: 0,
  zoom: 14,
  target: [0, 0, 0],
  pitch: 60,
  bearing: 0,
};
export class ViewStore {
  viewState: MapViewState;
  viewer: Viewer;
  constructor(viewer) {
    this.viewer = viewer;
    this.viewState = defaultViewStateProps;
    makeObservable(this, {
      viewState: observable,
      setViewState: action,
    });
  }
  getView() {
    return new MapView({
      id: 'mapview',
      controller: true,
      viewState: this.getViewState(),
    });
  }
  get zoom() {
    return this.viewState.zoom;
  }

  getViewState() {
    return this.viewState;
  }
  setViewState({ longitude, latitude, zoom }: ViewerProps) {
    const existingViewState = this.getViewState();
    const newViewState = Object.assign({}, existingViewState, {
      longitude: longitude || defaultViewStateProps.longitude,
      latitude: latitude || defaultViewStateProps.latitude,
      zoom: zoom || defaultViewStateProps.zoom,
    });
    this.viewState = newViewState;
    if (!this.viewer.deck) {
      return;
    }
  }
}
