import {useMutation, useQuery, useQueryClient} from 'react-query';
import constants from '../config/constants';

const {USERINFO_QUERY_KEY} = constants;

interface SignIn {
  email: string;
  password: string;
}

export const useSignIn = (): {
  signIn: ({email, password}: SignIn) => Promise<boolean>;
  signInError: boolean;
  signInLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const signInUrl = '/api/signin';
  const mutation = useMutation(async ({email, password}: SignIn) => {
    const res = await fetch(signInUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    });
    return await res.json();
  });
  return {
    signIn: async ({email, password}: SignIn): Promise<boolean> => {
      try {
        const user = await mutation.mutateAsync({email, password});
        queryClient.setQueryData(USERINFO_QUERY_KEY, user);
        return true;
      } catch (err) {
        return false;
      }
    },
    signInError: mutation.isError,
    signInLoading: mutation.isLoading,
  };
};
