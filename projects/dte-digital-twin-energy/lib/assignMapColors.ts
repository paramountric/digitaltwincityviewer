import { UiStore } from '../hooks/use-ui';
import { AGGREGATION_LAYERS } from '../hooks/use-viewer';

const DEFAULT_BUILDING_COLOR = 'rgb(200, 200, 200)';
const BUILDING_COLOR_LIGHT = 'rgb(255, 255, 255)';

export function assignMapColors(map: any, uiStore: UiStore) {
  console.log('assign colors');
  const {
    showScenario,
    selectedYearKey,
    selectedDegreeKey,
    selectedRenovationOption,
    filterButton,
  } = uiStore;
  if (showScenario) {
    const key = getCombinedKey(uiStore);
    try {
      map.setPaintProperty('building', 'fill-extrusion-color', [
        'case',
        ['boolean', ['feature-state', 'showScenario'], true],
        ['get', `${key}_bcol`],
        BUILDING_COLOR_LIGHT,
      ]);
    } catch (e) {
      console.log('current city set paint error', e);
    }
    try {
      map.setPaintProperty('building-future', 'fill-extrusion-color', [
        'case',
        ['boolean', ['feature-state', 'showScenario'], true],
        ['get', `${key}_bcol`],
        BUILDING_COLOR_LIGHT,
      ]);
    } catch (e) {
      console.log('future city set paint error', e);
    }
    // try {
    //   AGGREGATION_LAYERS.forEach(layer => {
    //     map.setPaintProperty(layer, 'fill-color', [
    //       'case',
    //       ['boolean', ['feature-state', 'showScenario'], true],
    //       ['get', `${key}_bcol`],
    //       BUILDING_COLOR_LIGHT,
    //     ]);
    //   });
    // } catch (e) {
    //   console.log('aggregation layer set paint error', e);
    // }
  } else {
    try {
      map.setPaintProperty(
        'building',
        'fill-extrusion-color',
        DEFAULT_BUILDING_COLOR
      );
    } catch (e) {
      console.log('current city set paint error', e);
    }
    try {
      map.setPaintProperty(
        'building-future',
        'fill-extrusion-color',
        DEFAULT_BUILDING_COLOR
      );
    } catch (e) {
      console.log('future city set paint error', e);
    }
    // try {
    //   AGGREGATION_LAYERS.forEach(layer => {
    //     map.setPaintProperty(layer, 'fill-color', DEFAULT_BUILDING_COLOR);
    //   });
    // } catch (e) {
    //   console.log('aggregation layer set paint error', e);
    // }
  }
}

function getCombinedKey(uiState: UiStore) {
  const {
    selectedPropertyKey,
    selectedDegreeKey,
    selectedYearKey,
    selectedRenovationOption,
  } = uiState;
  const renovationOptionKey = `_${selectedRenovationOption}`;

  const indicatorKeyToUse = selectedPropertyKey;

  // all the 18 keys are the same for all the degrees
  if (selectedDegreeKey === '0') {
    return `${indicatorKeyToUse}18_25${renovationOptionKey}`;
  }

  if (selectedYearKey === '18') {
    return `${indicatorKeyToUse}18_${selectedDegreeKey}${renovationOptionKey}`;
  }

  console.log(
    'combined key',
    `${indicatorKeyToUse}50_${selectedDegreeKey}${renovationOptionKey}`
  );
  // for all the other degrees the 50 is used
  return `${indicatorKeyToUse}50_${selectedDegreeKey}${renovationOptionKey}`;
}

// TOP BAR EFFECT (select indicator)
// useEffect(() => {
//   if (!viewer || !uiState.showScenario) {
//     return;
//   }
//   setAllBuildingsIndicatorColor();
// }, [
//   uiState.selectedPropertyKey,
//   uiState.selectedYearKey,
//   uiState.selectedDegreeKey,
//   uiState.selectedRenovationOption,
// ]);

// // CHANGE CURRENT OR FUTURE CITY
// useEffect(() => {
//   if (!viewer) {
//     return;
//   }
//   const { selectedYearKey } = uiState;
//   viewer.maplibreMap?.setLayoutProperty(
//     'building',
//     'visibility',
//     selectedYearKey === '18' ? 'visible' : 'none'
//   );
//   viewer.maplibreMap?.setLayoutProperty(
//     'building-future',
//     'visibility',
//     selectedYearKey === '50' ? 'visible' : 'none'
//   );
// }, [uiState.selectedYearKey]);

// Toggle scenario
// useEffect(() => {
//   if (!viewer) {
//     return;
//   }
//   const { showScenario } = uiState;
//   if (showScenario) {
//     setAllBuildingsIndicatorColor();
//     // query all features on the map
//     const features = viewer.maplibreMap?.queryRenderedFeatures(undefined, {
//       layers: [getActiveBuildingLayer()],
//     }) as any;
//     setFilteredFeatures(features);
//   } else {
//     setAllBuildingsGray();
//     setFilteredFeatures([]);
//   }
// }, [uiState.showScenario]);

// QUERY FEATURES
// useEffect(() => {
//   if (!viewer) {
//     return;
//   }
//   console.log('selecedfeatures', filteredFeatures);
//   if (filteredFeatures && Object.keys(filteredFeatures).length > 0) {
//     console.log('trigger update colors', Object.keys(filteredFeatures));
//     // setAllBuildingsColor(
//     //   Object.keys(filteredFeatures),
//     //   'rgb(255, 255, 255)',
//     //   'rgb(0,0,0)'
//     // );
//   }

// setAllBuildingSelectedFeatureState(false);
// const buildingLayer = getActiveBuildingLayer();
// console.log('query');
// const features = viewer.maplibreMap?.queryRenderedFeatures(undefined, {
//   layers: [buildingLayer],
// }) as any;
// for (const feature of features) {
//   const around50percentChance = Boolean(Math.random() > 0.5);
//   viewer.maplibreMap?.setFeatureState(
//     {
//       source: 'vectorTiles',
//       sourceLayer: buildingLayer,
//       id: feature.properties.id,
//     },
//     // { selected: Boolean(filteredFeatures[feature.properties.id]) }
//     { selected: around50percentChance }
//   );
// }
// }, [filteredFeatures]);

// SELECTED SINGLE FEATURE
// useEffect(() => {
//   if (!viewer) {
//     return;
//   }
//   if (lastSelectedFeature) {
//     viewer.maplibreMap?.setPaintProperty(
//       'building',
//       'fill-extrusion-color',
//       SELECTED_BUILDING_PAINT_PROPERTY
//     );
//   }
//   if (selectedFeature) {
//     const key = getCombinedKey();
//     setLastSelectedFeature(selectedFeature);
//   }
// }, [selectedFeature]);

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
// useEffect(() => {
//   // if (!viewer) {
//   //   return;
//   // }
//   // const { filterButton } = uiState;
//   // if (filterButton === 'buildings') {
//   //   // use the selectedFilterBuildingOption effect
//   //   // set back any district or grid
//   //   return;
//   // }
//   // console.log('for aggregation', filterButton);
// }, [uiState.filterButton]);

// filter of buildings (all, selection, one)
// useEffect(() => {
//   if (!viewer) {
//     return;
//   }
//   const { selectedFilterBuildingOption, filterButton } = uiState;
//   if (filterButton !== 'buildings') {
//     // another button trigg
//     return;
//   }
//   if (selectedFilterBuildingOption === 'all') {
//     // set back to default scenario color
//     // setAllBuildingsIndicatorColor();
//     return;
//   }
// setAllBuildingsWhite();
// the query will run in separate effect to collect the features of the query and set feature state
// }, [uiState.selectedFilterBuildingOption]);

// GRID QUERY
// useEffect(() => {
// if (!viewer) {
//   return;
// }
// const { selectedFilterGridOption, filterButton } = uiState;
// if (filterButton !== 'grid') {
//   // another button trigg
//   return;
// }
// console.log(
//   'now the filter grid option should be used',
//   selectedFilterGridOption
// );
// }, [uiState.selectedFilterGridOption]);

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

// const setAllBuildingsColor = (
//   selectedIds: string[],
//   colorSelected: string,
//   colorDefault: string
// ) => {
//   if (!viewer) {
//     return;
//   }
//   const buildingLayer = getActiveBuildingLayer();
//   console.log(selectedIds.length);
//   const selectedIdsNotNull = selectedIds.filter(id => id !== null);
//   console.log(selectedIdsNotNull.length);
//   viewer.maplibreMap?.setPaintProperty(
//     buildingLayer,
//     'fill-extrusion-color',
//     ['match', ['get', 'id'], selectedIdsNotNull, colorDefault, colorSelected]
//   );
// };

// const getActiveBuildingLayer = () => {
//   const buildingLayer =
//     uiState.selectedYearKey === '18' ? 'building' : 'building-future';

//   return buildingLayer;
// };

// const setAllBuildingSelectedFeatureState = (selected: boolean) => {
//   if (!viewer) {
//     return;
//   }
//   const buildingLayer = getActiveBuildingLayer();
//   const features = viewer.maplibreMap?.queryRenderedFeatures(undefined, {
//     layers: [buildingLayer],
//   });
//   for (const f of (features || []) as any) {
//     viewer.maplibreMap?.setFeatureState(
//       {
//         source: f.source,
//         sourceLayer: f.sourceLayer,
//         id: f.id,
//       },
//       { selected: selected }
//     );
//   }
// };

// INDICATOR COLOR
// const setAllBuildingsIndicatorColor = () => {
//   if (!viewer) {
//     return;
//   }
//   if (!uiState.showScenario) {
//     // set back to gray scenario color
//     setAllBuildingsGray();
//     return;
//   }
//   const key = getCombinedKey();
//   viewer.maplibreMap?.setPaintProperty('building', 'fill-extrusion-color', [
//     'get',
//     `${key}_bcol`,
//   ]);
//   viewer.maplibreMap?.setPaintProperty(
//     'building-future',
//     'fill-extrusion-color',
//     ['get', `${key}_bcol`]
//   );
// viewer.maplibreMap?.setPaintProperty('building', 'fill-extrusion-color', [
//   'case',
//   ['boolean', ['feature-state', 'selected'], true],
//   ['get', `${key}_bcol`],
//   DEFAULT_BUILDING_COLOR,
// ]);
// viewer.maplibreMap?.setPaintProperty(
//   'building-future',
//   'fill-extrusion-color',
//   [
//     'case',
//     ['boolean', ['feature-state', 'selected'], true],
//     ['get', `${key}_bcol`],
//     DEFAULT_BUILDING_COLOR,
//   ]
// );
// };

// const setAllBuildingsGray = () => {
//   if (!viewer) {
//     return;
//   }
//   // const buildingLayer = getActiveBuildingLayer();
//   // const filterExpression = ['==', 'selected', 'yes'];
//   viewer.maplibreMap?.setPaintProperty(
//     'building',
//     'fill-extrusion-color',
//     BUILDING_PAINT_PROPERTY
//   );
//   viewer.maplibreMap?.setPaintProperty(
//     'building-future',
//     'fill-extrusion-color',
//     BUILDING_PAINT_PROPERTY
//   );
// };

// const setAllBuildingsWhite = () => {
//   if (!viewer) {
//     return;
//   }
// const buildingLayer = getActiveBuildingLayer();
// const filterExpression = ['==', 'selected', 'yes'];
// viewer.maplibreMap?.setPaintProperty(
//   'building',
//   'fill-extrusion-color',
//   BUILDING_PAINT_PROPERTY_WHITE
// );
// viewer.maplibreMap?.setPaintProperty(
//   'building-future',
//   'fill-extrusion-color',
//   BUILDING_PAINT_PROPERTY_WHITE
// );
// };

// const handleSetSelectedFeature = useCallback(
//   (feature: any) => {
//     setSelectedFeature(feature);
//     if (
//       uiState.filterButton === 'buildings' &&
//       uiState.selectedFilterBuildingOption !== 'selection'
//     ) {
//       uiActions.setSelectedFilterBuildingOption('single');
//     }
//   },
//   [uiState]
// );

// const setAllBuildingsTransparency = (transparency: number) => {
//   if (!viewer) {
//     return;
//   }
//   const buildingLayer = getActiveBuildingLayer();
//   const filterExpression = ['==', 'selected', 'yes'];
//   // viewer.maplibreMap?.setPaintProperty(
//   //   buildingLayer,
//   //   'fill-extrusion-color',
//   //   BUILDING_PAINT_PROPERTY_LIGHT
//   // );
//   viewer.maplibreMap?.setPaintProperty(
//     buildingLayer,
//     'fill-extrusion-opacity',
//     0.5
//     // ['case', filterExpression, 1, 0.3]
//   );
// };

//// OLDER CODE BELOW

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
