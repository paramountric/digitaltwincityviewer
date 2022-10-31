import {useState, useEffect, useMemo} from 'react';
import ObjectLoader from '@speckle/objectloader';
import {Observable} from '../lib/Observable';

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

// each loader wrapper will cache the nodes and nodeType groups. Note that the loader will also cache the object data
class BucketObjectLoader {
  serverUrl: string;
  baseId: string;
  objectId: string;
  loader: ObjectLoader;
  loadingProgress: number;
  nodeMap: {
    [objectId: string]: Node;
  };
  // groupMap: {
  //   [type: string]: Node;
  // };
  rootObject?: Node;

  // each bucket will have an object reference on the commit
  constructor(baseId: string, objectId: string, token: string) {
    this.serverUrl = 'https://speckle.pmtric.com';
    this.baseId = baseId;
    this.objectId = objectId;
    this.nodeMap = {};
    //this.groupMap = {};
    this.loadingProgress = 0;

    this.loader = new ObjectLoader({
      serverUrl: this.serverUrl,
      token,
      streamId: this.baseId,
      objectId: this.objectId,
      options: {enableCaching: true},
    });
  }

  // todo: remove grouping here, grouping must be later in the pipeline
  createNodeFromObject(object: any, isGroup = false) {
    const objectData: any = {};
    if (object.name || object.Name) {
      objectData.name = object.name || object.Name;
    }
    // ! since the type is number sometimes, use the name (which happens to be more of a type in that case)
    const type = Number.isInteger(object.type) ? objectData.name : object.type;
    if (object.description || object.Description) {
      objectData.description = object.description || object.Description;
    }
    if (object.tag || object.Tag) {
      objectData.tag = object.tag || object.Tag;
    }
    // const types = [type];
    // if (object.speckle_type) {
    //   types.push(object.speckle_type);
    // }
    return new Node({
      id: isGroup ? type : object.id,
      type: 'EntityNode',
      types: [type],
      data: objectData,
      collisionRadius: 10,
    });
  }

  async load(loadingProgress?: (progress: number) => void) {
    let first = true;
    let current = 0;
    let total = 0;
    for await (const object of this.loader.getObjectIterator()) {
      if (first) {
        this.rootObject = this.createNodeFromObject(object);
        first = false;
        total = object.totalChildrenCount;
      } else {
        // const type = object.type ? `${object.type}` : 'notype';
        // if (!this.groupMap[type]) {
        //   this.groupMap[type] = this.createNodeFromObject(object);
        // }
        this.nodeMap[object.id] = this.createNodeFromObject(object);
      }
      current++;
      this.loadingProgress = current / (total + 1);
      if (loadingProgress) {
        loadingProgress(this.loadingProgress);
      }
    }
  }
}

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
      loadBucket: async (streamId: string, objectId: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('token not set');
          return;
        }
        if (state[objectId]) {
          return state[objectId];
        }
        const bucketLoader = new BucketObjectLoader(streamId, objectId, token);
        bucketObjectStore.set({...state, [objectId]: bucketLoader});
        await bucketLoader.load((loadingProgress: number) => {
          bucketLoadingProgressStore.set({
            ...loadingState,
            [objectId]: loadingProgress * 100,
          });
          if (loadingProgress === 1) {
          }
        });
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
