import {useQuery} from 'react-query';

interface UserInfo {
  name: string;
  email: string;
}

export function useUserInfo() {
  const userUrl = '/api/user';
  const query = useQuery(
    'userinfo',
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
      staleTime: 60000,
    }
  );
  return query.data;
}
