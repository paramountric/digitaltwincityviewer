import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

type FeatureFilter = {
  [featureId: string]: any; // feature
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
      setFilteredFeatures: (updatedFilter: FeatureFilter) =>
        filteredFeaturesStore.set({ ...filteredFeatures, ...updatedFilter }),
      getFilteredFeatures: () => filteredFeaturesStore.get(),
    };
  }, []);

  return {
    state: filteredFeatures,
    actions,
  };
};

export { useFilteredFeatures };
