import {useState, useEffect} from 'react';
import {useQuery} from 'react-query';
import {Feature} from '@dtcv/geojson';

type ViewerData = {
  modelMatrix: number[];
  buildings: Feature[];
};

type ScenarioOption = {
  key: string;
  label: string;
  url: string;
};

const scenarioKeyOptions: ScenarioOption[] = [
  {key: 'finalEnergy', label: 'Final energy', url: '/api/data/protected'},
];

function getScenarioUrl(scenarioKey: string): string {
  return (
    scenarioKeyOptions.find(option => option.key === scenarioKey)?.url ||
    scenarioKeyOptions[0].url
  );
}

export const useProtectedData = () => {
  const [scenarioKey, setScenarioKey] = useState<string>(
    scenarioKeyOptions[0].key
  );
  const query = useQuery(
    'protected-data',
    async () => {
      try {
        const res = await fetch(getScenarioUrl(scenarioKey));
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
    scenarioKey,
    setScenarioKey: (key: string) => {
      setScenarioKey(key);
      // refetch?
    },
    getScenarioLabel: (selectKey?: string): string => {
      const key = selectKey || scenarioKey;
      return (
        scenarioKeyOptions.find(option => option.key === key)?.label ||
        'Select scenario'
      );
    },
    scenarioKeyOptions,
    data: query.data as ViewerData,
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
};

export const usePublicData = (): ViewerData => {
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
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
  return query.data as ViewerData;
};
