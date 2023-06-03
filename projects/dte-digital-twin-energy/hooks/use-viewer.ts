import { useState, useEffect, useCallback, useMemo } from 'react';
import { Viewer } from '@dtcv/viewer';
import { cities } from '@dtcv/cities';
import getConfig from 'next/config';
import { easeCubicIn } from 'd3-ease';
import { Observable } from '../lib/Observable';
import { useUi } from './use-ui';
import { useNotes } from './use-notes';
import { useSelectedFeature } from './use-selected-feature';
import { useFilteredFeatures } from './use-filtered-features';

const viewerStore = new Observable<Viewer | null>(null);

const { publicRuntimeConfig } = getConfig();

const { dtcvFilesUrl } = publicRuntimeConfig;

const DEFAULT_BUILDING_COLOR_LIGHT = 'rgb(255, 255, 255)';
const DEFAULT_BUILDING_COLOR_HOVER_LIGHT = 'rgb(245, 245, 245)';
const DEFAULT_BUILDING_COLOR = 'rgb(200, 200, 200)';
const DEFAULT_BUILDING_FUTURE_COLOR = 'rgb(230, 200, 200)';
const DEFAULT_BUILDING_HOVER_COLOR = 'rgb(100, 100, 100)';
const BUILDING_PAINT_PROPERTY = [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  DEFAULT_BUILDING_HOVER_COLOR,
  DEFAULT_BUILDING_COLOR,
];
const BUILDING_FUTURE_PAINT_PROPERTY = [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  DEFAULT_BUILDING_HOVER_COLOR,
  DEFAULT_BUILDING_FUTURE_COLOR,
];
const BUILDING_PAINT_PROPERTY_LIGHT = [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  DEFAULT_BUILDING_COLOR_LIGHT,
  DEFAULT_BUILDING_COLOR_HOVER_LIGHT,
];

const GRID_LAYERS = [
  'grid1km2018',
  'grid1km2050',
  'grid250m2018',
  'grid250m2050',
  'grid100m2018',
  'grid100m2050',
  'cityDistricts2018',
  'cityDistricts2050',
  'baseAreas2018',
  'baseAreas2050',
  'primaryAreas2018',
  'primaryAreas2050',
];

const gothenburg = cities.find((c: any) => c.id === 'gothenburg');
if (!gothenburg || !gothenburg.x) {
  throw new Error('City must be selected on app level');
}

// level 1, 2, 3 and building
const aggregationZoomLevels = [8, 11, 12, 14];

let tileServerUrl = 'http://localhost:3000';

if (typeof window !== 'undefined') {
  tileServerUrl = location.origin;
}

const maplibreOptions = {
  minZoom: 10,
  maxZoom: 17,
  // adjust camera since the official center is not the expected center
  center: [gothenburg.lng, gothenburg.lat + 0.03],
  style: {
    id: 'digitaltwincityviewer',
    aggregationZoomLevels,
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': 'rgba(255, 255, 255, 1)',
        },
      },
      {
        id: 'grid1km2018',
        name: 'Grid 1km 2018 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'grid1Km2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'grid1km2050',
        name: 'Grid 1km 2050 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'grid1Km2050',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'grid250m2018',
        name: 'Grid 250m 2018 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'grid250m2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'grid250m2050',
        name: 'Grid 250m 2050 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'grid250m2050',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'grid100m2018',
        name: 'Grid 100m 2018 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'grid100m2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'grid100m2050',
        name: 'Grid 100m 2050 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'grid100m2050',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },

      {
        id: 'cityDistricts2018',
        name: 'City Districts 2018 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'cityDistricts2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'cityDistricts2050',
        name: 'City Districts 2050 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'cityDistricts2050',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },

      {
        id: 'baseAreas2018',
        name: 'Base Areas 2018 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'baseAreas2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'baseAreas2050',
        name: 'Base Areas 2050 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'baseAreas2050',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },

      {
        id: 'primaryAreas2018',
        name: 'Primary areas 2018 extruded',
        type: 'fill',
        source: 'vectorTiles',
        'source-layer': 'primaryAreas2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        // layout: {
        //   visibility: 'none',
        // },
        paint: {
          'fill-color': '#fff',
          'fill-opacity': 0.5,
          'fill-outline-color': '#000',
        },
        // paint: {
        //   'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
        //   'fill-extrusion-height': 1,
        //   'fill-extrusion-base': 0,
        //   'fill-extrusion-opacity': 1,
        // },
      },
      {
        id: 'primaryAreas2050',
        name: 'Primary areas 2050 extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'primaryAreas2050',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': 1,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },

      // {
      //   id: 'primaryAreas2018Outline',
      //   type: 'fill',
      //   source: 'vectorTiles',
      //   'source-layer': 'primaryAreas2018',
      //   paint: {
      //     'fill-color': '#fff',
      //     'fill-opacity': 0.5,
      //     'fill-outline-color': '#000',
      //   },
      // },

      {
        id: 'water',
        name: 'Water',
        type: 'fill',
        source: 'vectorTiles',
        'source-layer': 'water',
        layout: {
          visibility: 'visible',
        },
        paint: {
          'fill-color': 'rgb(180, 230, 255)',
          'fill-opacity': 1,
        },
      },
      {
        id: 'roads',
        name: 'Roads',
        minzoom: 13,
        type: 'fill',
        source: 'vectorTiles',
        'source-layer': 'roads',
        layout: {
          visibility: 'visible',
        },
        paint: {
          'fill-color': 'rgb(200, 200, 200)',
          'fill-opacity': 1,
        },
      },
      {
        id: 'trees',
        name: 'Trees',
        type: 'circle',
        source: 'vectorTiles',
        'source-layer': 'trees',
        layout: {
          visibility: 'visible',
        },
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            // zoom is 5 (or less) -> circle radius will be 1px
            12,
            1,
            // zoom is 10 (or greater) -> circle radius will be 5px
            18,
            6,
          ],
          'circle-opacity': 0.8,
          'circle-color': 'rgb(150, 200, 150)',
        },
      },
      {
        id: 'building',
        name: 'Buildings extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'buildings2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'visible',
        },
        paint: {
          'fill-extrusion-color': BUILDING_PAINT_PROPERTY,
          'fill-extrusion-height': ['get', 'hgt'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
      {
        id: 'building-future',
        name: 'Future buildings extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'buildings2050',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-extrusion-color': BUILDING_FUTURE_PAINT_PROPERTY,
          'fill-extrusion-height': ['get', 'hgt'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
        },
      },
    ],
    sources: {
      vectorTiles: {
        type: 'vector',
        promoteId: 'id',
        //tiles: [`http://localhost:9000/tiles/{z}/{x}/{y}`],
        //tiles: [`${tileServerUrl}/api/tiles?z={z}&x={x}&y={y}`],
        tiles: [`${dtcvFilesUrl}/tiles/{z}/{x}/{y}.mvt`],
      },
    },
    version: 8,
  },
};

export type UseViewerProps = {
  initViewer: (ref?: HTMLElement) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
  getFeatureCategories: () => any;
  setSelectedFeatures: (features: string[]) => void;
  //getVisibleFeatures: () => Feature[];
};

export const useViewer = (): UseViewerProps => {
  // const [viewer, setViewer] = useState<Viewer | null>(null);
  const [extent, setExtent] = useState<number[]>([]);
  const [hoveredObject, setHoveredObject] = useState<any | null>(null);
  const [viewer, setViewer] = useState<Viewer | null>(viewerStore.get());
  // state needs to find objects for changing back the colors due to shift between states
  const [lastHoveredObject, setLastHoveredObject] = useState<any | null>(null);
  const [lastSelectedFeature, setLastSelectedFeature] = useState<any | null>(
    null
  );

  useEffect(() => {
    return viewerStore.subscribe(setViewer);
  }, []);

  const {
    state: uiState,
    actions: uiActions,
    getCombinedKey,
    getAggregation,
    combinationIsSelected,
  } = useUi();
  const {
    state: selectedFeature,
    actions: { setSelectedFeature },
  } = useSelectedFeature();
  const { state: filteredFeatures } = useFilteredFeatures();
  const { state: notes, actions: notesActions } = useNotes();
  // todo: if filteredFeatures is used, the notes could use that to be filtered as well

  // this shows result from the top bar
  // useEffect(() => {
  //   if (viewer) {
  //     // todo: refactor
  //     // scenario on or off shows the selection with colors
  //     // selection is all, filteredFeatures, selectedFeature, district or grid
  //     // building or building-future layer must be selected depending on selectedYearKey

  //     // we know: showColor, selection, yearLayer
  //     // if selection, all other buildings will be transparent
  //     // if showcolor, all selected buildings will be colored

  //     // selection 'all' is default
  //     // selection 'filteredFeatures' or 'selectedFeature' -> how to do this?
  //     // selection aggregator, use the filter for property

  //     const {
  //       selectedYearKey,
  //       selectedDegreeKey,
  //       filterButton,
  //       showScenario,
  //       selectedRenovationOption,
  //     } = uiState;

  //     // the filtered features should already be in state
  //     const hasFilter = Object.values(filteredFeatures).length > 0;
  //     // this is the setting from the top bar
  //     const key = getCombinedKey();
  //     // this is to mark outline, if truthy
  //     const aggregation = getAggregation();

  //     const showColor = combinationIsSelected() && showScenario;

  //     const buildingLayer =
  //       selectedYearKey === '18' || selectedYearKey === 'year'
  //         ? 'building'
  //         : 'building-future';

  //     const aggregationLayer = !aggregation
  //       ? null
  //       : selectedYearKey === '18' || selectedYearKey === 'year'
  //       ? `${aggregation}2018`
  //       : `${aggregation}2050`;

  //     if (hasFilter) {
  //       viewer.maplibreMap?.setPaintProperty(
  //         'building',
  //         'fill-extrusion-color',
  //         BUILDING_PAINT_PROPERTY_LIGHT
  //       );
  //       viewer.maplibreMap?.setPaintProperty(
  //         'building-future',
  //         'fill-extrusion-color',
  //         BUILDING_PAINT_PROPERTY_LIGHT
  //       );
  //       const filteredFeatureArray = Object.values(filteredFeatures);
  //       // set the filteredFeatures to selected using setFeatureState
  //       for (const feature of filteredFeatureArray) {
  //         viewer.maplibreMap?.setFeatureState(
  //           {
  //             source: 'vectorTiles',
  //             sourceLayer: buildingLayer,
  //             id: feature.properties.id,
  //           },
  //           { selected: true }
  //         );
  //       }
  //       const filterExpression = ['==', 'selected', true];
  //       viewer.maplibreMap?.setPaintProperty(
  //         buildingLayer,
  //         'fill-extrusion-opacity',
  //         ['case', filterExpression, 1, 0.7]
  //       );

  //       // viewer.maplibreMap?.setPaintProperty(
  //       //   buildingLayer,
  //       //   'fill-extrusion-opacity',
  //       //   ['has', 'UUID', filteredFeatures]
  //       // );
  //     } else {
  //       if (showColor) {
  //         console.log('show color', key);
  //         viewer.maplibreMap?.setPaintProperty(
  //           buildingLayer,
  //           'fill-extrusion-color',
  //           ['get', `${key}_bcol`]
  //         );
  //         if (aggregationLayer) {
  //           viewer.maplibreMap?.setPaintProperty(
  //             aggregationLayer,
  //             'fill-extrusion-color',
  //             ['get', `${key}_bcol`]
  //           );
  //         }
  //       } else {
  //         viewer.maplibreMap?.setPaintProperty(
  //           'building',
  //           'fill-extrusion-color',
  //           BUILDING_PAINT_PROPERTY
  //         );
  //         viewer.maplibreMap?.setPaintProperty(
  //           'building-future',
  //           'fill-extrusion-color',
  //           BUILDING_FUTURE_PAINT_PROPERTY
  //         );
  //         for (const gridKey of GRID_LAYERS) {
  //           viewer.maplibreMap?.setPaintProperty(
  //             gridKey,
  //             'fill-extrusion-color',
  //             BUILDING_PAINT_PROPERTY
  //           );
  //         }
  //       }

  //       viewer.maplibreMap?.setLayoutProperty(
  //         'building',
  //         'visibility',
  //         buildingLayer === 'building' ? 'visible' : 'none'
  //       );
  //       viewer.maplibreMap?.setLayoutProperty(
  //         'building-future',
  //         'visibility',
  //         buildingLayer === 'building-future' ? 'visible' : 'none'
  //       );

  //       for (const gridKey of GRID_LAYERS) {
  //         viewer.maplibreMap?.setLayoutProperty(gridKey, 'visibility', 'none');
  //         viewer.maplibreMap?.setFilter(gridKey, [
  //           '!=',
  //           `${key}_bcol`,
  //           'rgb(100, 100, 100)',
  //         ]);
  //       }
  //       if (aggregationLayer) {
  //         console.log('aggregationLayer', aggregationLayer);
  //         viewer.maplibreMap?.setLayoutProperty(
  //           aggregationLayer,
  //           'visibility',
  //           'visible'
  //         );
  //       }
  //     }
  //   }
  // }, [
  //   // uiState.selectedPropertyKey,
  //   // uiState.selectedYearKey,
  //   // uiState.selectedDegreeKey,
  //   // uiState.filterButton,
  //   // uiState.showScenario,
  //   // uiState.selectedRenovationOption,
  //   filteredFeatures,
  // ]);

  // TOP BAR EFFECTS (select indicator)
  useEffect(() => {
    if (!viewer || !uiState.showScenario) {
      return;
    }
    setAddBuildingsIndicatorColor();
  }, [
    uiState.selectedPropertyKey,
    uiState.selectedYearKey,
    uiState.selectedDegreeKey,
    uiState.selectedRenovationOption,
  ]);

  useEffect(() => {
    if (!viewer) {
      return;
    }
    const { selectedYearKey } = uiState;
    viewer.maplibreMap?.setLayoutProperty(
      'building',
      'visibility',
      selectedYearKey === '18' ? 'visible' : 'none'
    );
    viewer.maplibreMap?.setLayoutProperty(
      'building-future',
      'visibility',
      selectedYearKey === '50' ? 'visible' : 'none'
    );
  }, [uiState.selectedYearKey]);

  // Toggle scenario
  useEffect(() => {
    if (!viewer) {
      return;
    }
    const { showScenario } = uiState;
    if (showScenario) {
      setAddBuildingsIndicatorColor();
    } else {
      setAllBuildingsGray();
    }
  }, [uiState.showScenario]);

  // Query features on the map EFFECTS
  useEffect(() => {
    if (!viewer) {
      return;
    }
    if (lastSelectedFeature) {
      viewer.maplibreMap?.setPaintProperty('building', 'fill-extrusion-color', [
        'get',
        BUILDING_PAINT_PROPERTY,
      ]);
      // viewer.maplibreMap?.setFeatureState(
      //   {
      //     source: 'vectorTiles',
      //     sourceLayer: 'building',
      //     id: lastSelectedFeature.properties.id,
      //   },
      //   { selected: false }
      // );
      // viewer.maplibreMap?.setFeatureState(
      //   {
      //     source: 'vectorTiles',
      //     sourceLayer: 'building-future',
      //     id: lastSelectedFeature.properties.id,
      //   },
      //   { selected: false }
      // );
    }
    if (selectedFeature) {
      const key = getCombinedKey();
      // viewer.maplibreMap?.setPaintProperty('building', 'fill-extrusion-color', [
      //   'get',
      //   key + '_bcol',
      // ]);
      // viewer.maplibreMap?.setFeatureState(
      //   {
      //     source: 'vectorTiles',
      //     sourceLayer: 'building',
      //     id: selectedFeature.properties.id,
      //   },
      //   { selected: true }
      // );
      // viewer.maplibreMap?.setFeatureState(
      //   {
      //     source: 'vectorTiles',
      //     sourceLayer: 'building-future',
      //     id: selectedFeature.properties.id,
      //   },
      //   { selected: true }
      // );
      setLastSelectedFeature(selectedFeature);
    }
  }, [selectedFeature]);

  // useEffect(() => {
  //   if (!viewer) {
  //     return;
  //   }
  //   const features = viewer.maplibreMap?.queryRenderedFeatures(undefined, {
  //     layers: ['building'],
  //   });
  //   if (!features) {
  //     return;
  //   }
  //   for (const feature of features) {
  //     viewer.maplibreMap?.setFeatureState(
  //       {
  //         source: 'vectorTiles',
  //         sourceLayer: 'building',
  //         id: feature.properties.id,
  //       },
  //       { selected: true }
  //     );
  //     viewer.maplibreMap?.setFeatureState(
  //       {
  //         source: 'vectorTiles',
  //         sourceLayer: 'building-future',
  //         id: feature.properties.id,
  //       },
  //       { selected: true }
  //     );
  //   }
  // }, [selectedFeature]);

  // DISTRICT QUERY
  useEffect(() => {
    // if (!viewer) {
    //   return;
    // }
    // const { filterButton } = uiState;
    // if (filterButton === 'buildings') {
    //   // use the selectedFilterBuildingOption effect
    //   // set back any district or grid
    //   return;
    // }
    // console.log('for aggregation', filterButton);
  }, [uiState.filterButton]);

  // filter of buildings (all, selection, one)
  useEffect(() => {
    // if (!viewer) {
    //   return;
    // }
    // const { selectedFilterBuildingOption, filterButton } = uiState;
    // if (filterButton !== 'buildings') {
    //   // another button trigg
    //   return;
    // }
    // if (selectedFilterBuildingOption === 'all') {
    //   setAllBuildingsTransparency(1);
    //   return;
    // }
    // setAllBuildingsTransparency(0.6);
    // console.log(
    //   'now the filter building option should be used',
    //   selectedFilterBuildingOption
    // );
  }, [uiState.selectedFilterBuildingOption]);

  // GRID QUERY
  useEffect(() => {
    if (!viewer) {
      return;
    }
    const { selectedFilterGridOption, filterButton } = uiState;
    if (filterButton !== 'grid') {
      // another button trigg
      return;
    }
    console.log(
      'now the filter grid option should be used',
      selectedFilterGridOption
    );
  }, [uiState.selectedFilterGridOption]);

  // TOGGLE PINS
  useEffect(() => {
    if (!viewer) {
      return;
    }
    if (uiState.showPins) {
      const pinData = notes
        .filter(n => n.center)
        .filter(
          (obj, index, self) => index === self.findIndex(o => o.id === obj.id)
        );
      viewer.setIconLayerProps({
        id: 'pin-icon-layer',
        data: pinData,
        visible: true,
        // iconAtlas:
        //   'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
        // iconMapping: {
        //   marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
        // },
        getIcon: () => ({
          url: `${dtcvFilesUrl}/location-pin.png`,
          width: 128,
          height: 128,
          anchorY: 128,
        }), //(d: any) => 'marker',
        // sizeMinPixels: 10,
        // sizeMaxPixels: 20,
        getPosition: (d: any) => {
          console.log(d);
          return [...d.center, d.elevation || 0];
        },
        getSize: (d: any) => 30,
        getColor: (d: any) => [0, 140, 0],
        transitions: {
          getPositions: {
            duration: 800,
            easing: easeCubicIn,
            enter: (value: any) => [value[0], value[1], 1000, 1], // fade in
          },
        },
      });
    } else {
      viewer.setIconLayerProps({
        id: 'pin-icon-layer',
        _animate: true,
        visible: false,
      });
    }
  }, [uiState.showPins, notes]);

  // useEffect(() => {
  //   if (viewer?.maplibreMap && lastHoveredObject) {
  //     const sourceLayer = lastHoveredObject.layer['source-layer'];
  //     const sourceId = lastHoveredObject.layer['source'];
  //     viewer.maplibreMap?.setFeatureState(
  //       {
  //         source: sourceId,
  //         sourceLayer: sourceLayer,
  //         id: lastHoveredObject.id,
  //       },
  //       { hover: false }
  //     );
  //     viewer.cursor = 'grab';
  //   }
  //   if (viewer?.maplibreMap && hoveredObject) {
  //     const sourceLayer = hoveredObject.layer['source-layer'];
  //     const sourceId = hoveredObject.layer['source'];
  //     viewer.maplibreMap?.setFeatureState(
  //       {
  //         source: sourceId,
  //         sourceLayer: sourceLayer,
  //         id: hoveredObject.id,
  //       },
  //       { hover: true }
  //     );
  //     viewer.cursor = 'pointer';
  //   }
  // }, [hoveredObject]);

  // const addStrokeToFeature = (feature: any) => {
  //   if (!viewer) {
  //     return;
  //   }
  //   // Style the polygon based on its feature state
  //   viewer.maplibreMap?.setPaintProperty(
  //     'my-polygon-layer',
  //     'fill-outline-color',
  //     ['case', ['boolean', ['feature-state', 'hover'], false], '#00f', '#000']
  //   );
  // };

  const getActiveBuildingLayer = () => {
    const buildingLayer =
      uiState.selectedYearKey === '18' || uiState.selectedYearKey === 'year'
        ? 'building'
        : 'building-future';

    return buildingLayer;
  };

  const setAddBuildingsIndicatorColor = () => {
    if (!viewer) {
      return;
    }
    if (!uiState.showScenario) {
      console.log('a scenrio combination should be selected first');
      return;
    }
    const key = getCombinedKey();
    viewer.maplibreMap?.setPaintProperty('building', 'fill-extrusion-color', [
      'get',
      `${key}_bcol`,
    ]);
    viewer.maplibreMap?.setPaintProperty(
      'building-future',
      'fill-extrusion-color',
      ['get', `${key}_bcol`]
    );
  };

  const setAllBuildingsGray = () => {
    if (!viewer) {
      return;
    }
    // const buildingLayer = getActiveBuildingLayer();
    // const filterExpression = ['==', 'selected', 'yes'];
    viewer.maplibreMap?.setPaintProperty(
      'building',
      'fill-extrusion-color',
      BUILDING_PAINT_PROPERTY
    );
    viewer.maplibreMap?.setPaintProperty(
      'building-future',
      'fill-extrusion-color',
      BUILDING_PAINT_PROPERTY
    );
  };

  const setAllBuildingsTransparency = (transparency: number) => {
    if (!viewer) {
      return;
    }
    const buildingLayer = getActiveBuildingLayer();
    const filterExpression = ['==', 'selected', 'yes'];
    // viewer.maplibreMap?.setPaintProperty(
    //   buildingLayer,
    //   'fill-extrusion-color',
    //   BUILDING_PAINT_PROPERTY_LIGHT
    // );
    viewer.maplibreMap?.setPaintProperty(
      buildingLayer,
      'fill-extrusion-opacity',
      0.5
      // ['case', filterExpression, 1, 0.3]
    );
  };

  return useMemo(() => {
    return {
      initViewer: (ref?: any) => {
        if (viewer) {
          return;
        }
        if (ref) {
          ref.style.width = '100%'; //window.innerWidth;
          ref.style.height = '100%'; //window.innerHeight;
          ref.style.position = 'absolute';
          ref.style.top = '0px';
          ref.style.left = '0px';
        }
        //ref.style.background = '#100';
        viewerStore.set(
          new Viewer(
            {
              // _animate: true,
              // container: ref,
              // layers: [{ '@@type': 'Tile3DLayer' }],
              // onDragEnd: ({ longitude, latitude, zoom }: any) => {
              //   setExtent([longitude, latitude, zoom]);
              // },
              onLoad: v => {
                const maplibreMap = v.maplibreMap;
                if (!maplibreMap || viewer) {
                  return;
                }
                // ON CLICK
                maplibreMap.on('click', (e: any) => {
                  const { point } = e;
                  const features = maplibreMap.queryRenderedFeatures(
                    point,
                    undefined
                  );
                  if (features.length > 0) {
                    // if (selectedFeature) {
                    //   maplibreMap.setFeatureState(
                    //     {
                    //       source: 'vectorTiles',
                    //       sourceLayer: 'building',
                    //       id: selectedFeature.properties.id,
                    //     },
                    //     { selected: false }
                    //   );
                    //   maplibreMap.setFeatureState(
                    //     {
                    //       source: 'vectorTiles',
                    //       sourceLayer: 'building-future',
                    //       id: selectedFeature.properties.id,
                    //     },
                    //     { selected: false }
                    //   );
                    // }
                    setSelectedFeature(null);
                    const clickedFeature = features[0];
                    // if layer needed:
                    // const sourceLayer = `${clickedFeature.layer.id}`;
                    if (clickedFeature.properties) {
                      console.log(clickedFeature.properties);
                      setSelectedFeature(clickedFeature);
                      // maplibreMap.setFeatureState(
                      //   {
                      //     source: 'vectorTiles',
                      //     sourceLayer: 'building',
                      //     id: clickedFeature.properties.id,
                      //   },
                      //   { selected: true }
                      // );
                      // maplibreMap.setFeatureState(
                      //   {
                      //     source: 'vectorTiles',
                      //     sourceLayer: 'building-future',
                      //     id: clickedFeature.properties.id,
                      //   },
                      //   { selected: true }
                      // );
                    }
                  } else {
                    setSelectedFeature(null);
                  }
                });

                // ON HOVER

                const hoverLayers = ['building', 'building-future'];

                // maplibreMap.setPaintProperty(
                //   'primaryAreas2018Outline',
                //   'fill-outline-color',
                //   [
                //     'case',
                //     ['boolean', ['feature-state', 'hover'], false],
                //     '#00f',
                //     '#000',
                //   ]
                // );

                // for (const hoverLayer of hoverLayers) {
                //   maplibreMap.on('mouseenter', hoverLayer, (e: any) => {
                //     console.log('mouseenter');
                //     if (hoveredObjectId) {
                //       maplibreMap?.setFeatureState(
                //         {
                //           source: 'vectorTiles',
                //           sourceLayer: 'building',
                //           id: lastHoveredObject.id,
                //         },
                //         { hover: false }
                //       );
                //       maplibreMap?.setFeatureState(
                //         {
                //           source: 'vectorTiles',
                //           sourceLayer: 'building-future',
                //           id: lastHoveredObject.id,
                //         },
                //         { hover: false }
                //       );
                //       v.cursor = 'grab';
                //       hoveredObjectId = null;
                //     }
                //     if (e.features.length > 0) {
                //       if (hoveredObjectId) {
                //         maplibreMap?.setFeatureState(
                //           {
                //             source: 'vectorTiles',
                //             sourceLayer: 'building',
                //             id: e.features[0].id,
                //           },
                //           { hover: true }
                //         );
                //         maplibreMap?.setFeatureState(
                //           {
                //             source: 'vectorTiles',
                //             sourceLayer: 'building-future',
                //             id: e.features[0].id,
                //           },
                //           { hover: true }
                //         );
                //         v.cursor = 'grab';
                //         hoveredObjectId = null;
                //       }
                //     }
                //   });
                //   maplibreMap.on('mouseleave', () => {
                //     if (hoveredObjectId) {
                //       maplibreMap?.setFeatureState(
                //         {
                //           source: 'vectorTiles',
                //           sourceLayer: 'building',
                //           id: lastHoveredObject.id,
                //         },
                //         { hover: false }
                //       );
                //       maplibreMap?.setFeatureState(
                //         {
                //           source: 'vectorTiles',
                //           sourceLayer: 'building-future',
                //           id: lastHoveredObject.id,
                //         },
                //         { hover: false }
                //       );
                //       v.cursor = 'grab';
                //       hoveredObjectId = null;
                //     }
                //   });
                // }

                // Style the fill-extrusion based on its feature state
                // maplibreMap.setPaintProperty(
                //   'building',
                //   'fill-extrusion-opacity',
                //   [
                //     'case',
                //     ['boolean', ['feature-state', 'selected'], false],
                //     0.3, // default opacity
                //     ['boolean', ['feature-state', 'hover'], false],
                //     0.6, // opacity on hover
                //     1, // opacity when selected
                //   ]
                // );
              },
            },
            Object.assign({}, maplibreOptions, {
              container: ref,
            }) as any
          )
        );
      },
      viewer,
      viewerLoading: false,
      getFeatureCategories: () => {
        if (viewer) {
          const features = viewer.maplibreMap?.queryRenderedFeatures(
            undefined,
            { layers: ['building', 'building-future'] }
          );
          const categories = features?.reduce((acc, feature) => {
            console.log('feature', feature);
            const { properties } = feature;
            if (properties.bt) {
              acc['building_purpose'] = acc['building_purpose'] || {};
              acc['building_purpose'][properties.bt] =
                acc['building_purpose'][properties.bt] || [];
              acc['building_purpose'][properties.bt].push(
                feature.properties.id
              );
            } else if (properties.hs) {
              acc['hs'] = acc['hs'] || {};
              acc['hs'][properties.hs] = acc['hs'][properties.hs] || [];
              acc['hs'][properties.hs].push(feature.properties.id);
            } else if (properties.own) {
              acc['own'] = acc['own'] || {};
              acc['own'][properties.own] = acc['own'][properties.own] || [];
              acc['own'][properties.own].push(feature.properties.id);
            }
            return acc;
          }, {} as any);
          return categories;
        }
        return [];
      },
      setSelectedFeatures: (ids: string[]) => {
        if (!viewer) return;
        const features = viewer.maplibreMap?.queryRenderedFeatures(undefined, {
          layers: ['building', 'building-future'],
        });

        const key = getCombinedKey();

        const paintProperty = [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          DEFAULT_BUILDING_HOVER_COLOR,
          ['get', `${key}_bcol`],
        ];

        viewer.maplibreMap?.setPaintProperty(
          'building',
          'fill-extrusion-color',
          paintProperty
        );

        // set all to selecded: false

        for (const feature of features || []) {
          viewer?.maplibreMap?.setFeatureState(
            {
              source: 'vectorTiles',
              sourceLayer: 'building',
              id: feature.id,
            },
            { selected: false }
          );
          viewer?.maplibreMap?.setFeatureState(
            {
              source: 'vectorTiles',
              sourceLayer: 'building-future',
              id: feature.id,
            },
            { selected: false }
          );
        }

        for (const id of ids) {
          viewer?.maplibreMap?.setFeatureState(
            {
              source: 'vectorTiles',
              sourceLayer: 'building',
              id,
            },
            { selected: true }
          );
          viewer?.maplibreMap?.setFeatureState(
            {
              source: 'vectorTiles',
              sourceLayer: 'building-future',
              id,
            },
            { selected: true }
          );
        }
      },
    };
  }, [viewer]);
  // getVisibleFeatures: () => {
  //   if (viewer) {
  //     return viewer.getVisibleObjects(['bsm-layer']);
  //   }
  //   return [];
  // },
};

// ! kept for reference

// const queryBuildings2018 = useQuery(
//   ['buildings-2018'],
//   async () => {
//     try {
//       const res = await fetch('/api/data/buildings2018');
//       return await res.json();
//     } catch (err) {
//       return undefined;
//     }
//   },
//   {
//     refetchOnWindowFocus: false,
//     enabled: true,
//   }
// );

// const queryBuildings2050 = useQuery(
//   ['buildings-2050'],
//   async () => {
//     try {
//       const res = await fetch('/api/data/buildings2050');
//       return await res.json();
//     } catch (err) {
//       return undefined;
//     }
//   },
//   {
//     refetchOnWindowFocus: false,
//     enabled: false,
//   }
// );

// const contextData = useQuery(
//   ['context'],
//   async () => {
//     try {
//       const res = await fetch('/api/data/context');
//       return await res.json();
//     } catch (err) {
//       return undefined;
//     }
//   },
//   {
//     refetchOnWindowFocus: false,
//     enabled: false,
//   }
// );

// const updateTimeline = () => {
//   console.log('test', viewer, propertyKey, selectedYear);
//   if (!viewer || !propertyKey || !selectedYear) {
//     return;
//   }
//   const visibleObjects = ;
//   const timelineData = getTimelineData(visibleObjects);
//   console.log(timelineData);
// };

// const render = () => {
//   if (!viewer) {
//     return;
//   }
//   const jsonData: JsonProps = {
//     layers: [],
//   };
//   const isBaseMap2050 = false; //baseMapData?.features?.length > 0;

//   const features = contextData.data?.features || [];
//   const pointFeatures = features.filter(
//     (f: Feature) => f.geometry.type === 'Point'
//   );

//   for (const pointFeature of pointFeatures) {
//     // @ts-ignore
//     pointFeature.geometry.coordinates[2] = 0;
//   }

//   if (contextData && jsonData && jsonData.layers) {
//     jsonData.layers.push({
//       id: 'context-layer',
//       //'@@type': 'SolidPolygonLayer',
//       '@@type': 'GeoJsonLayer',
//       data: contextData,
//       onClick: (d: any) => {
//         //
//       },
//       //modelMatrix: [],
//       opacity: 1,
//       autoHighlight: false,
//       highlightColor: [100, 150, 250, 255],
//       extruded: false,
//       wireframe: false,
//       pickable: false,
//       isClickable: false,
//       coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//       coordinateOrigin: [gothenburg.lng, gothenburg.lat],
//       getPolygon: '@@=geometry.coordinates',
//       //getFillColor: '@@=properties.color || [100, 150, 250, 30]',
//       getFillColor: (feature: Feature) => {
//         const defaultFillColor = [200, 200, 200, 255];
//         if (!feature.properties) {
//           return defaultFillColor;
//         }
//         const fillColor = feature.properties?.fillColor;
//         if (fillColor) {
//           // todo: have to check the color coding
//           //return fillColor;
//         }
//         // hacky checks for properties in project data
//         if (feature.properties.DETALJTYP === 'VATTEN') {
//           return [100, 150, 250, 105];
//         } else if (feature.properties.SW_MEMBER) {
//           return [220, 220, 220, 255];
//         } else if (feature.geometry.type === 'Point') {
//           return [50, 100, 50, 55];
//         }
//       },
//       getLineColor: (feature: Feature) => {
//         const defaultFillColor = [200, 200, 200, 255];
//         if (!feature.properties) {
//           return defaultFillColor;
//         }
//         const fillColor = feature.properties?.fillColor;
//         if (fillColor) {
//           // todo: have to check the color coding
//           //return fillColor;
//         }
//         // hacky checks for properties in project data
//         if (feature.properties.DETALJTYP === 'VATTEN') {
//           return [100, 150, 250, 50];
//         } else if (feature.properties.SW_MEMBER) {
//           return [190, 190, 190, 255];
//         } else if (feature.geometry.type === 'Point') {
//           return [50, 100, 50, 50];
//         }
//       },
//       getElevation: 0, //'@@=properties.height || 0',
//       useDevicePixels: true,
//       stroked: true,
//       filled: true,
//       pointType: 'circle',
//       lineWidthScale: 1,
//       lineWidthMinPixels: 1,
//       getPointRadius: 7,
//       getLineWidth: 1,
//       parameters: {
//         depthMask: true,
//         depthTest: true,
//         blend: true,
//         blendFunc: [
//           '@@#GL.SRC_ALPHA',
//           '@@#GL.ONE_MINUS_SRC_ALPHA',
//           '@@#GL.ONE',
//           '@@#GL.ONE_MINUS_SRC_ALPHA',
//         ],
//         polygonOffsetFill: true,
//         depthFunc: '@@#GL.LEQUAL',
//         blendEquation: '@@#GL.FUNC_ADD',
//       },
//     });
//   } else if (jsonData && jsonData.layers) {
//     // jsonData.layers.push({
//     //   id: 'context-layer',
//     //   //'@@type': 'SolidPolygonLayer',
//     //   '@@type': 'GeoJsonLayer',
//     //   data: {},
//     //   parameters: {
//     //     depthMask: true,
//     //     depthTest: true,
//     //     blend: true,
//     //     blendFunc: [
//     //       '@@#GL.SRC_ALPHA',
//     //       '@@#GL.ONE_MINUS_SRC_ALPHA',
//     //       '@@#GL.ONE',
//     //       '@@#GL.ONE_MINUS_SRC_ALPHA',
//     //     ],
//     //     polygonOffsetFill: true,
//     //     depthFunc: '@@#GL.LEQUAL',
//     //     blendEquation: '@@#GL.FUNC_ADD',
//     //   },
//     // });
//   }

//   const climateScenarioData = false;

//   if (!isBaseMap2050 && climateScenarioData && jsonData && jsonData.layers) {
//     jsonData.layers.push({
//       id: 'bsm-layer',
//       '@@type': 'SolidPolygonLayer',
//       //'@@type': 'GeoJsonLayer',
//       //data: climateScenarioData.buildings,
//       onClick: (d: any) => {
//         if (d.object) {
//           if (!d.object.id) {
//             d.object.id = d.object.properties.uuid;
//           }
//           actions.setFeatureId(d.object.id);
//           return;
//         }
//       },
//       //modelMatrix: data.modelMatrix,
//       opacity: 1,
//       autoHighlight: true,
//       highlightColor: [100, 150, 250, 255],
//       extruded: true,
//       wireframe: true,
//       pickable: true,
//       isClickable: true,
//       coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//       coordinateOrigin: [gothenburg.lng, gothenburg.lat],
//       getPolygon: '@@=geometry.coordinates',
//       getFillColor: '@@=properties.color || [255, 255, 255, 255]',
//       getLineColor: [100, 100, 100],
//       getElevation: '@@=properties.height || 0',
//       useDevicePixels: true,
//       parameters: {
//         depthMask: true,
//         depthTest: true,
//         blend: true,
//         blendFunc: [
//           '@@#GL.SRC_ALPHA',
//           '@@#GL.ONE_MINUS_SRC_ALPHA',
//           '@@#GL.ONE',
//           '@@#GL.ONE_MINUS_SRC_ALPHA',
//         ],
//         polygonOffsetFill: true,
//         depthFunc: '@@#GL.LEQUAL',
//         blendEquation: '@@#GL.FUNC_ADD',
//       },
//     });
//   }

//   const baseMapData = false;

//   if (baseMapData && jsonData && jsonData.layers) {
//     jsonData.layers.push({
//       id: 'baseMap-layer',
//       //'@@type': 'SolidPolygonLayer',
//       '@@type': 'GeoJsonLayer',
//       data: baseMapData,
//       // onClick: (d: any) => {
//       //   if (d.object) {
//       //     if (!d.object.id) {
//       //       d.object.id = d.object.properties.uuid;
//       //     }
//       //     actions.setFeatureId(d.object.id);
//       //     return;
//       //   }
//       // },
//       //modelMatrix: data.modelMatrix,
//       opacity: 0.9,
//       autoHighlight: false,
//       highlightColor: [100, 150, 250, 255],
//       extruded: true,
//       wireframe: false,
//       pickable: false,
//       isClickable: false,
//       coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//       coordinateOrigin: [gothenburg.lng, gothenburg.lat],
//       getPolygon: '@@=geometry.coordinates',
//       getFillColor: '@@=properties.color || [255, 255, 255, 255]',
//       getLineColor: [100, 100, 100, 255],
//       getElevation: '@@=properties.height || 20',
//       useDevicePixels: true,
//       parameters: {
//         depthMask: true,
//         depthTest: true,
//         blend: true,
//         blendFunc: [
//           '@@#GL.SRC_ALPHA',
//           '@@#GL.ONE_MINUS_SRC_ALPHA',
//           '@@#GL.ONE',
//           '@@#GL.ONE_MINUS_SRC_ALPHA',
//         ],
//         polygonOffsetFill: true,
//         depthFunc: '@@#GL.LEQUAL',
//         blendEquation: '@@#GL.FUNC_ADD',
//       },
//     });
//   }
//   viewer.setJson(jsonData);
// };

// useEffect(() => {
//   const {propertyKey, selectedYear} = indicatorState;
//   if (
//     !viewer ||
//     !climateScenarioData ||
//     !climateScenarioData.buildings ||
//     !propertyKey ||
//     !selectedYear
//   ) {
//     return;
//   }
//   for (const feature of climateScenarioData.buildings) {
//     if (!feature.properties) {
//       continue;
//     }
//     const key = `${propertyKey}${selectedYear}M2`;
//     const val = feature.properties[key];
//     if (val) {
//       const scale =
//         propertyKey === 'ghgEmissions' ? 'buildingGhg' : 'energyDeclaration';
//       feature.properties.color = getColorFromScale(val, scale);
//     }
//   }
//   // old code for gradient color scale between green and red using generateColor from viewer module
//   // const colorStyle = {
//   //   sufficient: 150,
//   //   excellent: 60,
//   //   propertyKey: `${propertyKey}${selectedYear}M2`,
//   // };
//   // console.log(climateScenarioData);

//   // for (const feature of climateScenarioData.buildings) {
//   //   if (
//   //     feature.properties &&
//   //     colorStyle.propertyKey &&
//   //     colorStyle.sufficient &&
//   //     colorStyle.excellent
//   //   ) {
//   //     const color = generateColor(
//   //       feature.properties[colorStyle.propertyKey],
//   //       colorStyle.sufficient,
//   //       colorStyle.excellent
//   //     );
//   //     feature.properties.color = color;
//   //   }
//   // }
//   // this should trigger the bottom panel initially (with all data)
//   // updateTimelineData(propertyKey, selectedYear);
//   // render();
// }, [indicatorState, viewer, climateScenarioData]);

// useEffect(() => {
//   render();
// }, [contextData, baseMapData]);

// useEffect(() => {
//   refetchClimateScenarioData();
//   refetchBaseMapData();
//   refetchContextData();
// }, [userInfo]);

// useEffect(() => {
//   if (viewer) {
//     const result = viewer.getVisibleObjects(['bsm-layer']);
//     const features = result.map((r: any) => r.object).filter(Boolean);
//     const {propertyKey, selectedYear} = indicatorState;
//     updateTimelineData(propertyKey, selectedYear, features);
//   }
// }, [extent]);

// useEffect(() => {
//   if (viewer) {
//     const json: any = {
// views: [
//   {
//     '@@type': 'MapView',
//     id: 'mapview',
//     controller: true,
//   },
// ],
// viewState: {
//   mainview: {
//     longitude: 0, //11.9746,
//     latitude: 0, //57.7089,
//     zoom: 14,
//     target: [0, 0, 0],
//     pitch: 60,
//     bearing: 0,
//   },
// },
// layers: [
// {
//   '@@type': 'MVTLayer',
//   //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//   data: 'http://localhost:9000/tiles/{z}/{x}/{y}',
// },
// {
//   '@@type': 'QuadkeyLayer',
//   id: 'quadkeys',
//   data: [
//     {
//       quadkey: viewer.getQuadkey(1, 0, 1),
//       fillColor: [128, 255, 0],
//       elevation: 10,
//     },
//     {
//       quadkey: viewer.getQuadkey(1, 1, 1),
//       fillColor: [255, 128, 255],
//       elevation: 100,
//     },
//     {
//       quadkey: viewer.getQuadkey(0, 1, 1),
//       fillColor: [128, 255, 255],
//       elevation: 10,
//     },
//     {
//       quadkey: viewer.getQuadkey(0, 0, 1),
//       fillColor: [255, 0, 255],
//       elevation: 100,
//     },
//   ],
//   coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//   pickable: false,
//   wireframe: true,
//   stroked: true,
//   filled: true,
//   extruded: true,
//   elevationScale: 1,
//   getFillColor: '@@=fillColor || [255, 128, 18]',
//   getLineColor: [0, 0, 0],
//   getLineWidth: 10,
//   // lineWidthUnits,
//   // lineWidthScale,
//   lineWidthMinPixels: 10,
//   // lineWidthMaxPixels,
//   // lineJointRounded,
//   // lineMiterLimit,
//   // lineDashJustified,
//   getElevation: '@@=elevation || 1',
// },
//   ],
// };
// if (publicData) {
//   json.layers.push({
//     id: 'osm-context',
//     '@@type': 'GeoJsonLayer',
//     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//     modelMatrix: publicData.modelMatrix,
//     data: publicData.buildings,
//     pickable: false,
//     stroked: false,
//     filled: false,
//     extruded: false,
//     pointType: 'circle',
//     lineWidthScale: 1,
//     lineWidthMinPixels: 1,
//     getFillColor: [160, 160, 180, 200],
//     getLineColor: [100, 100, 100, 100],
//     getPointRadius: 100,
//     getLineWidth: 1,
//     getElevation: 30,
//   });
// }

// if (data?.buildings) {
//   json.layers.push({
//     id: 'bsm-layer',
//     '@@type': 'SolidPolygonLayer',
//     //'@@type': 'GeoJsonLayer',
//     data: data.buildings,
//     modelMatrix: data.modelMatrix,
//     opacity: 1,
//     autoHighlight: true,
//     highlightColor: [100, 150, 250, 255],
//     extruded: true,
//     wireframe: true,
//     pickable: true,
//     isClickable: true,
//     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//     getPolygon: '@@=geometry.coordinates',
//     getFillColor: '@@=properties.color || [255, 255, 255, 255]',
//     getLineColor: [100, 100, 100],
//     getElevation: '@@=properties.height || 0',
//     useDevicePixels: true,
//     parameters: {
//       depthMask: true,
//       depthTest: true,
//       blend: true,
//       blendFunc: [
//         '@@#GL.SRC_ALPHA',
//         '@@#GL.ONE_MINUS_SRC_ALPHA',
//         '@@#GL.ONE',
//         '@@#GL.ONE_MINUS_SRC_ALPHA',
//       ],
//       polygonOffsetFill: true,
//       depthFunc: '@@#GL.LEQUAL',
//       blendEquation: '@@#GL.FUNC_ADD',
//     },
//   });
// }
// viewer.setJson(json);
//     // protectedDataLayer.data = protectedData.buildings;
//     // protectedDataLayer.modelMatrix = protectedData.modelMatrix;
//     //   viewer.setLayerProps('bsm-layer', {
//     //     data: protectedData.buildings,
//     //     modelMatrix: protectedData.modelMatrix,
//     //     onDragEnd: updateTimeline,
//     //   });
//     //   viewer.setLayerState('bsm-layer', {
//     //     url: 'http://localhost:9000/files/citymodel/CityModelWithBSMResults.json',
//     //     isLoaded: true,
//     //   });
//     //   viewer.render();
//   }
// }
// if (viewer) {
//   console.log('get tileset');
//   viewer.setJson({
// views: [
//   {
//     '@@type': 'MapView',
//     id: 'mainview',
//     controller: true,
//   },
// ],
// viewState: {
//   mainview: {
//     longitude: -75.152408, // -75.61209430782448, //11.9746,
//     latitude: 39.946975, //40.042530611425896, //57.7089,
//     zoom: 14,
//     target: [0, 0, 0],
//     pitch: 60,
//     bearing: 0,
//   },
// },
// layers: [
//   {
//     '@@type': 'Tile3DLayer',
//     //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//     data: 'http://localhost:9000/files/3dtiles/1.1/SparseImplicitQuadtree/tileset.json',
//     //loader: '@@#Tiles3DLoader',
//   },
//   ],
// });
// }
// if (viewer) {
//   console.log('get tileset');
//   viewer.setJson({
//     // views: [
//     //   {
//     //     '@@type': 'MapView',
//     //     id: 'mainview',
//     //     controller: true,
//     //   },
//     // ],
//     // viewState: {
//     //   mainview: {
//     //     longitude: -75.152408, // -75.61209430782448, //11.9746,
//     //     latitude: 39.946975, //40.042530611425896, //57.7089,
//     //     zoom: 14,
//     //     target: [0, 0, 0],
//     //     pitch: 60,
//     //     bearing: 0,
//     //   },
//     // },
//     layers: [
//       {
//         '@@type': 'MVTLayer',
//         //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//         data: 'http://localhost:9000/tiles/{z}/{x}/{y}',
//       },
//     ],
//   });
//   }
// }, [viewer, data]); //[publicData, protectedData, viewer]);
