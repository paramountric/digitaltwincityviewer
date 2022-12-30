import {Feature} from '@dtcv/geojson';
import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';

const selectedFeatureStore = new Observable<Feature | null>(null);

const useSelectedFeature = () => {
  const [feature, setFeature] = useState<Feature | null>(
    selectedFeatureStore.get()
  );

  useEffect(() => {
    return selectedFeatureStore.subscribe(setFeature);
  }, []);

  const actions = useMemo(() => {
    return {
      setSelectedFeature: (feature: Feature | null) =>
        selectedFeatureStore.set(feature),
      getSelectedFeature: () => selectedFeatureStore.get(),
    };
  }, []);

  return {
    state: feature,
    actions,
  };
};

export {useSelectedFeature};
