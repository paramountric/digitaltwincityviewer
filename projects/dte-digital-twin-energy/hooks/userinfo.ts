import {useQuery} from 'react-query';

interface UserInfo {
  userName: string;
  userEmail: string;
}

export function useUserInfo() {
  const userUrl = '/api/user';
  const query = useQuery(
    'user',
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
