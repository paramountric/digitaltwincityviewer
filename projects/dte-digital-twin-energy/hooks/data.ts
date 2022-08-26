import {useQuery} from 'react-query';

type ViewerData = any;

export const useData = (): {
  data: any;
  dataLoading: boolean;
} => {
  const dataUrl = '/api/data';
  const query = useQuery(
    'data',
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
