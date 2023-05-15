import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

const selectedFeatureStore = new Observable<any | null>(null);

const useSelectedFeature = () => {
  const [feature, setFeature] = useState<any | null>(
    selectedFeatureStore.get()
  );

  useEffect(() => {
    return selectedFeatureStore.subscribe(setFeature);
  }, []);

  const actions = useMemo(() => {
    return {
      setSelectedFeature: (feature: any | null) =>
        selectedFeatureStore.set(feature),
      getSelectedFeature: () => selectedFeatureStore.get(),
    };
  }, []);

  return {
    state: feature,
    actions,
  };
};

export { useSelectedFeature };
