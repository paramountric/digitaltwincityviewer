import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';
import BucketObjectLoader from '../lib/BucketObjectLoader';

export type BucketObjectStore = {
  [objectId: string]: BucketObjectLoader;
};

export type BucketLoadingProgressStore = {
  [objectId: string]: number;
};

const bucketObjectStore = new Observable<BucketObjectStore>({});
const bucketLoadingProgressStore = new Observable<BucketLoadingProgressStore>(
  {}
);

// todo: create store with object loader state and objects by id
// all relevant loaded objects must be import into the graph as needed
// load object to see how the structure looks
export const useObjects = () => {
  const [state, setState] = useState(bucketObjectStore.get());
  const [loadingState, setLoadingState] = useState(
    bucketLoadingProgressStore.get()
  );

  useEffect(() => {
    return bucketObjectStore.subscribe(setState);
  }, []);

  useEffect(() => {
    return bucketLoadingProgressStore.subscribe(setLoadingState);
  }, []);

  const actions = useMemo(() => {
    return {
      loadBucket: async (
        streamId: string,
        commitId: string,
        objectId: string,
        token: string
      ) => {
        if (state[objectId]) {
          console.log('returned cache for ', objectId);
          return state[objectId];
        }
        const bucketLoader = new BucketObjectLoader(
          streamId,
          commitId,
          objectId,
          token
        );
        bucketObjectStore.set({ ...state, [objectId]: bucketLoader });
        await bucketLoader.load((loadingProgress: number) => {
          bucketLoadingProgressStore.set({
            ...loadingState,
            [objectId]: loadingProgress * 100,
          });
          if (loadingProgress === 1) {
          }
        });
        return bucketLoader;
      },
      unloadBucket: (objectId: string) => {
        delete state[objectId];
        bucketObjectStore.set(state);
      },
      getBucketLoader: (objectId: string) => {
        const store = bucketObjectStore.get();
        return store[objectId] || null;
      },
    };
  }, [state]);
  return {
    state,
    loadingState,
    actions,
  };
};
