import {useState, useEffect, useMemo} from 'react';
import {useQuery} from 'react-query';
import {Feature, FeatureCollection} from '@dtcv/geojson';
import {Observable} from '../lib/Observable';

type ViewerData = {
  modelMatrix: number[];
  buildings: Feature[];
};

export type BaseMapOption = {
  key: string;
  label: string;
  url: string;
};

type TimelineData = {
  total: number[];
  perM2: number[];
};

type DataStore = {
  baseMapKey: string;
  timelineData: TimelineData | null;
};

const baseMapKeyOptions: BaseMapOption[] = [
  // the first option will not load any file, but when selected it should remove the second file
  // the list is to prepare for loading a file for each option and have more than two options
  // (however as for now the 2020 data (buildings) is in the indicator file)
  {key: '2020', label: '2020', url: '/api/data/empty'},
  {key: '2050', label: '2050', url: '/api/data/basemap2050'},
];

function getBaseMapUrl(baseMapKey: string): string {
  return (
    baseMapKeyOptions.find(option => option.key === baseMapKey)?.url ||
    baseMapKeyOptions[0].url
  );
}

const dataStore = new Observable<DataStore>({
  baseMapKey: baseMapKeyOptions[0].key,
  timelineData: null,
});

// climate scenario data, one file loaded at start
export const useClimateScenarioData = () => {
  const dataUrl = '/api/data/scenario';
  const [dataState, setDataState] = useState(dataStore.get());

  useEffect(() => {
    return dataStore.subscribe(setDataState);
  }, []);

  const actions = useMemo(() => {
    return {
      setTimelineData: (timelineData: TimelineData | null) =>
        dataStore.set({...dataState, timelineData}),
    };
  }, [dataState]);

  const query = useQuery(
    'bsm-results',
    async () => {
      try {
        const res = await fetch(dataUrl);
        return await res.json();
      } catch (err) {
        return undefined;
      }
    },
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  // helper function to aggregate timeline data for bottom panel
  function updateTimelineData(
    propertyKey: string,
    selectedYear: string,
    features?: Feature[]
  ) {
    const timeResolution = 12;
    if (!query.data?.buildings && !features) {
      actions.setTimelineData(null);
      return;
    }
    try {
      const timelineFeatures = features || query.data.buildings;
      if (timelineFeatures.length === 0) {
        actions.setTimelineData(null);
        return;
      }
      const combinedKey = `${propertyKey}${selectedYear}`;
      const monthlyPropertyKey = `monthly${combinedKey
        .charAt(0)
        .toUpperCase()}${combinedKey.slice(1)}`;
      const sum = timelineFeatures.reduce(
        (acc: any, feature: Feature) => {
          if (!feature || !feature.properties) {
            return acc;
          }
          for (let i = 0; i < timeResolution; i++) {
            const propertyValue =
              feature.properties[monthlyPropertyKey][i] || 0;
            const floorArea = feature.properties?.heatedFloorArea || 0;
            acc[monthlyPropertyKey][i] += propertyValue;
            acc.floorArea[i] += floorArea;
          }
          return acc;
        },
        {
          [monthlyPropertyKey]: Array(timeResolution).fill(0),
          floorArea: Array(timeResolution).fill(0),
        }
      );
      actions.setTimelineData({
        total: sum[monthlyPropertyKey].map(
          (val: number, i: number) =>
            monthlyPropertyKey === 'ghgEmissions' ? val : val / 1000 // to MWh
        ),
        perM2: sum[monthlyPropertyKey].map((val: number, i: number) =>
          monthlyPropertyKey === 'ghgEmissions' ? val : val / sum.floorArea[i]
        ),
      });
    } catch (e) {
      actions.setTimelineData(null);
      return;
    }
  }

  return {
    data: query.data as ViewerData,
    state: dataState,
    actions,
    updateTimelineData,
    getFeature: (id: string) => {
      if (!query.data) {
        return undefined;
      }
      return query.data.buildings.find(
        (b: any) => b.id === id || b.properties?.uuid === id
      );
    },
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
};

// context data (surroundings) - protected
export const useContextData = () => {
  const dataUrl = '/api/data/context';
  const query = useQuery(
    'context-data',
    async () => {
      try {
        const res = await fetch(dataUrl);
        return await res.json();
      } catch (err) {
        return undefined;
      }
    },
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );
  return {
    data: query.data as FeatureCollection,
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
};

// this initially load an empty geojson, if baseMapKey is set to 2050 it will load the complementary future context
export const useBaseMapData = () => {
  const [dataState, setDataState] = useState(dataStore.get());

  useEffect(() => {
    return dataStore.subscribe(setDataState);
  }, []);

  const actions = useMemo(() => {
    return {
      setBaseMapKey: (baseMapKey: string) =>
        dataStore.set({...dataState, baseMapKey}),
    };
  }, [dataState]);

  // this is a complementary file to load 2050 addition for buildings
  const query = useQuery(
    'basemap-2050-data',
    async () => {
      try {
        const res = await fetch(getBaseMapUrl(dataState.baseMapKey));
        return await res.json();
      } catch (err) {
        return undefined;
      }
    },
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  useEffect(() => {
    query.refetch();
  }, [dataState.baseMapKey]);

  return {
    data: query.data as FeatureCollection,
    state: dataState,
    actions,
    getScenarioLabel: (selectKey?: string): string => {
      const key = selectKey || dataState.baseMapKey;
      return (
        baseMapKeyOptions.find(option => option.key === key)?.label ||
        'Select scenario'
      );
    },
    baseMapKeyOptions,
    refetch: query.refetch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
};

// open street map (not used currently)
export const usePublicData = () => {
  const dataUrl = '/api/data/public';
  const query = useQuery(
    'public-data',
    async () => {
      try {
        const res = await fetch(dataUrl);
        return await res.json();
      } catch (err) {
        return undefined;
      }
    },
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );
  return {
    data: query.data as ViewerData,
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
};
