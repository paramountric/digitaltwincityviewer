import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

type FeatureFilter = {
  featureIds?: number[];
  aggregatedFeature?: any;
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
        const aggregatedFeature = features.reduce(
          (acc: any, feature: any) => {
            const { de, fe, ge, hd, cd, pe } = feature;
            acc.properties.de += de;
            acc.properties.fe += fe;
            acc.properties.ge += ge;
            acc.properties.hd += hd;
            acc.properties.cd += cd;
            acc.properties.pe += pe;
            return acc;
          },
          {
            properties: {
              id: 'aggregatedFeature',
              de: 0,
              fe: 0,
              ge: 0,
              hd: 0,
              cd: 0,
              pe: 0,
            },
          }
        );
        const updatedFilter = {
          featureIds,
          aggregatedFeature,
        };

        filteredFeaturesStore.set({ ...filteredFeatures, ...updatedFilter });
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
