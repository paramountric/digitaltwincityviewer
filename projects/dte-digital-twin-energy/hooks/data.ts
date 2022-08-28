import {useQuery} from 'react-query';
import {Feature} from '@dtcv/geojson';

type ViewerData = {
  modelMatrix: number[];
  buildings: Feature[];
};

export const useProtectedData = (): ViewerData => {
  const dataUrl = '/api/data/protected';
  const query = useQuery(
    'protected-data',
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
