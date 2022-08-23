import {useMutation, useQuery, useQueryClient} from 'react-query';
import constants from '../config/constants';

const {USERINFO_QUERY_KEY, IS_DEV} = constants;

export const useSignOut = async () => {
  const queryClient = useQueryClient();
  const signOutUrl = '/auth/api/signout';

  const mutation = useMutation(async () => {
    const signOutRes = await fetch(signOutUrl);
    if (!signOutRes.ok) {
      throw new Error(`${signOutUrl} got ${signOutRes.status}`);
    }
    return await signOutRes.json();
  });
  return {
    signOut: async () => {
      try {
        await mutation.mutateAsync();
        queryClient.setQueryData(USERINFO_QUERY_KEY, undefined);
      } catch (e) {
        if (IS_DEV) {
          console.log(e);
        }
        throw new Error('Sign out failed');
      }
    },
  };
};
