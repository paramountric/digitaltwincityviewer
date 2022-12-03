import {useMutation, useQueryClient} from '@tanstack/react-query';

export function useSignOut() {
  const queryClient = useQueryClient();
  const signoutUrl = '/api/signout';
  const mutation = useMutation(async () => {
    const res = await fetch(signoutUrl);
    if (!res.ok) {
      throw new Error('Sign in failed');
    }
    return await res.json();
  });
  return async () => {
    await mutation.mutateAsync();
    queryClient.setQueryData(['user'], undefined);
  };
}
