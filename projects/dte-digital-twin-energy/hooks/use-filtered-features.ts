import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';
import {
  propertyKeys,
  degreeKeys,
  filterCategoryKeys,
  renovationKeys,
} from '../lib/constants';

const filteredCategoriesPlusConstructionYear = ['cy', ...filterCategoryKeys];

type FeatureFilter = {
  featureIds?: number[];
  aggregatedFeature?: any;
  featureUUIDs?: {
    [UUID: string]: number; // UUID to id map
  };
  features?: any[];
};
const filteredFeaturesStore = new Observable<FeatureFilter>({});

const useFilteredFeatures = () => {
  const [filteredFeatures, setFilteredFeatures] = useState<FeatureFilter>(
    filteredFeaturesStore.get()
  );

  useEffect(() => {
    return filteredFeaturesStore.subscribe(setFilteredFeatures);
  }, []);

  useEffect(() => {}, [filteredFeatures]);

  const aggregateFilterCategoryValue = (aggr: any, key: string, value: any) => {
    if (!aggr[key]) {
      aggr[key] = {};
    }
    if (key === 'cy') {
      aggr[key].min = Math.min(aggr[key].min || Infinity, Number(value));
      aggr[key].max = Math.max(aggr[key].max || -Infinity, Number(value));
    } else {
      // store each string value only once
      aggr[key][value] = true;
    }
  };

  // must aggregate all properties with all years
  const aggregateFeatures = (
    features: any[],
    // these are for renovation
    scenarioKey = 'energy',
    yearKey = '18'
  ) => {
    const filterCategoryAggregation = {} as any;
    const aggregatedFeature = features.reduce(
      (acc: any, feature: any) => {
        const { hfa } = feature.properties;
        if (hfa && typeof hfa === 'number') {
          acc.properties.hfa += hfa;
        }
        for (const filterCategoryKey of filteredCategoriesPlusConstructionYear) {
          const filterCategoryValue = feature.properties[filterCategoryKey];
          if (filterCategoryValue) {
            aggregateFilterCategoryValue(
              filterCategoryAggregation,
              filterCategoryKey,
              filterCategoryValue
            );
          }
        }
        acc.properties.numFeatures += 1;
        if (scenarioKey === 'renovation') {
          propertyKeys.forEach(pKey => {
            renovationKeys.forEach(rKey => {
              // renovation are all on 2.5 degrees
              const degreeKey = '25';
              const renovationKey = `${pKey}${yearKey}_${degreeKey}_${rKey}`;
              const value = feature.properties[renovationKey];
              if (value) {
                acc.properties[renovationKey] =
                  (acc.properties[renovationKey] || 0) + value;
              }
            });
          });
        } else {
          propertyKeys.forEach(pKey => {
            degreeKeys.forEach(dKey => {
              const scenarioYearKey = dKey === '0' ? '18' : '50';
              // note that zero is for year 18, that has the same values for all degrees - 25 is used here
              const degreeKey = dKey === '0' ? '25' : dKey;
              const scenarioKey = `${pKey}${scenarioYearKey}_${degreeKey}_ref`;
              const value = feature.properties[scenarioKey];
              if (value) {
                acc.properties[scenarioKey] =
                  (acc.properties[scenarioKey] || 0) + value;
              }
            });
          });
        }
        return acc;
      },
      {
        properties: {
          id: 'aggregatedFeature',
          numFeatures: 0,
          hfa: 0,
        },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      }
    );
    for (const key of Object.keys(filterCategoryAggregation)) {
      if (key === 'cy') {
        const { min, max } = filterCategoryAggregation[key];
        aggregatedFeature.properties[key] = `${min}-${max}`;
      } else {
        aggregatedFeature.properties[key] = Object.keys(
          filterCategoryAggregation[key]
        );
      }
    }
    return aggregatedFeature;
  };

  const actions = useMemo(() => {
    return {
      // add more features to the store (aggregate more)
      addFilteredFeatures: (
        features?: any[],
        scenarioKey = 'energy',
        yearKey = '18',
        removePrevious = false,
        featureToMerge?: any // optional feature to merge with aggregated feature (just name for now)
      ) => {
        if (!features) {
          filteredFeaturesStore.set({});
          return;
        }
        if (features.length === 0) {
          filteredFeaturesStore.set({
            featureIds: [],
            aggregatedFeature: null,
            featureUUIDs: {},
            features: [],
          });
          return;
        }
        if (features.length === 1) {
          filteredFeaturesStore.set({
            featureIds: [features[0].id],
            aggregatedFeature: features[0],
            featureUUIDs: {
              [features[0].properties.UUID]: features[0].id,
            },
            features,
          });
          return;
        }
        const state = filteredFeaturesStore.get();
        const existingUUIDs =
          state.featureUUIDs && !removePrevious ? state.featureUUIDs : {};
        const existingFeatures =
          state.features && !removePrevious ? state.features : [];
        const existingFeatureIds =
          state.featureIds && !removePrevious ? state.featureIds : [];
        const newFeatures = features;
        // .filter(
        //   (feature: any) => !existingUUIDs[feature.properties.UUID]
        // );
        const newFeatureIds = newFeatures.map((feature: any) => feature.id);
        // add UUIDs to existing map so the aggregation can be done without duplicates
        const newFeatureUUIDs = newFeatures.reduce((acc: any, feature: any) => {
          acc[feature.properties.UUID] = feature.id;
          return acc;
        }, existingUUIDs || {});

        const allFeatures = [...existingFeatures, ...newFeatures];

        console.log('aggregate features', scenarioKey, yearKey);

        const aggregatedFeature = aggregateFeatures(
          allFeatures,
          scenarioKey,
          yearKey
        );
        if (featureToMerge) {
          aggregatedFeature.properties.name = featureToMerge.properties.name;
        }
        // add to existing state
        const updatedFilter = {
          featureIds: [...existingFeatureIds, ...newFeatureIds],
          aggregatedFeature,
          featureUUIDs: {
            ...(state.featureUUIDs || {}),
            ...newFeatureUUIDs,
          },
          features: allFeatures, // to be able to update with new postfix
        };

        filteredFeaturesStore.set(updatedFilter);
      },
      removeFilteredFeatures: (
        features?: any[],
        scenarioKey = 'energy',
        yearKey = '18'
      ) => {
        if (!features) {
          filteredFeaturesStore.set({});
          return;
        }
        const state = filteredFeaturesStore.get();
        const existingFeatures = state.features || [];
        const removeUUIDs = features.reduce((acc: any, feature: any) => {
          acc[feature.properties.UUID] = feature.id;
          return acc;
        }, {});
        const withoutFeatures = existingFeatures.filter(
          (feature: any) => !removeUUIDs[feature.properties.UUID]
        );
        if (!withoutFeatures.length) {
          filteredFeaturesStore.set({});
          return;
        }
        const newUUIDs = withoutFeatures.reduce((acc: any, feature: any) => {
          acc[feature.properties.UUID] = feature.id;
          return acc;
        }, {});
        const newFeatureIds = withoutFeatures.map((feature: any) => feature.id);

        const aggregatedFeature = aggregateFeatures(
          withoutFeatures,
          scenarioKey,
          yearKey
        );
        // add to existing state
        const updatedFilter = {
          featureIds: newFeatureIds,
          aggregatedFeature,
          featureUUIDs: newUUIDs,
          features: withoutFeatures, // to be able to update with new postfix
        };

        filteredFeaturesStore.set(updatedFilter);
      },
      // reuses existing features and re-aggregates them with new settings
      updateFilteredFeatures: (scenarioKey = 'energy', yearKey = '18') => {
        if (!filteredFeatures.features || !filteredFeatures.features.length) {
          return;
        }
        const aggregatedFeature = aggregateFeatures(
          filteredFeatures.features,
          scenarioKey,
          yearKey
        );
        // add to existing state
        const updatedFilter = {
          featureIds: filteredFeatures.featureIds,
          aggregatedFeature,
          featureUUIDs: filteredFeatures.featureUUIDs,
          features: filteredFeatures.features,
        };
        filteredFeaturesStore.set(updatedFilter);
      },
      getFilteredFeatures: () => filteredFeaturesStore.get(),
      getSelectedFeature: () => {
        // if only one feature exist in the store, return it other wise return null
        const state = filteredFeaturesStore.get();
        if (state.features && state.features.length === 1) {
          return state.features[0];
        }
        return null;
      },
    };
  }, [filteredFeatures]);

  return {
    state: filteredFeatures,
    actions,
  };
};

export { useFilteredFeatures };
