import { Deck, MapViewState, MapView } from '@deck.gl/core';
import { action, makeObservable, observable, computed, toJS } from 'mobx';
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
  graphState: MapViewState;
  // not sure about viewStateEnd, but is needs to be a way to listen to when the state is steady
  // and ignore intermediate updates during user interactions and animations
  viewStateEnd: MapViewState;
  viewer: Viewer;
  activeView: 'graph' | 'map';
  showGraphView: boolean;
  constructor(viewer) {
    this.viewer = viewer;
    this.viewState = defaultViewStateProps;
    this.graphState = Object.assign({}, defaultViewStateProps, {
      pitch: 0,
    });
    this.viewStateEnd = this.viewState;
    this.showGraphView = false;
    this.activeView = 'map';
    makeObservable(this, {
      viewState: observable,
      viewStateEnd: observable,
      graphState: observable,
      activeView: observable,
      setViewState: action,
      setViewStateEnd: action,
      setGraphState: action,
    });
  }
  getViews() {
    const mapView = new MapView({
      id: 'mapview',
      controller: true,
      viewState: this.getViewState(),
    });

    if (!this.showGraphView) {
      return mapView;
    }

    const graphView = new MapView({
      id: 'graphview',
      controller: true,
      viewState: this.getGraphState(),
    });

    return this.activeView === 'graph'
      ? [mapView, graphView]
      : [graphView, mapView];
  }
  get zoom() {
    return this.viewState.zoom;
  }
  getViewState() {
    return toJS(this.viewState);
  }
  getGraphState() {
    return toJS(this.graphState);
  }
  // make graph view visible (but might be unactivated)
  setShowGraphView(show) {
    this.showGraphView = show;
  }
  // make the graph view active with 'graph'
  setActiveView(viewId: 'graph' | 'map') {
    this.activeView = viewId;
  }
  setCenter(webmercatorCenter) {
    this.setViewState({
      longitude: webmercatorCenter[0],
      latitude: webmercatorCenter[1],
    });
    this.setGraphState({
      longitude: webmercatorCenter[0],
      latitude: webmercatorCenter[1],
    });
  }
  setViewState({ longitude, latitude, zoom, bearing, pitch }: ViewerProps) {
    const existingViewState = this.getViewState();
    const newViewState = Object.assign({}, existingViewState, {
      longitude: longitude || existingViewState.longitude,
      latitude: latitude || existingViewState.latitude,
      zoom: zoom || existingViewState.zoom,
      bearing: bearing || existingViewState.bearing,
      pitch: pitch || existingViewState.pitch,
    });
    this.viewState = newViewState;
  }
  setGraphState({ longitude, latitude, zoom, bearing, pitch }: ViewerProps) {
    const existingState = this.getGraphState();
    const newState = Object.assign({}, existingState, {
      longitude: longitude || existingState.longitude,
      latitude: latitude || existingState.latitude,
      zoom: zoom || existingState.zoom,
      bearing: bearing || existingState.bearing,
      pitch: pitch || existingState.pitch,
    });
    this.graphState = newState;
  }
  setViewStateEnd() {
    this.viewStateEnd = Object.assign({}, this.viewState);
  }
}
