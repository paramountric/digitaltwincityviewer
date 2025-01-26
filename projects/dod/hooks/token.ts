import { useQuery } from 'react-query';

export function useToken() {
  const userUrl = '/api/auth/token';
  const query = useQuery(
    'token',
    async () => {
      try {
        const res = await fetch(userUrl);
        const { token } = await res.json();
        return {
          token,
        };
      } catch (err) {
        return undefined;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: 30000,
    }
  );
  return query.data as {
    token: string;
  } | null;
}
