import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SignIn {
  name: string;
  email: string;
  password: string;
}

export const useSignIn = (): {
  signIn: ({ name, email, password }: SignIn) => Promise<boolean>;
  signInError: boolean;
  signInLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const signInUrl = '/api/signin';
  const mutation = useMutation(async ({ name, email, password }: SignIn) => {
    const res = await fetch(signInUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      throw new Error('Sign in failed');
    }
    return await res.json();
  });
  return {
    signIn: async ({ name, email, password }: SignIn): Promise<boolean> => {
      try {
        const user = await mutation.mutateAsync({ name, email, password });
        queryClient.setQueryData(['user'], user);
        return true;
      } catch (err) {
        return false;
      }
    },
    signInError: mutation.isError,
    signInLoading: mutation.isLoading,
  };
};
