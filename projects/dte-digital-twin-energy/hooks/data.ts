import {useState, useEffect, useMemo} from 'react';
import {useQuery} from 'react-query';
import {Feature} from '@dtcv/geojson';
import {Observable} from '../lib/Observable';

type ViewerData = {
  modelMatrix: number[];
  buildings: Feature[];
};

type ScenarioOption = {
  key: string;
  label: string;
  url: string;
};

type TimelineData = {
  total: number[];
  perM2: number[];
};

type DataStore = {
  scenarioKey: string;
  timelineData: TimelineData | null;
};

const scenarioKeyOptions: ScenarioOption[] = [
  {key: '2020', label: 'Current', url: '/api/data/protected'},
  {key: '2035', label: '2035', url: '/api/data/protected'},
  {key: '2055', label: '2055', url: '/api/data/protected'},
];

function getScenarioUrl(scenarioKey: string): string {
  return (
    scenarioKeyOptions.find(option => option.key === scenarioKey)?.url ||
    scenarioKeyOptions[0].url
  );
}

const dataStore = new Observable<DataStore>({
  scenarioKey: scenarioKeyOptions[0].key,
  timelineData: null,
});

export const useProtectedData = () => {
  const [dataState, setDataState] = useState(dataStore.get());

  useEffect(() => {
    return dataStore.subscribe(setDataState);
  }, []);

  const actions = useMemo(() => {
    return {
      setScenarioKey: (scenarioKey: string) =>
        dataStore.set({...dataState, scenarioKey}),
      setTimelineData: (timelineData: TimelineData | null) =>
        dataStore.set({...dataState, timelineData}),
    };
  }, [dataState]);

  const query = useQuery(
    'protected-data',
    async () => {
      try {
        const res = await fetch(getScenarioUrl(dataState.scenarioKey));
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
    // scenarioKey,
    // setScenarioKey: (key: string) => {
    //   setScenarioKey(key);
    //   // refetch?
    // },
    getScenarioLabel: (selectKey?: string): string => {
      const key = selectKey || dataState.scenarioKey;
      return (
        scenarioKeyOptions.find(option => option.key === key)?.label ||
        'Select scenario'
      );
    },
    scenarioKeyOptions,
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
