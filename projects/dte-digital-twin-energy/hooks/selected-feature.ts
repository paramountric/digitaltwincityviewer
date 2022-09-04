import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';

const featureIdStore = new Observable<string | null>(null);

const useSelectedFeature = () => {
  const [featureId, setFeatureId] = useState(featureIdStore.get());

  useEffect(() => {
    return featureIdStore.subscribe(setFeatureId);
  }, []);

  const actions = useMemo(() => {
    return {
      setFeatureId: (id: string) => featureIdStore.set(id),
    };
  }, []);

  return {
    state: featureId,
    actions,
  };
};

export {useSelectedFeature};
