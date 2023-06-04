import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

type FeatureFilter = {
  featureIds?: number[];
  aggregatedFeature?: any;
  featureUUIDs?: {
    [UUID: string]: number; // uuid to id map
  };
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

  const actions = useMemo(() => {
    return {
      setFilteredFeatures: (features?: any[]) => {
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
              de: 0,
              fe: 0,
              ge: 0,
              hd: 0,
              cd: 0,
              pe: 0,
            },
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [0, 0],
            },
          };
        const aggregatedFeature = features.reduce((acc: any, feature: any) => {
          const { hfa, de, fe, ge, hd, cd, pe } = feature;
          acc.properties.hfa += hfa;
          acc.properties.numFeatures += 1;
          acc.properties.de += de;
          acc.properties.fe += fe;
          acc.properties.ge += ge;
          acc.properties.hd += hd;
          acc.properties.cd += cd;
          acc.properties.pe += pe;
          return acc;
        }, existingAggregatedFeature);
        // add to existing state
        const updatedFilter = {
          featureIds: [...(filteredFeatures.featureIds || []), ...featureIds],
          aggregatedFeature,
          featureUUIDs: {
            ...(filteredFeatures.featureUUIDs || {}),
            ...featureUUIDs,
          },
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
