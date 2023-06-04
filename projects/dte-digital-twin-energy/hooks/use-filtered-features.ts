import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';
import { propertyKeys, degreeKeys } from '../lib/constants';
import { UiStore } from './use-ui';

type FeatureFilter = {
  featureIds?: number[];
  aggregatedFeature?: any;
  featureUUIDs?: {
    [UUID: string]: number; // uuid to id map
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

  // must aggregate all properties with all years
  const aggregateFeatures = (
    renovationOption: string,
    features: any[],
    existingAggregatedFeature?: any
  ) => {
    const aggregatedFeature = features.reduce((acc: any, feature: any) => {
      const { hfa } = feature.properties;
      if (hfa && typeof hfa === 'number') {
        acc.properties.hfa += hfa;
      }
      acc.properties.numFeatures += 1;
      propertyKeys.forEach(pKey => {
        degreeKeys.forEach(dKey => {
          const yearKey = dKey === '0' ? '18' : '50';
          // note that zero is for year 18, that has the same values for all degrees - 25 is used here
          const degreeKey = dKey === '0' ? '25' : dKey;
          const scenarioKey = `${pKey}${yearKey}_${degreeKey}_${renovationOption}`;
          const value = feature.properties[scenarioKey];
          if (value) {
            acc.properties[scenarioKey] =
              (acc.properties[scenarioKey] || 0) + value;
          }
        });
      });
      return acc;
    }, existingAggregatedFeature);
    return aggregatedFeature;
  };

  const actions = useMemo(() => {
    return {
      // add more features to the store (aggregate more)
      addFilteredFeatures: (features?: any[], renovationOption = 'ref') => {
        if (!features) {
          filteredFeaturesStore.set({});
          return;
        }
        const featureIds = features.map((feature: any) => feature.id);
        const featureUUIDs = features.reduce((acc: any, feature: any) => {
          acc[feature.properties.uuid] = feature.id;
          return acc;
        }, {});
        const existingAggregatedFeature =
          filteredFeatures.aggregatedFeature || {
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
          };
        const aggregatedFeature = aggregateFeatures(
          renovationOption,
          features,
          existingAggregatedFeature
        );
        console.log(aggregatedFeature, 'aggregatedFeature');
        // add to existing state
        const updatedFilter = {
          featureIds: [...(filteredFeatures.featureIds || []), ...featureIds],
          aggregatedFeature,
          featureUUIDs: {
            ...(filteredFeatures.featureUUIDs || {}),
            ...featureUUIDs,
          },
          features, // to be able to update with new postfix
        };

        filteredFeaturesStore.set(updatedFilter);
      },
      updateFilteredFeatures: (renovationOption = 'ref') => {
        if (!filteredFeatures.features || !filteredFeatures.features.length) {
          return;
        }
        const existingFeatures = filteredFeatures.features;
        const featureIds = existingFeatures.map((feature: any) => feature.id);
        const featureUUIDs = existingFeatures.reduce(
          (acc: any, feature: any) => {
            acc[feature.properties.uuid] = feature.id;
            return acc;
          },
          {}
        );
        const existingAggregatedFeature =
          filteredFeatures.aggregatedFeature || {
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
          };
        const aggregatedFeature = aggregateFeatures(
          renovationOption,
          existingFeatures,
          existingAggregatedFeature
        );
        // add to existing state
        const updatedFilter = {
          featureIds: [...(filteredFeatures.featureIds || []), ...featureIds],
          aggregatedFeature,
          featureUUIDs: {
            ...(filteredFeatures.featureUUIDs || {}),
            ...featureUUIDs,
          },
          features: existingFeatures, // to be able to update with new postfix
        };
        filteredFeaturesStore.set(updatedFilter);
      },
      getFilteredFeatures: () => filteredFeaturesStore.get(),
    };
  }, []);

  return {
    state: filteredFeatures,
    actions,
  };
};

export { useFilteredFeatures };
