import { useQuery } from '@tanstack/react-query';

type UserInfo = {
  id: string;
  name: string;
  email: string;
};

export function useSession() {
  const userUrl = '/api/user';
  const query = useQuery(
    ['user'],
    async () => {
      try {
        const res = await fetch(userUrl);
        return await res.json();
      } catch (err) {
        return undefined;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: 30000,
    }
  );
  return query.data as UserInfo;
}
