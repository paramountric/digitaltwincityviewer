import { useState, useEffect, useCallback, useMemo } from 'react';
import { Viewer } from '@dtcv/viewer';
import { cities } from '@dtcv/cities';
import getConfig from 'next/config';
import { easeCubicIn } from 'd3-ease';
import { Observable } from '../lib/Observable';
import { UiStore, useUi } from './use-ui';
import { useNotes } from './use-notes';
// import { useSelectedFeature } from './use-selected-feature';
import { useFilteredFeatures } from './use-filtered-features';
import { FilterCategories, useFilterCategories } from './use-filter-categories';
import { assignMapColors } from '../lib/assignMapColors';
import { filterCategoryKeys, filterGridOptions } from '../lib/constants';

const viewerStore = new Observable<Viewer | null>(null);

const { publicRuntimeConfig } = getConfig();

// const { dtcvFilesUrl } = publicRuntimeConfig;

const dtcvFilesUrl = 'https://digitaltwincityviewer.s3.amazonaws.com';

// const DEFAULT_BUILDING_COLOR_LIGHT = 'rgb(255, 255, 255)';
// const DEFAULT_BUILDING_COLOR_HOVER_LIGHT = 'rgb(245, 245, 245)';
const DEFAULT_BUILDING_COLOR = 'rgb(200, 200, 200)';
const BUILDING_COLOR_LIGHT = 'rgb(255, 255, 255)';

const SELECTED_BUILDING_COLOR = 'rgb(150, 150, 150)';
const DEFAULT_DISTRICT_COLOR = 'rgb(255, 255, 255)';
const SELECTED_DISTRICT_COLOR = 'rgb(235, 235, 235)';
const DEFAULT_BUILDING_FUTURE_COLOR = 'rgb(230, 200, 200)';
const DEFAULT_BUILDING_HOVER_COLOR = 'rgb(100, 100, 100)';
const SELECTED_BUILDING_HOVER_COLOR = 'rgb(50, 50, 50)';
const BUILDING_PAINT_PROPERTY = [
  'case',
  ['boolean', ['feature-state', 'showScenario'], false],
  DEFAULT_BUILDING_HOVER_COLOR,
  DEFAULT_BUILDING_COLOR,
];
const DISTRICT_PAINT_PROPERTY = [
  'case',
  ['boolean', ['feature-state', 'showScenario'], false],
  SELECTED_DISTRICT_COLOR,
  DEFAULT_DISTRICT_COLOR,
];
const BUILDING_FUTURE_PAINT_PROPERTY = [
  'case',
  ['boolean', ['feature-state', 'showScenario'], false],
  DEFAULT_BUILDING_HOVER_COLOR,
  DEFAULT_BUILDING_FUTURE_COLOR,
];
// const BUILDING_PAINT_PROPERTY_WHITE = [
//   'case',
//   ['boolean', ['feature-state', 'hover'], false],
//   DEFAULT_BUILDING_COLOR_LIGHT,
//   DEFAULT_BUILDING_COLOR_HOVER_LIGHT,
// ];

export const AGGREGATION_LAYERS = [
  'grid1km-fill',
  'grid1km-line',
  'grid250m-fill',
  'grid250m-line',
  'grid100m-fill',
  'grid100m-line',
  'cityDistricts-fill',
  'cityDistricts-line',
  'baseAreas-fill',
  'baseAreas-line',
  'primaryAreas-fill',
  'primaryAreas-line',
];

const aggregationLayers = AGGREGATION_LAYERS.map(layerId => {
  const layer = layerId.split('-')[0];
  const type = layerId.split('-')[1];

  return {
    id: layerId,
    name: layerId,
    type,
    source: 'vectorTiles',
    'source-layer': layer,
    maxzoom: 18,
    minzoom: 10,
    layout: {
      visibility: 'none',
    },
    paint:
      type === 'line'
        ? {
            'line-color': '#000',
            'line-width': 3,
          }
        : {
            'fill-color': DISTRICT_PAINT_PROPERTY,
            'fill-opacity': 1,
          },
  };
});

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
      ...aggregationLayers.filter(l => l.type === 'fill'),
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
      ...aggregationLayers.filter(l => l.type === 'line'),
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
        promoteId: 'id', // this will use the id in the properties for feature-state
        tiles: [`http://localhost:9000/tiles/{z}/{x}/{y}`],
        //tiles: [`${tileServerUrl}/api/tiles?z={z}&x={x}&y={y}`],
        // tiles: [`${dtcvFilesUrl}/tiles/{z}/{x}/{y}.mvt`],
      },
    },
    version: 8,
  },
};

export type UseViewerProps = {
  initViewer: (ref?: HTMLElement) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
  // getFeatureCategories: () => any;
  // setSelectedFeatures: (features: string[]) => void;
  //getVisibleFeatures: () => Feature[];
};

export const useViewer = (): UseViewerProps => {
  const [viewer, setViewer] = useState<Viewer | null>(viewerStore.get());
  const {
    state: uiState,
    actions: uiActions,
    getCombinedKey,
    getAggregation,
    getScenarioPostfix,
  } = useUi();
  const [lastUiState, setLastUiState] = useState<UiStore>(uiState);
  // const {
  //   state: selectedFeature,
  //   actions: { setSelectedFeature },
  // } = useSelectedFeature();
  const {
    state: filteredFeatures,
    actions: { addFilteredFeatures, updateFilteredFeatures },
  } = useFilteredFeatures();
  const { state: notes, actions: notesActions } = useNotes();
  const {
    state: filterCategories,
    actions: { setFilterCategories },
  } = useFilterCategories();
  const [clickedFeatures, setClickedFeatures] = useState<any[]>([]);

  useEffect(() => {
    return viewerStore.subscribe(setViewer);
  }, []);

  useEffect(() => {
    if (!viewer || !viewer.maplibreMap) {
      return;
    }
    try {
      const {
        selectedYearKey,
        filterButton,
        selectedFilterBuildingOption,
        selectedFilterGridOption,
        showScenario,
        selectedRenovationOption,
        trigger, // use for setSelectedFeature and filteredFeatures since we use the change flag to know if we proceed with this function
      } = uiState;

      const compareTheseKeysFromState = {
        selectedYearKey: true,
        filterButton: true,
        selectedFilterBuildingOption: true,
        selectedFilterGridOption: true,
        showScenario: true,
        selectedRenovationOption: true,
      } as any;

      const uiStateHasChanged = Object.keys(uiState).some(
        (key: string) =>
          // @ts-ignore
          compareTheseKeysFromState[key] && uiState[key] !== lastUiState[key]
      );
      if (!uiStateHasChanged) {
        return;
      }
      console.log('uiState', uiState);
      console.log('last ui state', lastUiState);
      viewer.maplibreMap.setPaintProperty(
        'building',
        'fill-extrusion-color',
        BUILDING_COLOR_LIGHT
      );
      viewer.maplibreMap.setPaintProperty(
        'building-future',
        'fill-extrusion-color',
        BUILDING_COLOR_LIGHT
      );
      // if changing to selection mode, reset filtered features and rerun
      // - to select feature or selection
      if (
        lastUiState.selectedFilterBuildingOption === 'all' &&
        selectedFilterBuildingOption !== 'all'
      ) {
        addFilteredFeatures();
        uiActions.triggerUpdate();
        setLastUiState(uiState);
        return;
      }

      // if changing to aggregation, reset filtered features and rerun
      // - to select aggregation feature
      if (
        filterButton !== 'buildings' &&
        (lastUiState.filterButton !== filterButton ||
          lastUiState.selectedFilterGridOption !== selectedFilterGridOption)
      ) {
        addFilteredFeatures();
        uiActions.triggerUpdate();
        setLastUiState(uiState);
        return;
      }

      // - update building layers visibility
      if (uiState.filterButton === 'buildings') {
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
      }

      // if show scenario
      if (showScenario) {
        // - hide all aggregation layer
        // if (
        //   lastUiState.filterButton !== filterButton ||
        //   lastUiState.selectedFilterBuildingOption !==
        //     selectedFilterBuildingOption ||
        //   lastUiState.selectedFilterGridOption !== selectedFilterGridOption
        // ) {
        //   console.log('hide all aggregation layers');
        AGGREGATION_LAYERS.forEach(layer => {
          viewer.maplibreMap?.setLayoutProperty(layer, 'visibility', 'none');
        });
        // }

        // - show the visible aggregation layer
        if (uiState.filterButton === 'districts') {
          const cityDistrictsName = `cityDistricts`;
          viewer.maplibreMap?.setLayoutProperty(
            `${cityDistrictsName}-fill`,
            'visibility',
            'visible'
          );
          viewer.maplibreMap?.setLayoutProperty(
            `${cityDistrictsName}-line`,
            'visibility',
            'visible'
          );
        } else if (uiState.filterButton === 'baseAreas') {
          const baseAreasName = `baseAreas`;
          viewer.maplibreMap?.setLayoutProperty(
            `${baseAreasName}-fill`,
            'visibility',
            'visible'
          );
          viewer.maplibreMap?.setLayoutProperty(
            `${baseAreasName}-line`,
            'visibility',
            'visible'
          );
        } else if (uiState.filterButton === 'primaryAreas') {
          const primaryAreasName = `primaryAreas`;
          viewer.maplibreMap?.setLayoutProperty(
            `${primaryAreasName}-fill`,
            'visibility',
            'visible'
          );
          viewer.maplibreMap?.setLayoutProperty(
            `${primaryAreasName}-line`,
            'visibility',
            'visible'
          );
        } else if (uiState.filterButton === 'grid') {
          const selectedGrid = uiState.selectedFilterGridOption;
          const gridLayer = `${selectedGrid}`;
          viewer.maplibreMap?.setLayoutProperty(
            `${gridLayer}-fill`,
            'visibility',
            'visible'
          );
          viewer.maplibreMap?.setLayoutProperty(
            `${gridLayer}-line`,
            'visibility',
            'visible'
          );
        }

        // if (selectedFeature) {
        //   const RESET_ALL_BUILDING_FEATURES =
        //     viewer.maplibreMap?.queryRenderedFeatures(undefined, {
        //       layers: ['building', 'building-future'],
        //     });
        //   for (const f of RESET_ALL_BUILDING_FEATURES || []) {
        //     viewer.maplibreMap.setFeatureState(
        //       {
        //         source: 'vectorTiles',
        //         sourceLayer: f.sourceLayer,
        //         id: f.properties.id,
        //       },
        //       {
        //         showScenario: false,
        //       }
        //     );
        //     viewer?.maplibreMap?.setFeatureState(
        //       {
        //         source: 'vectorTiles',
        //         sourceLayer: selectedFeature.sourceLayer,
        //         id: selectedFeature.properties.id,
        //       },
        //       {
        //         showScenario: true,
        //       }
        //     );
        //   }
        // } else {
        // - create category map
        const categories: FilterCategories = filterCategoryKeys.reduce(
          (acc: any, category: string) => {
            acc[category] = {}; // store the category values with a map of uuid of the feature, since id is an int
            return acc;
          },
          {}
        );
        // - know which building features are selected
        const ALL_BUILDING_FEATURES = viewer.maplibreMap?.queryRenderedFeatures(
          undefined,
          {
            layers: ['building', 'building-future'],
          }
        );

        let featureUUIDs = filteredFeatures.featureUUIDs || {};

        // ! I think there is a rule above that reloads if this is true
        // switching fron all to selection required to reset the filtered features
        // since the user must first do a selection
        if (
          lastUiState.selectedFilterBuildingOption === 'all' &&
          selectedFilterBuildingOption === 'selection'
        ) {
          featureUUIDs = {};
        }

        const getShowScenarioFeatureState = (f: any) => {
          // Show all
          if (
            filterButton === 'buildings' &&
            selectedFilterBuildingOption === 'all'
          ) {
            return {
              showScenario: true,
            };
          }
          // Show selection
          if (
            filterButton === 'buildings' &&
            selectedFilterBuildingOption === 'selection'
          ) {
            return {
              showScenario: Boolean(featureUUIDs[f.properties.UUID]),
            };
          }
          // Show single
          if (
            filterButton === 'buildings' &&
            selectedFilterBuildingOption === 'single' &&
            filteredFeatures.features?.length === 1 &&
            f.properties.UUID === filteredFeatures.features[0].properties.UUID
          ) {
            return {
              showScenario: true,
            };
          }

          if (filterButton === 'districts') {
            return {
              showScenario: Boolean(featureUUIDs[f.properties.UUID]),
            };
          }

          if (filterButton === 'baseAreas') {
            return {
              showScenario: Boolean(featureUUIDs[f.properties.UUID]),
            };
          }

          if (filterButton === 'primaryAreas') {
            return {
              showScenario: Boolean(featureUUIDs[f.properties.UUID]),
            };
          }

          if (filterButton === 'grid') {
            return {
              showScenario: Boolean(featureUUIDs[f.properties.UUID]),
            };
          }

          return {
            showScenario: false,
          };
        };

        for (const f of ALL_BUILDING_FEATURES || []) {
          viewer.maplibreMap.setFeatureState(
            {
              source: 'vectorTiles',
              sourceLayer: f.sourceLayer,
              id: f.properties.id,
            },
            getShowScenarioFeatureState(f)
          );

          // - CATEGORIES

          for (const key of filterCategoryKeys) {
            // check if value exists
            if (!f.properties[key]) {
              continue;
            }
            // for each key, the value is another key, and its value is the UUID feature map
            categories[key][f.properties[key]] =
              categories[key][f.properties[key]] || {};
            categories[key][f.properties[key]][f.properties.UUID] = f;
          }
          setFilterCategories(categories);
        }

        // - update filteredFeatures - the aggregation should change if new seletion or new scenario
        if (
          filterButton === 'buildings' &&
          selectedFilterBuildingOption === 'all'
        ) {
          // all buildings aggregations goes into the filter as well
          addFilteredFeatures(ALL_BUILDING_FEATURES, selectedRenovationOption);
        } else if (
          filterButton === 'buildings' &&
          selectedFilterBuildingOption === 'selection'
        ) {
          addFilteredFeatures(
            filteredFeatures.features,
            selectedRenovationOption
          );
        }
        // }
      } else {
        // else do not show scenario
        // addFilteredFeatures();
      }

      if (uiStateHasChanged) {
        console.log('ui state has changed');
        assignMapColors(viewer.maplibreMap, uiState);
      }

      // LASTLY update the local "last uistate"
      setLastUiState(uiState);
    } catch (e) {
      console.log('error', e);
    }
  }, [uiState, filteredFeatures]);

  // useEffect(() => {
  //   if (!viewer || !viewer.maplibreMap) {
  //     return;
  //   }
  //   console.log('effect running for uiState');
  //   const { selectedYearKey, filterButton, selectedFilterBuildingOption } =
  //     uiState;
  //   const featureUUIDs = filteredFeatures.featureUUIDs as {
  //     [UUID: string]: number;
  //   };
  //   // compare lastUiState with uiState
  //   const hasChanged = Object.keys(uiState).some(
  //     // @ts-ignore
  //     (key: string) => uiState[key] !== lastUiState[key]
  //   );
  //   console.log('hasChanged', hasChanged);
  //   if (hasChanged) {
  //     // first assign layout property
  //     // ASSIGN VISIBILITY
  //     // hide all aggregation layers (later set any active to visible)
  //     AGGREGATION_LAYERS.forEach(layer => {
  //       viewer.maplibreMap?.setLayoutProperty(layer, 'visibility', 'none');
  //     });
  //     if (uiState.filterButton === 'buildings') {
  //       viewer.maplibreMap?.setLayoutProperty(
  //         'building',
  //         'visibility',
  //         selectedYearKey === '18' ? 'visible' : 'none'
  //       );
  //       viewer.maplibreMap?.setLayoutProperty(
  //         'building-future',
  //         'visibility',
  //         selectedYearKey === '50' ? 'visible' : 'none'
  //       );
  //     } else if (uiState.filterButton === 'districts') {
  //       const cityDistrictsName = `cityDistricts20${selectedYearKey}`;
  //       // viewer.maplibreMap?.setLayoutProperty(
  //       //   `${cityDistrictsName}-fill`,
  //       //   'visibility',
  //       //   'visible'
  //       // );
  //       viewer.maplibreMap?.setLayoutProperty(
  //         `${cityDistrictsName}-line`,
  //         'visibility',
  //         'visible'
  //       );
  //     } else if (uiState.filterButton === 'baseAreas') {
  //       const baseAreasName = `baseAreas20${selectedYearKey}`;
  //       // viewer.maplibreMap?.setLayoutProperty(
  //       //   `${baseAreasName}-fill`,
  //       //   'visibility',
  //       //   'visible'
  //       // );
  //       viewer.maplibreMap?.setLayoutProperty(
  //         `${baseAreasName}-line`,
  //         'visibility',
  //         'visible'
  //       );
  //     } else if (uiState.filterButton === 'primaryAreas') {
  //       const primaryAreasName = `primaryAreas20${selectedYearKey}`;
  //       // viewer.maplibreMap?.setLayoutProperty(
  //       //   `${primaryAreasName}-fill`,
  //       //   'visibility',
  //       //   'visible'
  //       // );
  //       viewer.maplibreMap?.setLayoutProperty(
  //         `${primaryAreasName}-line`,
  //         'visibility',
  //         'visible'
  //       );
  //     } else if (uiState.filterButton === 'grid') {
  //       const selectedGrid = uiState.selectedFilterGridOption;
  //       const gridLayer = `${selectedGrid}20${selectedYearKey}`;
  //       viewer.maplibreMap?.setLayoutProperty(
  //         `${gridLayer}-line`,
  //         'visibility',
  //         'visible'
  //       );
  //     }

  //     // START SHOW SCENARIO BLOCK
  //     if (uiState.showScenario) {
  //       // UPDATE AVAILABLE CATEGORY OPTIONS FOR FILTER
  //       const shouldFindAllCategories = Boolean(
  //         filterButton === 'buildings' &&
  //           selectedFilterBuildingOption === 'selection' &&
  //           lastUiState.selectedFilterBuildingOption !==
  //             uiState.selectedFilterBuildingOption
  //       );

  //       console.log('shouldFindAllCategories', shouldFindAllCategories);

  //       // Prepare object: categories by key, value and a map of uuids
  //       const categories: FilterCategories = filterCategoryKeys.reduce(
  //         (acc: any, category: string) => {
  //           acc[category] = {}; // store the category values with a map of uuid of the feature, since id is an int
  //           return acc;
  //         },
  //         {}
  //       );

  //       // ASSIGN SELECTED STATE AND ADD TO FILTER
  //       const MAP_FEATURES = viewer.maplibreMap?.queryRenderedFeatures(
  //         undefined,
  //         {
  //           layers: ['building', 'building-future'],
  //         }
  //       );
  //       const nothingSelected = Object.keys(featureUUIDs || {}).length === 0;
  //       console.log('nothingSelected', nothingSelected);

  //       // - FEATURE STATE
  //       for (const f of MAP_FEATURES || []) {
  //         viewer.maplibreMap.setFeatureState(
  //           {
  //             source: 'vectorTiles',
  //             sourceLayer: f.sourceLayer,
  //             id: f.properties.id,
  //           },
  //           {
  //             showScenario: Boolean(
  //               nothingSelected || featureUUIDs[f.properties.UUID]
  //             ),
  //           }
  //         );

  //         // - CATEGORIES

  //         const switchingOnScenario =
  //           uiState.showScenario &&
  //           !lastUiState.showScenario &&
  //           uiState.selectedFilterBuildingOption === 'selection';

  //         if (shouldFindAllCategories || switchingOnScenario) {
  //           for (const key of filterCategoryKeys) {
  //             // check if value exists
  //             if (!f.properties[key]) {
  //               continue;
  //             }
  //             // for each key, the value is another key, and its value is the UUID feature map
  //             categories[key][f.properties[key]] =
  //               categories[key][f.properties[key]] || {};
  //             categories[key][f.properties[key]][f.properties.UUID] = f;
  //           }
  //           setFilterCategories(categories);
  //         }
  //       }

  //       const DISTRICT_FEATURES = viewer.maplibreMap?.queryRenderedFeatures(
  //         undefined,
  //         {
  //           layers: AGGREGATION_LAYERS,
  //         }
  //       );

  //       // for (const f of DISTRICT_FEATURES || []) {
  //       //   viewer.maplibreMap.setFeatureState(
  //       //     {
  //       //       source: 'vectorTiles',
  //       //       sourceLayer: f.sourceLayer,
  //       //       id: f.properties.id,
  //       //     },
  //       //     {
  //       //       showScenario: false,
  //       //     }
  //       //   );
  //       // }

  //       // if scenario turned on, the aggregated feature should be updated for the predictions (since map may be moved)
  //       const scenarioTurnedOn =
  //         uiState.showScenario &&
  //         lastUiState.showScenario !== uiState.showScenario;

  //       // if any of degree, year and renovation has changed the aggregation should be updated for each of the indicators
  //       // note: this is not triggered if indicator is changed since aggregation use all indicators
  //       const scenarioHasChanged =
  //         uiState.selectedYearKey !== lastUiState.selectedYearKey ||
  //         uiState.selectedDegreeKey !== lastUiState.selectedDegreeKey ||
  //         uiState.selectedRenovationOption !==
  //           lastUiState.selectedRenovationOption;

  //       // CHECK IF SCENARIO HAS CHANGED

  //       // for all buildings, add new features from query to the aggregation
  //       if (scenarioHasChanged && selectedFilterBuildingOption === 'all') {
  //         // all buildings aggregations goes into the filter as well
  //         addFilteredFeatures(MAP_FEATURES, uiState.selectedRenovationOption);
  //       } else if (
  //         scenarioHasChanged &&
  //         selectedFilterBuildingOption === 'selection'
  //       ) {
  //         // this is for the existing selection if the scenario is changed (the values needs to be recalculated)
  //         updateFilteredFeatures(uiState.selectedRenovationOption);
  //       } else if (
  //         !filteredFeatures.aggregatedFeature &&
  //         selectedFilterBuildingOption !== 'selection'
  //       ) {
  //         // something must be in predictions if scenario is turned on (except for "selection", because that will display the extra disclosure)
  //         addFilteredFeatures(MAP_FEATURES, uiState.selectedRenovationOption);
  //       }

  //       // CHECK IF FILTER SETTINGS HAS CHANGED
  //       const filterSettingsHasChanged =
  //         uiState.selectedFilterBuildingOption !==
  //         lastUiState.selectedFilterBuildingOption;

  //       if (filterButton === 'buildings' && filterSettingsHasChanged) {
  //         if (selectedFilterBuildingOption === 'all') {
  //           // turn back to default
  //           addFilteredFeatures(MAP_FEATURES, uiState.selectedRenovationOption);
  //         } else if (selectedFilterBuildingOption === 'selection') {
  //           // now the user need to select filter
  //           addFilteredFeatures();
  //         } else if (selectedFilterBuildingOption === 'single') {
  //           // now the user need to select a building
  //           addFilteredFeatures();
  //         }
  //       }
  //     } else {
  //       // if scenario is turned off, remove all features from the filter
  //       addFilteredFeatures();
  //       setSelectedFeature(undefined);
  //     }
  //     // END SHOW SCENARIO BLOCK

  //     // AFTER ASSIGNING THE COLORS - UPDATE VARIOUS STATE
  //     // then assign paint property
  //     // ASSIGN COLORS
  //     assignMapColors(viewer.maplibreMap, uiState);

  //     // LASTLY update the local "last uistate" - since it has changed
  //     setLastUiState(uiState);
  //   }
  // }, [uiState]);

  // useEffect(() => {
  //   if (!viewer) {
  //     return;
  //   }
  //   if (!filteredFeatures) {
  //     // ?
  //     return;
  //   }
  //   const { features } = filteredFeatures;
  //   // for all map features, set feature-state to showScenario false
  //   const MAP_FEATURES = viewer.maplibreMap?.queryRenderedFeatures(undefined, {
  //     layers: ['building', 'building-future'],
  //   });
  //   if (MAP_FEATURES && MAP_FEATURES.length > 0) {
  //     for (const f of MAP_FEATURES) {
  //       viewer.maplibreMap?.setFeatureState(
  //         {
  //           source: 'vectorTiles',
  //           sourceLayer: f.sourceLayer,
  //           id: f.properties.id,
  //         },
  //         {
  //           showScenario: false,
  //         }
  //       );
  //     }
  //   }

  //   if (features && features.length > 0) {
  //     // set feature-state to showScenario on the features
  //     for (const f of features) {
  //       viewer.maplibreMap?.setFeatureState(
  //         {
  //           source: 'vectorTiles',
  //           sourceLayer: f.sourceLayer,
  //           id: f.properties.id,
  //         },
  //         {
  //           showScenario: true,
  //         }
  //       );
  //     }
  //   }
  // }, [filteredFeatures]);

  // SET SELECTED FEATURE (building or aggregation)
  useEffect(() => {
    if (!viewer) {
      return;
    }
    addFilteredFeatures();
    if (
      uiState.filterButton === 'buildings' &&
      (uiState.selectedFilterBuildingOption === 'single' ||
        !uiState.showScenario)
    ) {
      // if filter button is buildings and selected filter is single, then select the building
      if (clickedFeatures && clickedFeatures.length > 0) {
        const feature = clickedFeatures[0];
        if (feature) {
          // setSelectedFeature(feature);
          addFilteredFeatures([feature], uiState.selectedRenovationOption);
          uiActions.triggerUpdate();
        }
      }
    } else if (uiState.filterButton !== 'buildings' && uiState.showScenario) {
      const getAggregationKey = () => {
        const filterButton = uiState.filterButton;
        if (filterButton === 'grid') {
          return uiState.selectedFilterGridOption;
        } else if (filterButton === 'districts') {
          return `cityDistricts`;
        } else if (filterButton === 'baseAreas') {
          return filterButton;
        } else if (filterButton === 'primaryAreas') {
          return filterButton;
        }
        return '';
      };

      const getAggregationLayerId = (aggregationKey: string) => {
        return `${aggregationKey}-fill`;
      };
      // if filter button is aggregation, select the aggregation
      if (clickedFeatures && clickedFeatures.length > 0) {
        const aggregationKey = getAggregationKey();
        const layerId = getAggregationLayerId(aggregationKey);
        const feature = clickedFeatures.find(f => f.layer?.id === layerId);
        if (feature) {
          uiActions.triggerUpdate();
          const ALL_BUILDING_FEATURES =
            viewer.maplibreMap?.queryRenderedFeatures(undefined, {
              layers: ['building', 'building-future'],
            });
          const filteredFeatures = [];
          const aggrId = feature.properties.id;
          for (const f of ALL_BUILDING_FEATURES || []) {
            if (aggrId === f.properties[aggregationKey]) {
              filteredFeatures.push(f);
            }
          }
          addFilteredFeatures(
            filteredFeatures,
            uiState.selectedRenovationOption,
            false,
            feature
          );

          // get all features in the aggregation - for filtered features
        }
      }
    }
    // setSelectedFeature and make sure prediction panel works
  }, [clickedFeatures]);

  const onLoad = useCallback(
    (v: any) => {
      const maplibreMap = v.maplibreMap;
      if (!maplibreMap || viewer) {
        return;
      }
      // ON CLICK
      maplibreMap.on('click', (e: any) => {
        const { point } = e;
        const features = maplibreMap?.queryRenderedFeatures(point, undefined);
        setClickedFeatures(features || []);
      });
    },
    [viewer, uiState]
  );

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

  const getActiveBuildingLayer = () => {
    const buildingLayer =
      uiState.selectedYearKey === '18' ? 'building' : 'building-future';

    return buildingLayer;
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
              onLoad,
            },
            Object.assign({}, maplibreOptions, {
              container: ref,
            }) as any
          )
        );
      },
      viewer,
      viewerLoading: false,
      // getFeatureCategories: () => {
      //   if (viewer) {
      //     const buildingLayer = getActiveBuildingLayer();
      //     console.log('query', buildingLayer);
      //     const features = viewer.maplibreMap?.queryRenderedFeatures(
      //       undefined,
      //       { layers: [buildingLayer] }
      //     );
      //     const categories = features?.reduce((acc, feature) => {
      //       const around50percentChance = Boolean(Math.random() > 0.5);
      //       // viewer.maplibreMap?.setFeatureState(
      //       //   {
      //       //     source: 'vectorTiles',
      //       //     sourceLayer: buildingLayer,
      //       //     id: feature.properties.id,
      //       //   },
      //       //   // { selected: Boolean(filteredFeatures[feature.properties.id]) }
      //       //   { selected: around50percentChance }
      //       // );
      //       // viewer.maplibreMap?.setFeatureState(
      //       //   {
      //       //     source: 'vectorTiles',
      //       //     sourceLayer: buildingLayer,
      //       //     id: feature.properties.id,
      //       //   },
      //       //   { selected: false }
      //       // );
      //       console.log('feature', feature);
      //       const { properties } = feature;
      //       if (properties.bt) {
      //         acc['building_purpose'] = acc['building_purpose'] || {};
      //         acc['building_purpose'][properties.bt] =
      //           acc['building_purpose'][properties.bt] || {};
      //         acc['building_purpose'][properties.bt][feature.properties.id] =
      //           feature;
      //       } else if (properties.hs) {
      //         acc['hs'] = acc['hs'] || {};
      //         acc['hs'][properties.hs] = acc['hs'][properties.hs] || {};
      //         acc['hs'][properties.hs][feature.properties.id] = feature;
      //       } else if (properties.own) {
      //         acc['own'] = acc['own'] || {};
      //         acc['own'][properties.own] = acc['own'][properties.own] || {};
      //         acc['own'][properties.own][feature.properties.id] = feature;
      //       }
      //       return acc;
      //     }, {} as any);
      //     return categories;
      //   }
      //   return [];
      // },
      // setSelectedFeatures: (ids: string[]) => {
      //   if (!viewer) return;
      //   console.log('set ids', ids);
      //   // const features = viewer.maplibreMap?.queryRenderedFeatures(undefined, {
      //   //   layers: ['building', 'building-future'],
      //   // });

      //   // const key = getCombinedKey();

      //   for (const buildingId of ids) {
      //     viewer?.maplibreMap?.setFeatureState(
      //       {
      //         source: 'vectorTiles',
      //         sourceLayer: 'building',
      //         id: buildingId,
      //       },
      //       { selected: false }
      //     );
      //     viewer?.maplibreMap?.setFeatureState(
      //       {
      //         source: 'vectorTiles',
      //         sourceLayer: 'building-future',
      //         id: buildingId,
      //       },
      //       { selected: false }
      //     );
      //   }

      //   // const paintProperty = [
      //   //   'case',
      //   //   ['boolean', ['feature-state', 'selected'], false],
      //   //   DEFAULT_BUILDING_HOVER_COLOR,
      //   //   ['get', `${key}_bcol`],
      //   // ];

      //   // viewer.maplibreMap?.setPaintProperty(
      //   //   'building',
      //   //   'fill-extrusion-color',
      //   //   paintProperty
      //   // );

      //   // set all to selecded: false

      //   // for (const feature of features || []) {
      //   //   viewer?.maplibreMap?.setFeatureState(
      //   //     {
      //   //       source: 'vectorTiles',
      //   //       sourceLayer: 'building',
      //   //       id: feature.id,
      //   //     },
      //   //     { selected: false }
      //   //   );
      //   //   viewer?.maplibreMap?.setFeatureState(
      //   //     {
      //   //       source: 'vectorTiles',
      //   //       sourceLayer: 'building-future',
      //   //       id: feature.id,
      //   //     },
      //   //     { selected: false }
      //   //   );
      //   // }

      //   // for (const id of ids) {
      //   //   viewer?.maplibreMap?.setFeatureState(
      //   //     {
      //   //       source: 'vectorTiles',
      //   //       sourceLayer: 'building',
      //   //       id,
      //   //     },
      //   //     { selected: true }
      //   //   );
      //   //   viewer?.maplibreMap?.setFeatureState(
      //   //     {
      //   //       source: 'vectorTiles',
      //   //       sourceLayer: 'building-future',
      //   //       id,
      //   //     },
      //   //     { selected: true }
      //   //   );
      //   // }
      // },
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
