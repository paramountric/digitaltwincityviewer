import { Deck, MapViewState, MapView } from '@deck.gl/core';
import { action, makeObservable, observable, computed } from 'mobx';
import { Viewer, ViewerProps } from '../Viewer';

const defaultViewStateProps = {
  // currently the EPSG:3857 is used instead of EPSG 4326
  longitude: 0,
  latitude: 0,
  zoom: 14,
  target: [0, 0, 0],
  pitch: 60,
  bearing: 0,
};
export class ViewStore {
  viewState: MapViewState;
  // not sure about viewStateEnd, but is needs to be a way to listen to when the state is steady
  // and ignore intermediate updates during user interactions and animations
  viewStateEnd: MapViewState;
  viewer: Viewer;
  constructor(viewer) {
    this.viewer = viewer;
    this.viewState = defaultViewStateProps;
    this.viewStateEnd = this.viewState;
    makeObservable(this, {
      viewState: observable,
      viewStateEnd: observable,
      setViewState: action,
      setViewStateEnd: action,
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
  setCenter(webmercatorCenter) {
    this.setViewState({
      longitude: webmercatorCenter[0],
      latitude: webmercatorCenter[1],
    });
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
  setViewStateEnd() {
    this.viewStateEnd = Object.assign({}, this.viewState);
  }
}
