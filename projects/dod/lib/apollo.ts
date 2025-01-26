import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { useMemo } from 'react';
import { setContext } from '@apollo/client/link/context';

const SPECKLE_SERVER_URL = 'https://speckle.pmtric.com';

const authLink = setContext(async (_, { headers }) => {
  try {
    const tokenRes = await fetch('/api/auth/token');
    const tokenData = await tokenRes.json();
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization:
          tokenData && tokenData.token ? `Bearer ${tokenData.token}` : '',
      },
    };
  } catch (err) {
    return {
      headers,
    };
  }
});

const httpLink = new HttpLink({
  uri: `${SPECKLE_SERVER_URL}/graphql`,
  credentials: 'same-origin',
});

// todo: add to client side env

function createApolloClient() {
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}

export function useApollo() {
  const client = useMemo(() => createApolloClient(), []);
  return client;
}
