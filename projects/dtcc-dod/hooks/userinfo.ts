import {useQuery} from 'react-query';
import constants from '../config/constants';

const {USERINFO_QUERY_KEY, IS_DEV} = constants;

interface UserInfo {
  name: string;
  email: string;
}

export function useUserInfo() {
  const userUrl = '/api/user';
  const query = useQuery(
    USERINFO_QUERY_KEY,
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
  return query.data as UserInfo;
}
