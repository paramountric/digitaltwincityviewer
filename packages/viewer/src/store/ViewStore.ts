import { Deck, MapViewState, MapView } from '@deck.gl/core';
import { action, makeObservable, observable, computed, toJS } from 'mobx';
import { Viewer } from '../Viewer';

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
    this.viewState = Object.assign({}, defaultViewStateProps, {
      id: 'mapview',
    });
    this.graphState = Object.assign({}, defaultViewStateProps, {
      id: 'graphview',
      pitch: 0,
    });
    this.viewStateEnd = this.viewState;
    // this setting is used to control which view is active of interaction
    this.showGraphView = false;
    this.activeView = 'map';
    makeObservable(this, {
      viewState: observable,
      viewStateEnd: observable,
      graphState: observable,
      activeView: observable,
      showGraphView: observable,
      setActiveView: action,
      setViewState: action,
      setViewStateEnd: action,
      setGraphState: action,
      setShowGraphView: action,
    });
  }
  getViews() {
    const mapView = new MapView({
      id: 'mapview',
      controller: this.activeView !== 'graph',
    });

    const graphView = new MapView({
      id: 'graphview',
      controller: this.activeView === 'graph',
      //viewState: toJS(this.graphState),x
    });

    return this.activeView === 'graph'
      ? [mapView, graphView]
      : [graphView, mapView];
  }
  getViewStates() {
    return {
      mapview: toJS(this.viewState),
      graphview: toJS(this.graphState),
    };
  }
  get zoom() {
    return this.viewState.zoom;
  }
  getViewState() {
    return this.viewState;
  }
  getGraphState() {
    return this.graphState;
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
  setViewState({ longitude, latitude, zoom, bearing, pitch }: MapViewState) {
    const newViewState: MapViewState = {};
    if (longitude || longitude === 0) {
      newViewState.longitude = longitude;
    }
    if (latitude || latitude === 0) {
      newViewState.latitude = latitude;
    }
    if (zoom || zoom === 0) {
      newViewState.zoom = zoom;
    }
    if (bearing || bearing === 0) {
      newViewState.bearing = bearing;
    }
    if (pitch || pitch === 0) {
      newViewState.pitch = pitch;
    }
    // console.log('new', newViewState);
    this.viewState = Object.assign({}, this.viewState, newViewState);
  }
  setGraphState({ longitude, latitude, zoom, bearing, pitch }: MapViewState) {
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
