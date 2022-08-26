import {useMutation, useQueryClient} from 'react-query';
import constants from '../config/constants';

const {USERINFO_QUERY_KEY} = constants;

export function useSignOut() {
  const queryClient = useQueryClient();
  const signoutUrl = '/api/auth/signout';
  const mutation = useMutation(async () => {
    const res = await fetch(signoutUrl);
    if (!res.ok) {
      throw new Error('Sign in failed');
    }
    return undefined;
  });
  return async () => {
    await mutation.mutateAsync();
    queryClient.setQueryData(USERINFO_QUERY_KEY, undefined);
  };
}
