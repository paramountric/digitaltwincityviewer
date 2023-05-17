import { useEffect, useMemo, useState } from 'react';
import { useSession } from './use-session';
import { useSignOut } from '../hooks/use-signout';
import { useSignIn } from '../hooks/use-signin';
import { Observable } from '../lib/Observable';
import getConfig from 'next/config';

const APP_ID = 'dte';

const { publicRuntimeConfig } = getConfig();

const authUrl = publicRuntimeConfig.authUrl;
const tokenUrl = publicRuntimeConfig.tokenUrl;

type User = {
  id?: string;
  name?: string;
  token?: string;
  email?: string;
};

const userStore = new Observable<User>({});

export function useUser() {
  const [user, setUser] = useState<User>(userStore.get());
  const userSession = useSession();
  const signOut = useSignOut();
  const signIn = useSignIn();

  useEffect(() => {
    // subscribe to the observable
    userStore.subscribe(setUser);

    // load user if token is already in local storage
    const storedToken = localStorage.getItem(APP_ID);

    if (storedToken) {
      const loadUser = async (token: any) => {
        const user = await fetchUser(token);
        setUser({ ...user, token });
      };
      loadUser(storedToken);
    }
  }, []);

  function objectToQueryString(obj: any) {
    const params = new URLSearchParams();

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        params.append(key, obj[key]);
      }
    }

    return params.toString();
  }

  const fetchUser = async (token: any) => {
    try {
      const res = await fetch(authUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (err) {
      return undefined;
    }
  };

  const userActions = useMemo(() => {
    return {
      setUser: async (initialUserData: User) => {
        try {
          const randomId = Math.random().toString(36).substring(7);
          const userData = Object.assign({}, initialUserData, {
            id: `user-${randomId}`,
            appId: APP_ID,
          });
          const url = `${tokenUrl}?${objectToQueryString(userData)}`;
          // Fetch a new token from the backend API
          const response = await fetch(url);
          const data = await response.json();
          const newToken = data.token;

          // Store the new token in the local storage
          localStorage.setItem(APP_ID, newToken);
          // Store the token in the observable
          const embeddedUserData = await fetchUser(newToken);
          userStore.set({ ...embeddedUserData, token: newToken });
        } catch (error) {
          console.error('Failed to fetch token:', error);
        }
      },
      removeUser: () => {
        localStorage.removeItem(APP_ID);
        userStore.set({});
      },
    };
  }, [user]);

  return { state: user, actions: userActions };
}
